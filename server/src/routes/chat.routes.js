import express from 'express';
import {
  getConversations,
  createOrGetConversation,
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  markAsRead,
  muteConversation,
} from '../controllers/chat.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/conversations', authMiddleware, getConversations);
router.post('/conversations', authMiddleware, createOrGetConversation);
router.get('/conversations/:id/messages', authMiddleware, getMessages);
router.post('/conversations/:id/messages', authMiddleware, sendMessage);
router.put('/messages/:id', authMiddleware, editMessage);
router.delete('/messages/:id', authMiddleware, deleteMessage);
router.post('/messages/:id/read', authMiddleware, markAsRead);
router.put('/conversations/:id/mute', authMiddleware, muteConversation);

export default router;
