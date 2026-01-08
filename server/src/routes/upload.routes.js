import express from 'express';
import { uploadImage, uploadAudio } from '../controllers/upload.controller.js';
import { authMiddleware } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.post('/image', authMiddleware, upload.single('image'), uploadImage);
router.post('/audio', authMiddleware, upload.single('audio'), uploadAudio);

export default router;
