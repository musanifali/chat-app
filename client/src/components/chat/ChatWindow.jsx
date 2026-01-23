import React, { useEffect, useState, useRef } from 'react';
import { Clock } from 'lucide-react';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';
import { useSocket } from '../../context/SocketContext';
import offlineService from '../../services/offlineService';
import api from '../../services/api';
import MessageItem from './MessageItem';
import MessageInput from './MessageInput';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';
import toast from 'react-hot-toast';

const ChatWindow = ({ onToggleSidebar }) => {
  const { activeConversation, messages, setMessages, addMessage, onlineUsers, paginationInfo, setPaginationInfo } = useChatStore();
  const { user } = useAuthStore();
  const socket = useSocket();
  const messagesEndRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    if (activeConversation) {
      fetchMessages();
      
      // Mark conversation as read when opened (only if app is visible)
      if (document.visibilityState === 'visible') {
        socket.emit('markConversationRead', { 
          conversationId: activeConversation._id 
        });
      }
      
      // Handle visibility change - mark as read when user returns to app
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible' && activeConversation) {
          // User returned to app - mark all unread messages in active conversation as read
          socket.emit('markConversationRead', { 
            conversationId: activeConversation._id 
          });
        }
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      // Listen for typing events
      socket.on('userTyping', ({ conversationId }) => {
        if (conversationId === activeConversation._id) {
          setTyping(true);
        }
      });

      socket.on('userStoppedTyping', ({ conversationId }) => {
        if (conversationId === activeConversation._id) {
          setTyping(false);
        }
      });

      // Listen for message status updates
      socket.on('messageStatusUpdate', ({ messageId, status }) => {
        setMessages(activeConversation._id, 
          messages[activeConversation._id]?.map(msg => 
            msg._id === messageId ? { ...msg, status } : msg
          )
        );
      });

      // Listen for delivered messages - mark as read only if user is viewing
      socket.on('messageDelivered', ({ messageId, conversationId }) => {
        // Only mark as read if:
        // 1. This is the active conversation
        // 2. App is visible (not in background)
        // 3. Document is focused
        if (conversationId === activeConversation._id && 
            document.visibilityState === 'visible' && 
            !document.hidden) {
          // User is actively viewing this conversation - mark as read
          socket.emit('messageRead', { messageId, conversationId });
        }
      });

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        socket.off('userTyping');
        socket.off('userStoppedTyping');
        socket.off('messageStatusUpdate');
        socket.off('messageDelivered');
      };
    }
  }, [activeConversation?._id, socket]);

  useEffect(() => {
    // Smooth scroll for new messages, instant scroll on first load
    if (messages[activeConversation?._id]?.length) {
      scrollToBottom();
    }
  }, [messages[activeConversation?._id]]);

  const fetchMessages = async (page = 1, append = false) => {
    try {
      const response = await api.get(`/chat/conversations/${activeConversation._id}/messages`, {
        params: { page, limit: 50 }
      });
      
      if (append) {
        // Append older messages for pagination
        const currentMessages = messages[activeConversation._id] || [];
        setMessages(activeConversation._id, [...response.data.messages, ...currentMessages]);
      } else {
        // Replace messages on initial load
        setMessages(activeConversation._id, response.data.messages);
        // Scroll to bottom after messages are loaded
        setTimeout(() => {
          scrollToBottom();
        }, 150);
      }
      
      // Store pagination info
      setPaginationInfo(activeConversation._id, {
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages,
        hasMore: response.data.currentPage < response.data.totalPages
      });
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const loadMoreMessages = async () => {
    if (!activeConversation || loadingMore) return;
    
    const pagination = paginationInfo[activeConversation._id];
    if (!pagination || !pagination.hasMore) return;
    
    setLoadingMore(true);
    try {
      const nextPage = pagination.currentPage + 1;
      await fetchMessages(nextPage, true);
    } catch (error) {
      console.error('Error loading more messages:', error);
      toast.error('Failed to load more messages');
    } finally {
      setLoadingMore(false);
    }
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      const container = messagesEndRef.current.parentElement;
      if (container) {
        // Force scroll to absolute bottom
        container.scrollTop = container.scrollHeight;
      }
    }
  };

  const handleSendMessage = (content, type = 'text', audioDuration = null) => {
    console.log('📤 Sending message:', {
      conversationId: activeConversation._id,
      content: content?.substring(0, 30),
      type
    });

    // Check if offline
    if (!offlineService.checkOnlineStatus()) {
      // Queue the message
      const queuedMessage = offlineService.queueMessage(
        activeConversation._id,
        content,
        type,
        audioDuration
      );
      
      toast.success('📦 Message queued - will send when online');
      return;
    }

    // Send normally if online
    socket.emit('sendMessage', {
      conversationId: activeConversation._id,
      content,
      type,
      audioDuration,
    });
  };

  const otherUser = activeConversation?.participants.find((p) => p._id !== user.id);
  const isOnline = onlineUsers.includes(otherUser?._id);
  const conversationMessages = messages[activeConversation?._id] || [];

  // Debug logging
  console.log('ChatWindow - Other User:', otherUser?._id, otherUser?.displayName);
  console.log('ChatWindow - Online Users Set:', Array.from(onlineUsers));
  console.log('ChatWindow - Is Online:', isOnline);
  console.log('ChatWindow - Messages Count:', conversationMessages.length);
  console.log('ChatWindow - Last Message Status:', conversationMessages[conversationMessages.length - 1]?.status);

  if (!activeConversation) return null;

  return (
    <div className="h-full w-full flex flex-col overflow-hidden" style={{ backgroundColor: '#fff5e6' }}>
      {/* Header */}
      <div 
        className="px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2 flex-shrink-0 z-10 overflow-hidden"
        style={{
          background: '#FFD700',
          borderBottom: '4px solid black',
          boxShadow: '0 4px 0 black',
          backgroundImage: 'radial-gradient(circle, rgba(255,0,0,0.15) 2px, transparent 2px)',
          backgroundSize: '12px 12px'
        }}
      >
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          {/* Mobile Menu Button */}
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="md:hidden flex-shrink-0 p-2 transition-all hover:scale-110"
              style={{
                backgroundColor: '#ff0000',
                border: '2px solid black',
                borderRadius: '8px',
                boxShadow: '2px 2px 0 black'
              }}
            >
              <svg className="w-5 h-5" fill="white" viewBox="0 0 24 24">
                <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
              </svg>
            </button>
          )}
          
          <div 
            className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center animate-comic-shake"
            style={{
              backgroundColor: '#9B59B6',
              border: '3px solid black',
              boxShadow: '2px 2px 0 black',
              color: 'white'
            }}
          >
            {otherUser?.avatarUrl ? (
              <img src={otherUser.avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
            ) : (
              <div className="text-sm sm:text-lg font-black">
                {otherUser?.displayName?.[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <h2 
            className="text-base sm:text-xl md:text-2xl font-black truncate uppercase min-w-0 flex-1"
            style={{
              color: 'black',
              textShadow: '2px 2px 0 rgba(0,0,0,0.2)',
              letterSpacing: '0.05em',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            @{otherUser?.displayName}
          </h2>
        </div>
        <div 
          className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-black uppercase px-2 sm:px-3 py-1 sm:py-1.5 rounded-full flex-shrink-0"
          style={{
            backgroundColor: isOnline ? '#00D9FF' : '#666',
            color: 'black',
            border: '2px solid black',
            boxShadow: '2px 2px 0 black'
          }}
        >
          {isOnline ? (
            <>
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-pulse"></div>
              <span className="hidden sm:inline">⚡ ONLINE</span>
              <span className="sm:hidden">⚡</span>
            </>
          ) : (
            <>
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full"></div>
              <span className="hidden sm:inline">OFFLINE</span>
              <span className="sm:hidden">OFF</span>
            </>
          )}
        </div>
      </div>

      {/* Messages */}
      <div 
        className="flex-1 overflow-y-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4 min-h-0 chat-messages"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.08) 1px, transparent 1px)',
          backgroundSize: '8px 8px',
          backgroundColor: '#fff5e6',
          scrollbarWidth: 'thin',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain'
        }}
      >
        {loading ? (
          <div className="text-center mt-8">
            <div className="inline-block bg-comic-yellow border-comic border-black rounded-comic px-6 py-3 shadow-comic">
              <p className="font-bangers text-2xl uppercase">Loading messages...</p>
            </div>
          </div>
        ) : conversationMessages.length === 0 ? (
          <div className="text-center mt-12 space-y-4">
            <div className="inline-block bg-white border-comic border-black rounded-comic px-8 py-6 shadow-comic-lg">
              <div className="text-5xl mb-3">💬</div>
              <p className="font-bangers text-3xl uppercase mb-2">No Messages Yet!</p>
              <p className="font-comic text-lg">Send a message to start!</p>
            </div>
          </div>
        ) : (
          <>
            {/* Load More Button */}
            {paginationInfo[activeConversation._id]?.hasMore && (
              <div className="text-center py-4">
                <button
                  onClick={loadMoreMessages}
                  disabled={loadingMore}
                  className="px-4 py-2 bg-comic-blue text-white font-bangers text-lg uppercase border-comic border-black rounded-comic shadow-comic hover:shadow-comic-lg transition-all disabled:opacity-50"
                >
                  {loadingMore ? '⏳ LOADING...' : '⬆️ LOAD MORE'}
                </button>
              </div>
            )}
            
            {conversationMessages.map((message) => (
              <MessageItem
                key={message._id}
                message={message}
                isOwn={message.sender._id === user.id}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Typing Indicator - Outside messages container */}
      {typing && (
        <div 
          className="flex justify-start px-3 sm:px-4 md:px-6 py-2 flex-shrink-0"
          style={{
            backgroundColor: '#fff5e6',
            borderTop: '2px solid rgba(0,0,0,0.1)'
          }}
        >
          <div 
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full animate-comic-pop"
            style={{
              background: '#00D9FF',
              border: '2px solid black',
              boxShadow: '2px 2px 0 black',
              transform: 'rotate(-0.5deg)'
            }}
          >
            <div className="flex gap-1">
              <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'black', animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'black', animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'black', animationDelay: '300ms' }} />
            </div>
            <span className="text-xs font-black uppercase" style={{ color: 'black' }}>
              ⌨️ TYPING...
            </span>
          </div>
        </div>
      )}

      {/* Input */}
      <MessageInput onSend={handleSendMessage} conversationId={activeConversation._id} />
    </div>
  );
};

export default ChatWindow;
