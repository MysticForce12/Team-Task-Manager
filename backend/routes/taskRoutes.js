import express from 'express';
import { createTask, getTasks, updateTaskStatus, deleteTask } from '../controllers/taskController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, admin, createTask)
  .get(protect, getTasks);

router.route('/:id')
  .delete(protect, admin, deleteTask);

router.route('/:id/status')
  .put(protect, updateTaskStatus);

export default router;
