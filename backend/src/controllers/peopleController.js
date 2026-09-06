import pool from '../config/db.js';

export const getPeople = async (req, res) => {
    try {
        const { user_id } = req.user;
        const result = await pool.query('SELECT * FROM people WHERE user_id = $1 ORDER BY created_at DESC', [user_id]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const createPerson = async (req, res) => {
    try {
        const { user_id } = req.user;
        const { name, designation, organization, email, phone } = req.body;
        
        if (!name) {
            return res.status(400).json({ message: 'Name is required' });
        }

        const result = await pool.query(
            'INSERT INTO people (user_id, name, designation, organization, email, phone) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [user_id, name, designation, organization, email, phone]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updatePerson = async (req, res) => {
    try {
        const { user_id } = req.user;
        const { id } = req.params;
        const { name, designation, organization, email, phone } = req.body;

        const result = await pool.query(
            'UPDATE people SET name=$1, designation=$2, organization=$3, email=$4, phone=$5 WHERE person_id=$6 AND user_id=$7 RETURNING *',
            [name, designation, organization, email, phone, id, user_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Person not found or unauthorized' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const deletePerson = async (req, res) => {
    try {
        const { user_id } = req.user;
        const { id } = req.params;

        const result = await pool.query(
            'DELETE FROM people WHERE person_id=$1 AND user_id=$2 RETURNING *',
            [id, user_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Person not found or unauthorized' });
        }

        res.json({ message: 'Person deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
