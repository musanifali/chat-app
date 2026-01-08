import express from 'express';
import {
  getProfile,
  updateProfile,
  uploadAvatar,
  searchUsers,
  getUserById,
} from '../controllers/user.controller.js';
import { authMiddleware } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.get('/me', authMiddleware, getProfile);
router.put('/me', authMiddleware, updateProfile);
router.post('/me/avatar', authMiddleware, upload.single('avatar'), uploadAvatar);
router.get('/search', authMiddleware, searchUsers);
router.get('/:id', authMiddleware, getUserById);

export default router;
