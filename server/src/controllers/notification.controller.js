import PushSubscription from '../models/PushSubscription.model.js';
import Notification from '../models/Notification.model.js';
import webpush from 'web-push';

// VAPID keys for Web Push (generate with: npx web-push generate-vapid-keys)
// MUST be set in production environment variables!
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;

// Validate VAPID keys are set
if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
  console.error('❌ VAPID keys not set! Push notifications will NOT work.');
  console.error('Generate keys with: npx web-push generate-vapid-keys');
  console.error('Then set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY environment variables');
  
  if (process.env.NODE_ENV === 'production') {
    throw new Error('VAPID keys required in production!');
  }
}

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:support@dubu-chat.com',
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
  console.log('✅ Web Push configured with VAPID keys');
}

// Subscribe to push notifications
export const subscribeToPush = async (req, res) => {
  try {
    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
      return res.status(503).json({
        success: false,
        message: 'Push notifications not configured on server',
      });
    }
    
    const { endpoint, keys } = req.body;
    const userId = req.user._id;

    // Check if subscription already exists
    let subscription = await PushSubscription.findOne({ endpoint });

    if (subscription) {
      // Update existing subscription
      subscription.user = userId;
      subscription.keys = keys;
      subscription.userAgent = req.headers['user-agent'];
      subscription.lastUsed = new Date();
      await subscription.save();
    } else {
      // Create new subscription
      subscription = await PushSubscription.create({
        user: userId,
        endpoint,
        keys,
        userAgent: req.headers['user-agent'],
      });
    }

    res.status(200).json({
      success: true,
      message: 'Push subscription saved successfully',
    });
  } catch (error) {
    console.error('Error saving push subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save push subscription',
      error: error.message,
    });
  }
};

// Unsubscribe from push notifications
export const unsubscribeFromPush = async (req, res) => {
  try {
    const { endpoint } = req.body;

    await PushSubscription.deleteOne({ endpoint });

    res.status(200).json({
      success: true,
      message: 'Push subscription removed successfully',
    });
  } catch (error) {
    console.error('Error removing push subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove push subscription',
      error: error.message,
    });
  }
};

// Get missed notifications (undelivered notifications since last online)
export const getMissedNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const { since } = req.query; // Timestamp of last online

    const query = {
      user: userId,
      delivered: false,
    };

    if (since) {
      query.createdAt = { $gt: new Date(parseInt(since)) };
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    // Mark as delivered
    await Notification.updateMany(
      { _id: { $in: notifications.map(n => n._id) } },
      { $set: { delivered: true } }
    );

    res.status(200).json({
      success: true,
      notifications,
      count: notifications.length,
    });
  } catch (error) {
    console.error('Error fetching missed notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch missed notifications',
      error: error.message,
    });
  }
};

// Mark notifications as read
export const markAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { notificationIds } = req.body;

    await Notification.updateMany(
      { _id: { $in: notificationIds }, user: userId },
      { $set: { read: true } }
    );

    res.status(200).json({
      success: true,
      message: 'Notifications marked as read',
    });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notifications as read',
      error: error.message,
    });
  }
};

// Get unread notification count
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;

    const count = await Notification.countDocuments({
      user: userId,
      read: false,
    });

    res.status(200).json({
      success: true,
      count,
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unread count',
      error: error.message,
    });
  }
};

// Send push notification to user
export const sendPushToUser = async (userId, payload) => {
  try {
    // Get all push subscriptions for this user
    const subscriptions = await PushSubscription.find({ user: userId });

    if (subscriptions.length === 0) {
      console.log('No push subscriptions found for user:', userId);
      return;
    }

    // Store notification in database
    const notification = await Notification.create({
      user: userId,
      type: payload.type || 'message',
      title: payload.title,
      body: payload.body,
      data: payload.data || {},
    });

    // Send push notification to all devices
    const pushPromises = subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: subscription.keys,
          },
          JSON.stringify({
            title: payload.title,
            body: payload.body,
            icon: payload.icon || '/icon-192x192.png',
            badge: '/icon-192x192.png',
            data: {
              ...payload.data,
              notificationId: notification._id,
              url: payload.url || '/',
            },
          })
        );

        // Update last used timestamp
        subscription.lastUsed = new Date();
        await subscription.save();

        console.log('Push notification sent successfully to:', subscription.endpoint.substring(0, 50));
      } catch (error) {
        console.error('Error sending push to subscription:', error.message);

        // If subscription is invalid, remove it
        if (error.statusCode === 404 || error.statusCode === 410) {
          await PushSubscription.deleteOne({ _id: subscription._id });
          console.log('Removed invalid subscription');
        }
      }
    });

    await Promise.allSettled(pushPromises);
    return notification;
  } catch (error) {
    console.error('Error in sendPushToUser:', error);
    throw error;
  }
};

// Get VAPID public key
export const getVapidPublicKey = (req, res) => {
  if (!VAPID_PUBLIC_KEY) {
    return res.status(503).json({
      success: false,
      message: 'Push notifications not configured. VAPID keys missing.',
    });
  }
  
  res.status(200).json({
    success: true,
    publicKey: VAPID_PUBLIC_KEY,
  });
};
