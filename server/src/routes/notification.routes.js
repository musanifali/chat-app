import express from 'express';
import * as notificationController from '../controllers/notification.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

// Get VAPID public key (no auth required)
router.get('/vapid-public-key', notificationController.getVapidPublicKey);

// All other routes require authentication
router.use(authMiddleware);

// Subscribe to push notifications
router.post('/subscribe', notificationController.subscribeToPush);

// Unsubscribe from push notifications
router.post('/unsubscribe', notificationController.unsubscribeFromPush);

// Get missed notifications
router.get('/missed', notificationController.getMissedNotifications);

// Mark notifications as read
router.put('/mark-read', notificationController.markAsRead);

// Get unread count
router.get('/unread-count', notificationController.getUnreadCount);

export default router;
