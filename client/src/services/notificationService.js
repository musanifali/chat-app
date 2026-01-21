// Notification service for web push notifications

class NotificationService {
  constructor() {
    this.permission = Notification.permission;
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
  async showMessageNotification(sender, messageContent, messageType = 'text') {
    let body = messageContent;
    let icon = '/icon-192.png';

    switch (messageType) {
      case 'image':
        body = '📷 Sent an image';
        break;
      case 'audio':
        body = '🎤 Sent a voice message';
        break;
      case 'gif':
        body = '🎬 Sent a GIF';
        break;
      case 'sticker':
        body = `🎨 ${messageContent}`;
        break;
      default:
        body = messageContent.length > 50 
          ? messageContent.substring(0, 50) + '...'
          : messageContent;
    }

    // Try to use service worker for PWA notifications (more reliable on mobile)
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(`💬 ${sender}`, {
          body,
          icon,
          badge: '/icon-192.png',
          vibrate: [200, 100, 200],
          tag: 'dubu-chat-message',
          requireInteraction: false,
          data: {
            type: 'new-message',
            sender,
            url: window.location.origin
          }
        });
        return true;
      } catch (error) {
        console.error('Service Worker notification failed:', error);
      }
    }

    // Fallback to regular notification API
    const notification = this.showNotification(`💬 ${sender}`, {
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
}

const notificationService = new NotificationService();

export default notificationService;
