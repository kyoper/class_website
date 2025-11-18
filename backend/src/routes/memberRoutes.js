import express from 'express';
import { getMembers, getMemberById, createMember, updateMember, deleteMember } from '../controllers/memberController.js';
import { authenticate } from '../middleware/auth.js';
import { validate, memberSchema } from '../middleware/validation.js';

const router = express.Router();

router.get('/', getMembers);
router.get('/:id', getMemberById);
router.post('/', authenticate, validate(memberSchema), createMember);
router.put('/:id', authenticate, validate(memberSchema), updateMember);
router.delete('/:id', authenticate, deleteMember);

export default router;
