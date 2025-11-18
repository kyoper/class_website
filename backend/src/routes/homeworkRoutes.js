import express from 'express';
import { getHomework, getHomeworkById, createHomework, updateHomework, deleteHomework } from '../controllers/homeworkController.js';
import { authenticate } from '../middleware/auth.js';
import { validate, homeworkSchema } from '../middleware/validation.js';

const router = express.Router();

router.get('/', getHomework);
router.get('/:id', getHomeworkById);
router.post('/', authenticate, validate(homeworkSchema), createHomework);
router.put('/:id', authenticate, validate(homeworkSchema), updateHomework);
router.delete('/:id', authenticate, deleteHomework);

export default router;
