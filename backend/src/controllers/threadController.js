import pool from '../config/db.js';
import { getTasksByThreadId } from './taskController.js';
import { getContextsByThreadId } from './contextController.js';

export const getThreads = async (req, res) => {
    try {
        const { user_id } = req.user;

        const threadsResult = await pool.query(
            'SELECT * FROM threads WHERE user_id = $1 ORDER BY updated_at DESC',
            [user_id]
        );
        const threads = threadsResult.rows;

        if (threads.length === 0) {
            return res.json([]);
        }

        const threadIds = threads.map(t => t.thread_id);

        const peopleResult = await pool.query(`
            SELECT tp.thread_id, p.*
            FROM thread_people tp
            JOIN people p ON tp.person_id = p.person_id
            WHERE tp.thread_id = ANY($1::uuid[])
        `, [threadIds]);

        const allAssociatedPeople = peopleResult.rows;

        const threadsWithPeople = threads.map(thread => {
            const associated_people = allAssociatedPeople
                .filter(p => p.thread_id === thread.thread_id)
                .map(p => {
                    const { thread_id, ...personData } = p;
                    return personData;
                });

            return {
                ...thread,
                associated_people
            };
        });

        res.json(threadsWithPeople);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const createThread = async (req, res) => {
    try {
        const { user_id } = req.user;
        const { title, description, person_ids } = req.body;

        if (!title) {
            return res.status(400).json({ message: 'Title is required' });
        }

        const result = await pool.query(
            'INSERT INTO threads (user_id, title, description) VALUES ($1, $2, $3) RETURNING *',
            [user_id, title, description]
        );
        const thread = result.rows[0];

        if (person_ids && Array.isArray(person_ids) && person_ids.length > 0) {
            for (const person_id of person_ids) {
                await pool.query(
                    'INSERT INTO thread_people (thread_id, person_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
                    [thread.thread_id, person_id]
                );
            }
        }

        res.status(201).json(thread);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateThread = async (req, res) => {
    try {
        const { user_id } = req.user;
        const { id } = req.params;
        const { title, description, person_ids } = req.body;

        const result = await pool.query(
            'UPDATE threads SET title=$1, description=$2, updated_at=CURRENT_TIMESTAMP WHERE thread_id=$3 AND user_id=$4 RETURNING *',
            [title, description, id, user_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Thread not found or unauthorized' });
        }

        const thread = result.rows[0];

        await pool.query('DELETE FROM thread_people WHERE thread_id = $1', [id]);
        if (person_ids && Array.isArray(person_ids) && person_ids.length > 0) {
            for (const person_id of person_ids) {
                await pool.query(
                    'INSERT INTO thread_people (thread_id, person_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
                    [thread.thread_id, person_id]
                );
            }
        }

        res.json(thread);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteThread = async (req, res) => {
    try {
        const { user_id } = req.user;
        const { id } = req.params;

        const result = await pool.query(
            'DELETE FROM threads WHERE thread_id=$1 AND user_id=$2 RETURNING *',
            [id, user_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Thread not found or unauthorized' });
        }

        res.json({ message: 'Thread deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getThreadDetails = async (req, res) => {
    try {
        const { id } = req.query;
        const { user_id } = req.user;

        const threadResult = await pool.query('SELECT * FROM threads WHERE thread_id = $1 AND user_id = $2', [id, user_id]);
        if (threadResult.rows.length === 0) {
            return res.status(404).json({ message: 'Thread not found' });
        }
        const thread = threadResult.rows[0];

        const peopleResult = await pool.query(`
            SELECT p.*
            FROM thread_people tp
            JOIN people p ON tp.person_id = p.person_id
            WHERE tp.thread_id = $1
        `, [id]);
        const associated_people = peopleResult.rows;

        const contexts = await getContextsByThreadId(id);
        const tasks = await getTasksByThreadId(id);

        res.json({
            ...thread,
            associated_people,
            contexts,
            tasks
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getNeedsActionThreads = async (req, res) => {
    try {
        const { user_id } = req.user;

        const threadsResult = await pool.query(
            'SELECT * FROM threads WHERE user_id = $1 ORDER BY updated_at DESC',
            [user_id]
        );
        const threads = threadsResult.rows;

        if (threads.length === 0) {
            return res.json({ overdue: [], due_today: [], upcoming: [], inactive: [] });
        }

        const threadIds = threads.map(t => t.thread_id);

        const tasksResult = await pool.query(
            `SELECT * FROM tasks WHERE thread_id = ANY($1::uuid[]) AND status = 'pending' AND due_date IS NOT NULL`,
            [threadIds]
        );
        const pendingTasks = tasksResult.rows;

        const threadMap = {};
        threads.forEach(t => { threadMap[t.thread_id] = t; });

        const overdue = [];
        const due_today = [];
        const upcoming = [];
        const inactive = [];

        const now = new Date();
        now.setHours(0, 0, 0, 0);

        pendingTasks.forEach(task => {
            const taskDue = new Date(task.due_date);
            taskDue.setHours(0, 0, 0, 0);
            const entry = {
                thread_id: task.thread_id,
                thread_title: threadMap[task.thread_id]?.title || 'Untitled',
                thread_description: threadMap[task.thread_id]?.description,
                task_id: task.task_id,
                description: task.description,
                due_date: task.due_date
            };
            if (taskDue < now) {
                overdue.push(entry);
            } else if (taskDue.getTime() === now.getTime()) {
                due_today.push(entry);
            } else {
                upcoming.push(entry);
            }
        });

        const activityResult = await pool.query(
            `SELECT thread_id, MAX(created_at) as latest_activity FROM (
                SELECT thread_id, created_at FROM contexts WHERE thread_id = ANY($1::uuid[])
                UNION ALL
                SELECT thread_id, created_at FROM tasks WHERE thread_id = ANY($1::uuid[])
            ) combined GROUP BY thread_id`,
            [threadIds]
        );
        const activityMap = {};
        activityResult.rows.forEach(r => {
            activityMap[r.thread_id] = new Date(r.latest_activity);
        });

        threads.forEach(thread => {
            const hasPending = pendingTasks.some(t => t.thread_id === thread.thread_id);
            if (!hasPending) {
                let latestActivity = activityMap[thread.thread_id] || new Date(thread.updated_at);
                const daysSince = Math.floor((new Date() - latestActivity) / (1000 * 60 * 60 * 24));
                if (daysSince >= 15) {
                    inactive.push({ thread_id: thread.thread_id, title: thread.title, description: thread.description, inactive_days: daysSince });
                }
            }
        });

        res.json({ overdue, due_today, upcoming, inactive });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
