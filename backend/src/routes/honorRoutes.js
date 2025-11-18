import express from 'express';
import { getHonors, getHonorById, createHonor, updateHonor, deleteHonor } from '../controllers/honorController.js';
import { authenticate } from '../middleware/auth.js';
import { validate, honorSchema } from '../middleware/validation.js';

const router = express.Router();

router.get('/', getHonors);
router.get('/:id', getHonorById);
router.post('/', authenticate, validate(honorSchema), createHonor);
router.put('/:id', authenticate, validate(honorSchema), updateHonor);
router.delete('/:id', authenticate, deleteHonor);

export default router;
