import express from 'express';
import { createContext, updateContext, deleteContext } from '../controllers/contextController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', verifyToken, createContext);
router.put('/:id', verifyToken, updateContext);
router.delete('/:id', verifyToken, deleteContext);

export default router;
