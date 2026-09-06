import express from 'express';
import { getThreads, getThreadDetails, createThread, updateThread, deleteThread, getNeedsActionThreads } from '../controllers/threadController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);

router.get('/', getThreads);
router.get('/needs-action', getNeedsActionThreads);
router.get('/details', getThreadDetails);
router.post('/', createThread);
router.put('/:id', updateThread);
router.delete('/:id', deleteThread);

export default router;
