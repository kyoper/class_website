import express from 'express';
import { getSchedule, updateSchedule } from '../controllers/scheduleController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getSchedule);
router.put('/', authenticate, updateSchedule);

export default router;
