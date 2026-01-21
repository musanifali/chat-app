import React, { useState, useEffect } from 'react';
import notificationService from '../../services/notificationService';
import toast from 'react-hot-toast';

const NotificationSettings = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    Notification.permission === 'granted'
  );

  useEffect(() => {
    setNotificationsEnabled(Notification.permission === 'granted');
  }, []);

  const handleToggleNotifications = async () => {
    if (notificationsEnabled) {
      toast.error('To disable notifications, go to your browser settings');
      return;
    }

    const granted = await notificationService.requestPermission();
    setNotificationsEnabled(granted);

    if (granted) {
      toast.success('🔔 Notifications enabled!');
      // Show test notification
      notificationService.showNotification('Notifications Enabled!', {
        body: 'You\'ll now receive push notifications for new messages',
      });
    } else {
      toast.error('Notification permission denied');
    }
  };

  const handleTestNotification = () => {
    if (notificationsEnabled) {
      notificationService.showNotification('🎉 Test Notification', {
        body: 'Your notifications are working perfectly!',
      });
      notificationService.playNotificationSound();
      toast.success('Test notification sent!');
    } else {
      toast.error('Please enable notifications first');
    }
  };

  return (
    <div className="space-y-4">
      <div 
        className="p-4 rounded-lg"
        style={{
          backgroundColor: '#fff5e6',
          border: '3px solid black',
          boxShadow: '4px 4px 0 black',
        }}
      >
        <h3 className="text-xl font-black uppercase mb-4 flex items-center gap-2">
          🔔 Notifications
        </h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-black">Push Notifications</p>
              <p className="text-sm" style={{ color: '#666' }}>
                Get notified about new messages when the app is in the background
              </p>
            </div>
            <button
              onClick={handleToggleNotifications}
              className="px-4 py-2 font-black uppercase text-sm transition-transform hover:scale-105"
              style={{
                backgroundColor: notificationsEnabled ? '#00D9FF' : '#f0f0f0',
                color: notificationsEnabled ? 'black' : '#666',
                border: '2px solid black',
                borderRadius: '8px',
                boxShadow: '2px 2px 0 black',
              }}
            >
              {notificationsEnabled ? '✅ ON' : '❌ OFF'}
            </button>
          </div>

          {notificationsEnabled && (
            <button
              onClick={handleTestNotification}
              className="w-full px-4 py-2 font-black uppercase text-sm transition-transform hover:scale-105"
              style={{
                backgroundColor: '#FFD700',
                color: 'black',
                border: '2px solid black',
                borderRadius: '8px',
                boxShadow: '2px 2px 0 black',
              }}
            >
              🧪 Test Notification
            </button>
          )}

          <div 
            className="p-3 rounded-lg text-sm"
            style={{
              backgroundColor: '#f0f0f0',
              border: '2px solid black',
            }}
          >
            <p className="font-bold">ℹ️ Note:</p>
            <p style={{ color: '#666' }}>
              Notifications only work when the browser tab is in the background or minimized
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
