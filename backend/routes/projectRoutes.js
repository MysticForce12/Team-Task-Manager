import express from 'express';
import { createProject, getProjects, updateProject } from '../controllers/projectController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, admin, createProject)
  .get(protect, getProjects);

router.route('/:id')
  .put(protect, admin, updateProject);

export default router;
