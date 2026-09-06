import db from "../config/db.js";

export const createTask = async (req, res) => {
    const { thread_id, description, priority, due_date, person_ids } = req.body;

    try {
        await db.query('BEGIN');

        const taskQuery = `
            INSERT INTO tasks (thread_id, description, priority, due_date)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const taskResult = await db.query(taskQuery, [
            thread_id, 
            description, 
            priority || 'low', 
            due_date || null
        ]);
        const newTask = taskResult.rows[0];

        if (person_ids && person_ids.length > 0) {
            const values = person_ids.map((id, index) => `($1, $${index + 2})`).join(', ');
            const queryParams = [newTask.task_id, ...person_ids];
            await db.query(`
                INSERT INTO task_people (task_id, person_id)
                VALUES ${values}
            `, queryParams);
        }

        await db.query('COMMIT');
        
        const fullTaskQuery = `
            SELECT t.*, 
                   json_agg(json_build_object('person_id', p.person_id, 'name', p.name)) FILTER (WHERE p.person_id IS NOT NULL) as assignees
            FROM tasks t
            LEFT JOIN task_people tp ON t.task_id = tp.task_id
            LEFT JOIN people p ON tp.person_id = p.person_id
            WHERE t.task_id = $1
            GROUP BY t.task_id
        `;
        const fullTaskResult = await db.query(fullTaskQuery, [newTask.task_id]);

        res.status(201).json(fullTaskResult.rows[0]);
    } catch (error) {
        await db.query('ROLLBACK');
        console.error("Error creating task:", error);
        res.status(500).json({ error: "Failed to create task" });
    }
};

export const updateTaskStatus = async (req, res) => {
    const { task_id } = req.params;
    const { status } = req.body;

    try {
        let completedAt = null;
        if (status === 'completed') {
            completedAt = new Date();
        }

        const query = `
            UPDATE tasks 
            SET status = $1, completed_at = $2
            WHERE task_id = $3
            RETURNING *;
        `;
        const result = await db.query(query, [status, completedAt, task_id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Task not found" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error updating task status:", error);
        res.status(500).json({ error: "Failed to update task status" });
    }
};

export const deleteTask = async (req, res) => {
    const { task_id } = req.params;

    try {
        const query = `
            DELETE FROM tasks
            WHERE task_id = $1
            RETURNING *;
        `;
        const result = await db.query(query, [task_id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Task not found" });
        }
        
        res.json({ message: "Task deleted successfully" });
    } catch (error) {
        console.error("Error deleting task:", error);
        res.status(500).json({ error: "Failed to delete task" });
    }
};

export const getTasksByThreadId = async (thread_id) => {
    const tasksResult = await db.query('SELECT * FROM tasks WHERE thread_id = $1 ORDER BY created_at DESC', [thread_id]);
    const tasks = tasksResult.rows;

    if (tasks.length > 0) {
        const taskIds = tasks.map(t => t.task_id);
        const taskPeopleResult = await db.query(`
            SELECT tp.task_id, p.*
            FROM task_people tp
            JOIN people p ON tp.person_id = p.person_id
            WHERE tp.task_id = ANY($1::uuid[])
        `, [taskIds]);
        const allTaskPeople = taskPeopleResult.rows;

        tasks.forEach(task => {
            task.assignees = allTaskPeople
                .filter(p => p.task_id === task.task_id)
                .map(({ task_id, ...person }) => person);
        });
    }
    return tasks;
};
