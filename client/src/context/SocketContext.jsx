import React, { createContext, useContext, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import socketService from '../services/socket';
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

      // Listen for new messages
      socket.on('newMessage', ({ message, conversation }) => {
        console.log('📨 New Message Event:', {
          messageId: message._id,
          conversationId: conversation._id,
          status: message.status,
          content: message.content?.substring(0, 30)
        });
        addMessage(conversation._id, message);
        
        // Show notification if not in active conversation
        if (activeConversation?._id !== conversation._id) {
          incrementUnread(conversation._id);
          toast.success(`New message from ${message.sender.displayName}`);
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
      });

      socket.on('friendRequestAccepted', ({ user }) => {
        toast.success(`${user.displayName} accepted your friend request!`);
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
