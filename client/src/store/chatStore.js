import { create } from 'zustand';
import logger from '../utils/logger';

export const useChatStore = create((set, get) => ({
  conversations: [],
  activeConversation: null,
  messages: {},
  unreadCount: {},
  onlineUsers: [], // Changed from Set to Array for React re-renders

  setConversations: (conversations) => set({ conversations }),

  addConversation: (conversation) => set((state) => ({
    conversations: [conversation, ...state.conversations],
  })),

  setActiveConversation: (conversation) => set({ activeConversation: conversation }),

  setMessages: (conversationId, messages) => {
    logger.log('💾 Setting messages for conversation:', conversationId, 'Count:', messages.length);
    if (messages.length > 0) {
      logger.log('Last message status:', messages[messages.length - 1].status);
    }
    return set((state) => ({
      messages: { ...state.messages, [conversationId]: messages },
    }));
  },

  addMessage: (conversationId, message) => set((state) => {
    const existingMessages = state.messages[conversationId] || [];
    return {
      messages: {
        ...state.messages,
        [conversationId]: [...existingMessages, message],
      },
    };
  }),

  updateMessage: (conversationId, messageId, updates) => {
    logger.log('🔄 Updating message:', { conversationId, messageId, updates });
    return set((state) => {
      const messages = state.messages[conversationId] || [];
      const updatedMessages = messages.map((msg) =>
        msg._id === messageId ? { ...msg, ...updates } : msg
      );
      logger.log('Updated messages count:', updatedMessages.length);
      return {
        messages: {
          ...state.messages,
          [conversationId]: updatedMessages,
        },
      };
    });
  },

  removeMessage: (conversationId, messageId) => set((state) => {
    const messages = state.messages[conversationId] || [];
    return {
      messages: {
        ...state.messages,
        [conversationId]: messages.filter((msg) => msg._id !== messageId),
      },
    };
  }),

  setUserOnline: (userId) => {
    logger.log('🟢 User came online:', userId);
    return set((state) => {
      if (!state.onlineUsers.includes(userId)) {
        const newOnlineUsers = [...state.onlineUsers, userId];
        logger.log('Online users now:', newOnlineUsers);
        return { onlineUsers: newOnlineUsers };
      }
      return state;
    });
  },

  setUserOffline: (userId) => {
    logger.log('🔴 User went offline:', userId);
    return set((state) => {
      const newOnlineUsers = state.onlineUsers.filter(id => id !== userId);
      logger.log('Online users now:', newOnlineUsers);
      return { onlineUsers: newOnlineUsers };
    });
  },

  incrementUnread: (conversationId) => set((state) => ({
    unreadCount: {
      ...state.unreadCount,
      [conversationId]: (state.unreadCount[conversationId] || 0) + 1,
    },
  })),

  clearUnread: (conversationId) => set((state) => ({
    unreadCount: { ...state.unreadCount, [conversationId]: 0 },
  })),
}));
