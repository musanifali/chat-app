import React, { useState, useEffect } from 'react';
import notificationService from '../../services/notificationService';
import toast from 'react-hot-toast';

const NotificationSettings = () => {
  const [notificationPermission, setNotificationPermission] = useState(Notification.permission);
  const [isPushEnabled, setIsPushEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkPushStatus();
  }, []);

  const checkPushStatus = async () => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setIsPushEnabled(!!subscription);
      } catch (error) {
        console.error('Error checking push status:', error);
      }
    }
  };

  const handleEnableNotifications = async () => {
    setLoading(true);
    try {
      const success = await notificationService.subscribeToPush();
      
      if (success) {
        setNotificationPermission('granted');
        setIsPushEnabled(true);
        toast.success('🔔 Push notifications enabled!');
      } else {
        toast.error('Failed to enable notifications. Please check your browser settings.');
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      toast.error('Failed to enable notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleDisableNotifications = async () => {
    setLoading(true);
    try {
      await notificationService.unsubscribeFromPush();
      setIsPushEnabled(false);
      toast.success('Push notifications disabled');
    } catch (error) {
      console.error('Error disabling notifications:', error);
      toast.error('Failed to disable notifications');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border-4 border-black p-6 shadow-comic">
      <h2 className="text-2xl font-black mb-4">🔔 Notifications</h2>
      
      <div className="space-y-4">
        {/* Permission Status */}
        <div className="flex items-center justify-between p-4 bg-cream rounded-lg border-2 border-black">
          <div>
            <p className="font-bold">Notification Permission</p>
            <p className="text-sm text-gray-600">
              {notificationPermission === 'granted' && '✅ Enabled'}
              {notificationPermission === 'denied' && '❌ Blocked'}
              {notificationPermission === 'default' && '⚠️ Not set'}
            </p>
          </div>
        </div>

        {/* Push Notifications Toggle */}
        <div className="flex items-center justify-between p-4 bg-cream rounded-lg border-2 border-black">
          <div className="flex-1">
            <p className="font-bold">Push Notifications</p>
            <p className="text-sm text-gray-600">
              Get notifications even when the app is closed
            </p>
          </div>
          
          {notificationPermission === 'granted' ? (
            <button
              onClick={isPushEnabled ? handleDisableNotifications : handleEnableNotifications}
              disabled={loading}
              className={`px-4 py-2 rounded-lg border-2 border-black font-bold transition-transform active:scale-95 ${
                isPushEnabled
                  ? 'bg-red-400 hover:bg-red-500'
                  : 'bg-green-400 hover:bg-green-500'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? '...' : isPushEnabled ? 'Disable' : 'Enable'}
            </button>
          ) : notificationPermission === 'denied' ? (
            <p className="text-xs text-red-600 text-right max-w-xs">
              Notifications blocked. Please enable them in your browser settings.
            </p>
          ) : (
            <button
              onClick={handleEnableNotifications}
              disabled={loading}
              className="px-4 py-2 bg-blue-400 hover:bg-blue-500 rounded-lg border-2 border-black font-bold transition-transform active:scale-95"
            >
              {loading ? '...' : 'Enable'}
            </button>
          )}
        </div>

        {/* Info */}
        <div className="p-4 bg-yellow-100 rounded-lg border-2 border-black">
          <p className="text-sm font-semibold mb-2">💡 Why enable push notifications?</p>
          <ul className="text-xs space-y-1 ml-4">
            <li>• Get message alerts even when app is closed</li>
            <li>• Never miss important conversations</li>
            <li>• Works on mobile and desktop</li>
            <li>• Can be disabled anytime</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
