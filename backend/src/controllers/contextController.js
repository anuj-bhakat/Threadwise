import db from "../config/db.js";

export const createContext = async (req, res) => {
    const { thread_id, content } = req.body;

    try {
        const query = `
            INSERT INTO contexts (thread_id, content)
            VALUES ($1, $2)
            RETURNING *;
        `;
        const result = await db.query(query, [thread_id, content]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Error creating context:", error);
        res.status(500).json({ error: "Failed to create context note" });
    }
};

export const updateContext = async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;

    try {
        const query = `
            UPDATE contexts
            SET content = $1
            WHERE context_id = $2
            RETURNING *;
        `;
        const result = await db.query(query, [content, id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Context note not found" });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error updating context:", error);
        res.status(500).json({ error: "Failed to update context note" });
    }
};

export const deleteContext = async (req, res) => {
    const { id } = req.params;

    try {
        const query = `
            DELETE FROM contexts
            WHERE context_id = $1
            RETURNING *;
        `;
        const result = await db.query(query, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Context note not found" });
        }
        
        res.json({ message: "Context note deleted successfully" });
    } catch (error) {
        console.error("Error deleting context:", error);
        res.status(500).json({ error: "Failed to delete context note" });
    }
};

export const getContextsByThreadId = async (thread_id) => {
    const result = await db.query('SELECT * FROM contexts WHERE thread_id = $1 ORDER BY created_at DESC', [thread_id]);
    return result.rows;
};
