import express from 'express';
import { createReminder, getUserReminders, dismissReminder, deleteReminder } from '../controllers/reminderController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);

router.post('/', createReminder);
router.get('/', getUserReminders);
router.put('/:id/dismiss', dismissReminder);
router.delete('/:id', deleteReminder);

export default router;
