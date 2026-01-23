import React, { createContext, useContext, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import socketService from '../services/socket';
import notificationService from '../services/notificationService';
import offlineService from '../services/offlineService';
import logger from '../utils/logger';
import toast from 'react-hot-toast';

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuthStore();
  const {
    addMessage,
    updateMessage,
    setUserOnline,
    setUserOffline,
    activeConversation,
    incrementUnread,
  } = useChatStore();

  useEffect(() => {
    if (isAuthenticated && token) {
      const socket = socketService.connect(token);

      // Initialize push notifications
      const initPushNotifications = async () => {
        try {
          await notificationService.initialize();
          
          // Request permission and subscribe to push
          const hasPermission = await notificationService.requestPermission();
          if (hasPermission) {
            await notificationService.subscribeToPush();
          }

          // Fetch missed notifications since last online
          const lastOnline = localStorage.getItem('lastOnline');
          if (lastOnline) {
            const missedNotifications = await notificationService.getMissedNotifications(lastOnline);
            
            // Show count if there are missed notifications
            if (missedNotifications.length > 0) {
              toast.success(`You have ${missedNotifications.length} new ${missedNotifications.length === 1 ? 'message' : 'messages'}!`, {
                duration: 5000,
                icon: '💬',
              });
            }
          }
          
          // Update last online time
          localStorage.setItem('lastOnline', Date.now().toString());
        } catch (error) {
          logger.error('Failed to initialize push notifications:', error);
        }
      };

      initPushNotifications();

      // Setup offline service callback
      offlineService.setSocketEmitCallback((message, callback) => {
        socket.emit('sendMessage', {
          conversationId: message.conversationId,
          content: message.content,
          type: message.type,
          audioDuration: message.audioDuration,
        });
        callback(true); // Assume success for now
      });

      // Process any queued messages when connecting
      if (offlineService.checkOnlineStatus()) {
        offlineService.processQueue();
      }

      // Listen for new messages
      socket.on('newMessage', ({ message, conversation }) => {
        logger.log('📨 New Message Event:', {
          messageId: message._id,
          conversationId: conversation._id,
          status: message.status,
          content: message.content?.substring(0, 30)
        });
        addMessage(conversation._id, message);
        
        // Check if user is actively in this conversation
        const isInActiveChat = activeConversation?._id === conversation._id;
        
        // Show notification if not in active conversation
        if (!isInActiveChat) {
          incrementUnread(conversation._id);
          
          // Check if app is visible
          const isAppVisible = document.visibilityState === 'visible';
          
          if (isAppVisible) {
            // App is visible but user is in different chat - show in-app toast
            toast.success(`New message from ${message.sender.displayName}`);
          } else {
            // App is in background - show notification with grouped tag
            notificationService.showMessageNotification(
              message.sender.displayName,
              message.content,
              message.type,
              conversation._id // Pass conversation ID for grouping
            );
            notificationService.playNotificationSound();
          }
        }
      });

      // Listen for message status updates
      socket.on('messageDelivered', ({ messageId, conversationId }) => {
        logger.log('📩 Message Delivered Event:', { messageId, conversationId });
        updateMessage(conversationId, messageId, { status: 'delivered' });
      });

      socket.on('messageRead', ({ messageId, conversationId }) => {
        logger.log('✅ Message Read Event:', { messageId, conversationId });
        updateMessage(conversationId, messageId, { status: 'read' });
      });

      // Listen for reaction updates
      socket.on('messageReactionUpdate', ({ messageId, conversationId, reactions }) => {
        console.log('💖 Reaction Update:', { messageId, reactions });
        updateMessage(conversationId, messageId, { reactions });
      });

      // Listen for message edits
      socket.on('messageEdited', ({ messageId, conversationId, content, isEdited, editedAt }) => {
        console.log('✏️ Message Edited:', { messageId, content });
        updateMessage(conversationId, messageId, { content, isEdited, editedAt });
      });

      // Listen for message deletions
      socket.on('messageDeleted', ({ messageId, conversationId, deletedForEveryone, deletedForMe }) => {
        console.log('🗑️ Message Deleted:', { messageId, deletedForEveryone, deletedForMe });
        if (deletedForEveryone) {
          updateMessage(conversationId, messageId, { 
            deletedForEveryone: true, 
            content: 'This message was deleted',
            type: 'text'
          });
        } else if (deletedForMe) {
          // Add current user to deletedFor array
          updateMessage(conversationId, messageId, { deletedFor: [useAuthStore.getState().user.id] });
        }
      });

      // Listen for online/offline status
      socket.on('userOnline', ({ userId }) => {
        console.log('User came online:', userId);
        setUserOnline(userId);
      });

      socket.on('userOffline', ({ userId }) => {
        console.log('User went offline:', userId);
        setUserOffline(userId);
      });

      // Set up listener BEFORE emitting request (to avoid race condition)
      socket.on('onlineUsersList', (data) => {
        console.log('📋 RAW data received:', data);
        console.log('📋 Received online users list:', data.userIds);
        if (data.userIds) {
          data.userIds.forEach(userId => setUserOnline(userId));
        }
      });

      // Request initial online users list AFTER listener is set up
      console.log('🔍 Requesting online users from backend...');
      socket.emit('getOnlineUsers');

      // Listen for friend requests
      socket.on('friendRequest', ({ fromUser }) => {
        toast.success(`Friend request from ${fromUser.displayName}`);
        notificationService.showFriendRequestNotification(fromUser.displayName);
        notificationService.playNotificationSound();
      });

      socket.on('friendRequestAccepted', ({ user }) => {
        toast.success(`${user.displayName} accepted your friend request!`);
        notificationService.showFriendRequestAcceptedNotification(user.displayName);
        notificationService.playNotificationSound();
      });

      // Cleanup function to remove ALL listeners and prevent memory leaks
      return () => {
        socket.off('newMessage');
        socket.off('messageDelivered');
        socket.off('messageRead');
        socket.off('messageReactionUpdate');
        socket.off('messageEdited');
        socket.off('messageDeleted');
        socket.off('userOnline');
        socket.off('userOffline');
        socket.off('onlineUsersList');
        socket.off('friendRequest');
        socket.off('friendRequestAccepted');
        socketService.disconnect();
      };
    }
  }, [isAuthenticated, token]);

  return (
    <SocketContext.Provider value={socketService}>
      {children}
    </SocketContext.Provider>
  );
};
