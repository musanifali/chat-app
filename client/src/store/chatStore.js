import { create } from 'zustand';

export const useChatStore = create((set, get) => ({
  conversations: [],
  activeConversation: null,
  messages: {},
  unreadCount: {},
  onlineUsers: new Set(),

  setConversations: (conversations) => set({ conversations }),

  addConversation: (conversation) => set((state) => ({
    conversations: [conversation, ...state.conversations],
  })),

  setActiveConversation: (conversation) => set({ activeConversation: conversation }),

  setMessages: (conversationId, messages) => {
    console.log('💾 Setting messages for conversation:', conversationId, 'Count:', messages.length);
    if (messages.length > 0) {
      console.log('Last message status:', messages[messages.length - 1].status);
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
    console.log('🔄 Updating message:', { conversationId, messageId, updates });
    return set((state) => {
      const messages = state.messages[conversationId] || [];
      const updatedMessages = messages.map((msg) =>
        msg._id === messageId ? { ...msg, ...updates } : msg
      );
      console.log('Updated messages count:', updatedMessages.length);
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
    console.log('🟢 User came online:', userId);
    return set((state) => {
      const newOnlineUsers = new Set([...state.onlineUsers, userId]);
      console.log('Online users now:', Array.from(newOnlineUsers));
      return { onlineUsers: newOnlineUsers };
    });
  },

  setUserOffline: (userId) => {
    console.log('🔴 User went offline:', userId);
    return set((state) => {
      const newOnlineUsers = new Set(state.onlineUsers);
      newOnlineUsers.delete(userId);
      console.log('Online users now:', Array.from(newOnlineUsers));
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
