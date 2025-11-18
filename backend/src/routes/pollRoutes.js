import express from 'express';
import * as pollController from '../controllers/pollController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// 公开路由
router.get('/', pollController.getAllPolls);
router.get('/:id', pollController.getPollById);
router.get('/:id/results', pollController.getPollResults);
router.get('/:id/check-voted', pollController.checkVoted);
router.post('/:id/vote', pollController.submitVote);

// 管理员路由
router.post('/', authenticate, pollController.createPoll);
router.put('/:id', authenticate, pollController.updatePoll);
router.delete('/:id', authenticate, pollController.deletePoll);

export default router;
