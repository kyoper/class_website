import express from 'express';
import { getMessages, createMessage, deleteMessage } from '../controllers/messageController.js';
import { authenticate } from '../middleware/auth.js';
import { validate, messageSchema } from '../middleware/validation.js';

const router = express.Router();

router.get('/', getMessages);
router.post('/', validate(messageSchema), createMessage);
router.delete('/:id', authenticate, deleteMessage);

export default router;
