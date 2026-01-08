import express from 'express';
import {
  getFriends,
  sendFriendRequest,
  getPendingRequests,
  respondToRequest,
  cancelRequest,
  removeFriend,
  blockUser,
  unblockUser,
} from '../controllers/friend.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authMiddleware, getFriends);
router.post('/request', authMiddleware, sendFriendRequest);
router.get('/requests', authMiddleware, getPendingRequests);
router.put('/request/:id', authMiddleware, respondToRequest);
router.delete('/request/:id', authMiddleware, cancelRequest);
router.delete('/:id', authMiddleware, removeFriend);
router.post('/block/:id', authMiddleware, blockUser);
router.delete('/block/:id', authMiddleware, unblockUser);

export default router;
