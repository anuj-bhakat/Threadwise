import express from 'express';
import { createTask, updateTaskStatus, deleteTask } from '../controllers/taskController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', verifyToken, createTask);
router.put('/:task_id/status', verifyToken, updateTaskStatus);
router.delete('/:task_id', verifyToken, deleteTask);

export default router;
