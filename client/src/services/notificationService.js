import api from './api';

// Notification service for web push notifications
class NotificationService {
  constructor() {
    this.permission = Notification.permission;
    this.pushSubscription = null;
    this.vapidPublicKey = null;
  }

  // Initialize push notifications
  async initialize() {
    try {
      // Get VAPID public key from backend
      const response = await api.get('/notifications/vapid-public-key');
      this.vapidPublicKey = response.data.publicKey;
      
      // Check if service worker supports push
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        const registration = await navigator.serviceWorker.ready;
        
        // Check existing subscription
        const existingSubscription = await registration.pushManager.getSubscription();
        
        if (existingSubscription) {
          this.pushSubscription = existingSubscription;
          console.log('Existing push subscription found');
        }
      }
      
      return true;
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
      return false;
    }
  }

  // Request notification permission
  async requestPermission() {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission === 'granted';
    }

    return false;
  }

  // Subscribe to push notifications
  async subscribeToPush() {
    try {
      // Request permission first
      const hasPermission = await this.requestPermission();
      if (!hasPermission) {
        console.log('Notification permission denied');
        return false;
      }

      if (!this.vapidPublicKey) {
        await this.initialize();
      }

      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.log('Push notifications not supported');
        return false;
      }

      const registration = await navigator.serviceWorker.ready;
      
      // Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey),
      });

      this.pushSubscription = subscription;

      // Send subscription to backend
      await api.post('/notifications/subscribe', {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')),
          auth: this.arrayBufferToBase64(subscription.getKey('auth')),
        },
      });

      console.log('Successfully subscribed to push notifications');
      return true;
    } catch (error) {
      console.error('Failed to subscribe to push:', error);
      return false;
    }
  }

  // Unsubscribe from push notifications
  async unsubscribeFromPush() {
    try {
      if (!this.pushSubscription) {
        return true;
      }

      // Unsubscribe from push manager
      await this.pushSubscription.unsubscribe();

      // Remove subscription from backend
      await api.post('/notifications/unsubscribe', {
        endpoint: this.pushSubscription.endpoint,
      });

      this.pushSubscription = null;
      console.log('Successfully unsubscribed from push notifications');
      return true;
    } catch (error) {
      console.error('Failed to unsubscribe from push:', error);
      return false;
    }
  }

  // Get missed notifications
  async getMissedNotifications(since) {
    try {
      const params = since ? { since } : {};
      const response = await api.get('/notifications/missed', { params });
      return response.data.notifications || [];
    } catch (error) {
      console.error('Failed to get missed notifications:', error);
      return [];
    }
  }

  // Mark notifications as read
  async markAsRead(notificationIds) {
    try {
      await api.put('/notifications/mark-read', { notificationIds });
      return true;
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
      return false;
    }
  }

  // Get unread count
  async getUnreadCount() {
    try {
      const response = await api.get('/notifications/unread-count');
      return response.data.count || 0;
    } catch (error) {
      console.error('Failed to get unread count:', error);
      return 0;
    }
  }

  // Show a notification
  showNotification(title, options = {}) {
    if (Notification.permission !== 'granted') {
      console.log('Notification permission not granted');
      return null;
    }

    const defaultOptions = {
      icon: '/logo.png',
      badge: '/logo.png',
      vibrate: [200, 100, 200],
      tag: 'chat-notification',
      requireInteraction: false,
      ...options
    };

    try {
      const notification = new Notification(title, defaultOptions);
      
      // Auto-close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

      return notification;
    } catch (error) {
      console.error('Error showing notification:', error);
      return null;
    }
  }

  // Show notification for new message
  async showMessageNotification(sender, messageContent, messageType = 'text', conversationId = null) {
    const icon = '/icon-192.png';
    const title = 'DuBu Chat';
    const body = 'You have a new message';
    
    // Use conversation ID as tag for grouping (same conversation = same notification updates)
    const notificationTag = conversationId ? `dubu-chat-conv-${conversationId}` : 'dubu-chat-message';

    // Try to use service worker for PWA notifications (more reliable on mobile)
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(title, {
          body,
          icon,
          badge: '/icon-192.png',
          vibrate: [200, 100, 200],
          tag: notificationTag, // Group by conversation
          renotify: true, // Vibrate even when replacing existing notification
          requireInteraction: false,
          data: {
            type: 'new-message',
            sender,
            conversationId,
            url: window.location.origin
          }
        });
        return true;
      } catch (error) {
        console.error('Service Worker notification failed:', error);
      }
    }

    // Fallback to regular notification API
    const notification = this.showNotification(title, {
      body,
      icon,
      data: {
        type: 'new-message',
        sender
      }
    });

    // Focus window when notification is clicked
    if (notification) {
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }

    return notification;
  }

  // Show notification for friend request
  showFriendRequestNotification(sender) {
    const notification = this.showNotification('👥 New Friend Request', {
      body: `${sender} wants to be your friend!`,
      data: {
        type: 'friend-request',
        sender
      }
    });

    if (notification) {
      notification.onclick = () => {
        window.focus();
        // Navigate to friends page
        window.location.hash = '/friends';
        notification.close();
      };
    }

    return notification;
  }

  // Show notification for friend request accepted
  showFriendRequestAcceptedNotification(sender) {
    return this.showNotification('✅ Friend Request Accepted', {
      body: `${sender} accepted your friend request!`,
      data: {
        type: 'friend-request-accepted',
        sender
      }
    });
  }

  // Show notification for online status
  showOnlineNotification(friendName) {
    return this.showNotification('🟢 Friend Online', {
      body: `${friendName} is now online`,
      data: {
        type: 'friend-online',
        friendName
      }
    });
  }

  // Play notification sound
  playNotificationSound() {
    try {
      const audio = new Audio('/notification-sound.mp3');
      audio.volume = 0.5;
      audio.play().catch(e => console.log('Could not play sound:', e));
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }

  // Helper: Convert VAPID key to Uint8Array
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Helper: Convert ArrayBuffer to Base64
  arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }
}

const notificationService = new NotificationService();

export default notificationService;
