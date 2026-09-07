import db from "../config/db.js";

export const createReminder = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { task_id, reminder_time } = req.body;

    const taskQuery = await db.query(
      `SELECT th.user_id 
       FROM tasks t 
       JOIN threads th ON t.thread_id = th.thread_id 
       WHERE t.task_id = $1`,
      [task_id]
    );

    if (taskQuery.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (taskQuery.rows[0].user_id !== userId) {
      return res.status(403).json({ message: 'Unauthorized to add reminder to this task' });
    }

    const result = await db.query(
      `INSERT INTO reminders (task_id, user_id, reminder_time) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [task_id, userId, reminder_time]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating reminder:', error);
    res.status(500).json({ message: 'Server error creating reminder' });
  }
};

export const getUserReminders = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const result = await db.query(
      `SELECT r.*, t.description as task_description 
       FROM reminders r
       JOIN tasks t ON r.task_id = t.task_id
       WHERE r.user_id = $1 AND r.dismissed = FALSE AND r.reminder_time <= NOW()
       ORDER BY r.reminder_time DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching reminders:', error);
    res.status(500).json({ message: 'Server error fetching reminders' });
  }
};

export const dismissReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;
    const checkQuery = await db.query(
      'SELECT user_id FROM reminders WHERE reminder_id = $1',
      [id]
    );

    if (checkQuery.rows.length === 0) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    if (checkQuery.rows[0].user_id !== userId) {
      return res.status(403).json({ message: 'Unauthorized to dismiss this reminder' });
    }

    const result = await db.query(
      'UPDATE reminders SET dismissed = TRUE WHERE reminder_id = $1 RETURNING *',
      [id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error dismissing reminder:', error);
    res.status(500).json({ message: 'Server error dismissing reminder' });
  }
};

export const deleteReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;

    const checkQuery = await db.query(
      'SELECT user_id FROM reminders WHERE reminder_id = $1',
      [id]
    );

    if (checkQuery.rows.length === 0) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    if (checkQuery.rows[0].user_id !== userId) {
      return res.status(403).json({ message: 'Unauthorized to delete this reminder' });
    }

    await db.query('DELETE FROM reminders WHERE reminder_id = $1', [id]);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting reminder:', error);
    res.status(500).json({ message: 'Server error deleting reminder' });
  }
};
