import express from 'express';
import { getClassInfo, updateClassInfo } from '../controllers/classInfoController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getClassInfo);
router.put('/', authenticate, updateClassInfo);

export default router;
