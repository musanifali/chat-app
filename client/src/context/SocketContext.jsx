import React, { createContext, useContext, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import socketService from '../services/socket';
import notificationService from '../services/notificationService';
import offlineService from '../services/offlineService';
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

      // Request notification permission
      notificationService.requestPermission();

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
        console.log('📨 New Message Event:', {
          messageId: message._id,
          conversationId: conversation._id,
          status: message.status,
          content: message.content?.substring(0, 30)
        });
        addMessage(conversation._id, message);
        
        // Show notification if not in active conversation and tab is not focused
        if (activeConversation?._id !== conversation._id) {
          incrementUnread(conversation._id);
          toast.success(`New message from ${message.sender.displayName}`);
          
          // Show desktop notification if tab is not focused
          if (document.hidden) {
            notificationService.showMessageNotification(
              message.sender.displayName,
              message.content,
              message.type
            );
            notificationService.playNotificationSound();
          }
        }
      });

      // Listen for message status updates
      socket.on('messageDelivered', ({ messageId, conversationId }) => {
        console.log('📩 Message Delivered Event:', { messageId, conversationId });
        updateMessage(conversationId, messageId, { status: 'delivered' });
      });

      socket.on('messageRead', ({ messageId, conversationId }) => {
        console.log('✅ Message Read Event:', { messageId, conversationId });
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

      return () => {
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
