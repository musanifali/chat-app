import React from 'react';
import { MessageSquare } from 'lucide-react';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';

const ConversationList = ({ conversations, loading, onClose }) => {
  const { activeConversation, setActiveConversation, onlineUsers } = useChatStore();
  const { user: currentUser } = useAuthStore();

  const getOtherParticipant = (conversation) => {
    return conversation.participants.find((p) => p._id !== currentUser?._id);
  };

  const handleSelectConversation = (conversation) => {
    setActiveConversation(conversation);
    if (onClose) onClose(); // Close mobile sidebar
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center p-6" style={{ backgroundColor: '#fff5e6' }}>
        <div className="text-center space-y-6 animate-pulse">
          <div 
            className="inline-block p-6 rounded-full"
            style={{
              backgroundColor: '#FFD700',
              border: '4px solid black',
              boxShadow: '6px 6px 0 black',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }}
          >
            <MessageSquare className="w-12 h-12 text-black animate-spin" strokeWidth={3} />
          </div>
          <div>
            <p 
              className="text-3xl font-black uppercase"
              style={{
                color: 'black',
                textShadow: '3px 3px 0 rgba(0,0,0,0.2)',
                letterSpacing: '0.1em'
              }}
            >
              ⚡ LOADING... ⚡
            </p>
            <div className="flex justify-center gap-2 mt-4">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce" style={{ border: '2px solid black', animationDelay: '0ms' }}></div>
              <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce" style={{ border: '2px solid black', animationDelay: '150ms' }}></div>
              <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce" style={{ border: '2px solid black', animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-6" style={{ backgroundColor: '#fff5e6' }}>
        <div className="text-center space-y-6 max-w-xs">
          <div className="flex justify-center">
            <div 
              className="p-8 rounded-full relative"
              style={{
                backgroundColor: '#ff0000',
                border: '4px solid black',
                boxShadow: '8px 8px 0 black',
                transform: 'rotate(-5deg)'
              }}
            >
              <MessageSquare className="w-16 h-16 text-yellow-300" strokeWidth={3} />
              <div 
                className="absolute -top-3 -right-3 w-12 h-12 flex items-center justify-center rounded-full"
                style={{
                  backgroundColor: '#FFD700',
                  border: '3px solid black',
                  boxShadow: '3px 3px 0 black',
                  transform: 'rotate(15deg)'
                }}
              >
                <span className="text-2xl">😢</span>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <p 
              className="text-3xl font-black uppercase"
              style={{
                color: '#ff0000',
                textShadow: '3px 3px 0 black',
                WebkitTextStroke: '1px black',
                letterSpacing: '0.05em'
              }}
            >
              💥 NO CHATS! 💥
            </p>
            <p className="text-lg text-gray-800 font-bold">
              Add some friends and start chatting! 🚀
            </p>
            <div 
              className="mt-4 p-3 rounded-lg"
              style={{
                backgroundColor: '#FFD700',
                border: '3px solid black',
                boxShadow: '3px 3px 0 black',
                transform: 'rotate(1deg)'
              }}
            >
              <p className="text-sm font-black uppercase">
                👉 Go to FRIENDS tab! 👈
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="h-full flex flex-col"
      style={{ 
        backgroundColor: '#fff5e6',
        backgroundImage: 'radial-gradient(circle, rgba(255,0,0,0.15) 1.5px, transparent 1.5px)',
        backgroundSize: '12px 12px'
      }}
    >
      {/* Header */}
      <div 
        className="p-4 relative overflow-hidden flex-shrink-0"
        style={{
          background: '#FFD700',
          borderBottom: '4px solid black',
          boxShadow: '0 4px 0 black',
          backgroundImage: 'radial-gradient(circle, rgba(255,0,0,0.15) 2px, transparent 2px)',
          backgroundSize: '12px 12px'
        }}
      >
        <div className="relative z-10">
          <h2 
            className="text-2xl font-black uppercase tracking-wider text-black flex items-center gap-2"
            style={{ textShadow: '3px 3px 0 rgba(0,0,0,0.2)' }}
          >
            <span className="animate-bounce inline-block">💬</span>
            <span>MESSAGES</span>
            <span className="animate-bounce inline-block" style={{ animationDelay: '0.2s' }}>💬</span>
          </h2>
          <p className="text-xs font-bold text-gray-800 mt-1 uppercase">
            {conversations.length} {conversations.length === 1 ? 'Chat' : 'Chats'} Active 🔥
          </p>
        </div>
        {/* Decorative comic burst */}
        <div 
          className="absolute -right-4 -bottom-4 w-16 h-16 opacity-20"
          style={{
            background: 'radial-gradient(circle, #ff0000 0%, transparent 70%)',
            transform: 'rotate(45deg)'
          }}
        />
      </div>

      {/* Conversations list */}
      <div 
        className="flex-1 overflow-y-auto p-3 space-y-3"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {conversations.map((conversation, index) => {
          const otherUser = getOtherParticipant(conversation);
          const isOnline = onlineUsers.has(otherUser?._id);
          const isActive = activeConversation?._id === conversation._id;

          return (
            <div
              key={conversation._id}
              onClick={() => handleSelectConversation(conversation)}
              className="cursor-pointer transition-all group"
              style={{
                background: isActive 
                  ? '#00D9FF' 
                  : 'white',
                border: '3px solid black',
                boxShadow: isActive ? '4px 4px 0 black' : '2px 2px 0 black',
                transform: isActive ? 'rotate(-0.5deg) scale(1.02)' : 'rotate(0deg)',
                borderRadius: '12px',
                padding: '14px',
                animation: `fadeIn 0.3s ease-out ${index * 0.1}s both`
              }}
              onMouseEnter={(e) => { 
                if (!isActive) {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #c084fc 0%, #f9a8d4 100%)';
                  e.currentTarget.style.transform = 'rotate(1deg) scale(1.03)';
                  e.currentTarget.style.boxShadow = '4px 4px 0 black';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.transform = 'rotate(0deg) scale(1)';
                  e.currentTarget.style.boxShadow = '2px 2px 0 black';
                }
              }}
            >
              <div className="flex items-center gap-3">
                {/* Avatar with online indicator */}
                <div className="relative flex-shrink-0">
                  <div 
                    className="w-12 h-12 rounded-full overflow-hidden transform transition-transform group-hover:scale-110"
                    style={{
                      border: '3px solid black',
                      boxShadow: '3px 3px 0 black',
                      background: otherUser?.avatarUrl ? 'transparent' : '#9B59B6'
                    }}
                  >
                    {otherUser?.avatarUrl ? (
                      <img src={otherUser.avatarUrl} alt={otherUser.displayName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-black text-lg">
                        {otherUser?.displayName?.[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  {isOnline && (
                    <div 
                      className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{
                        backgroundColor: '#00D9FF',
                        border: '2px solid black',
                        boxShadow: '0 0 0 2px white, 2px 2px 0 2px black'
                      }}
                    >
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    </div>
                  )}
                </div>

                {/* Message info */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1 gap-2">
                    <h3 
                      className="text-base font-black uppercase text-black truncate flex-1"
                      style={{ 
                        textShadow: '1px 1px 0 rgba(0,0,0,0.1)',
                        letterSpacing: '0.03em'
                      }}
                    >
                      {otherUser?.displayName}
                      {isActive && <span className="ml-2 text-xs">⚡</span>}
                    </h3>
                    {conversation.lastMessage?.timestamp && (
                      <span 
                        className="text-xs font-bold flex-shrink-0 px-2 py-0.5 rounded"
                        style={{
                          backgroundColor: isActive ? 'rgba(0,0,0,0.1)' : '#f9a8d4',
                          border: '1px solid black',
                          color: 'black'
                        }}
                      >
                        {formatDistanceToNow(new Date(conversation.lastMessage.timestamp), { addSuffix: true }).replace('about ', '').replace(' ago', '')}
                      </span>
                    )}
                  </div>
                  <p 
                    className="text-sm truncate font-bold flex items-center gap-1"
                    style={{ 
                      color: isActive ? 'rgba(0,0,0,0.8)' : '#555' 
                    }}
                  >
                    {conversation.lastMessage?.type === 'voice' && '🎤 '}
                    {conversation.lastMessage?.type === 'image' && '📷 '}
                    {conversation.lastMessage?.text || '💬 Start chatting!'}
                  </p>
                </div>
              </div>
              
              {/* Unread badge */}
              {conversation.unreadCount > 0 && (
                <div 
                  className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black animate-pulse"
                  style={{
                    backgroundColor: '#ff0000',
                    border: '2px solid black',
                    boxShadow: '2px 2px 0 black',
                    color: 'white',
                    textShadow: '1px 1px 0 black'
                  }}
                >
                  {conversation.unreadCount}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ConversationList;
