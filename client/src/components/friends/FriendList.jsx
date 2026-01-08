import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '../../store/chatStore';
import api from '../../services/api';
import toast from 'react-hot-toast';

const FriendList = ({ friends, loading, onUpdate }) => {
  const navigate = useNavigate();
  const { setActiveConversation, addConversation } = useChatStore();
  const [menuOpen, setMenuOpen] = useState(null);

  const handleStartChat = async (friend) => {
    try {
      const response = await api.post('/chat/conversations', { userId: friend._id });
      const conversation = response.data.conversation;
      
      addConversation(conversation);
      setActiveConversation(conversation);
      navigate('/');
    } catch (error) {
      console.error('Start chat error:', error);
      toast.error('Failed to start conversation');
    }
  };

  const handleRemoveFriend = async (friendId) => {
    if (!confirm('Are you sure you want to remove this friend?')) return;

    try {
      await api.delete(`/friends/${friendId}`);
      toast.success('Friend removed');
      onUpdate?.();
    } catch (error) {
      console.error('Remove friend error:', error);
      toast.error('Failed to remove friend');
    }
  };

  const handleBlockUser = async (friendId) => {
    if (!confirm('Are you sure you want to block this user?')) return;

    try {
      await api.post(`/friends/block/${friendId}`);
      toast.success('User blocked');
      onUpdate?.();
    } catch (error) {
      console.error('Block user error:', error);
      toast.error('Failed to block user');
    }
  };

  if (loading) {
    return (
      <div 
        className="p-6"
        style={{
          backgroundColor: 'white',
          border: '3px solid black',
          borderRadius: '12px',
          boxShadow: '4px 4px 0 black'
        }}
      >
        <h2 className="text-2xl font-black mb-4 uppercase">FRIENDS</h2>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-black rounded-full animate-bounce"></div>
          <p className="text-sm font-bold">LOADING...</p>
        </div>
      </div>
    );
  }

  if (friends.length === 0) {
    return (
      <div 
        className="p-6 text-center"
        style={{
          backgroundColor: 'white',
          border: '3px solid black',
          borderRadius: '12px',
          boxShadow: '4px 4px 0 black'
        }}
      >
        <h2 className="text-2xl font-black mb-4 uppercase">FRIENDS</h2>
        <div className="text-6xl mb-3">👥</div>
        <p className="text-base font-bold">No friends yet. Start searching to add some! 🔍</p>
      </div>
    );
  }

  return (
    <div 
      className="p-6"
      style={{
        backgroundColor: 'white',
        border: '3px solid black',
        borderRadius: '12px',
        boxShadow: '4px 4px 0 black'
      }}
    >
      <h2 className="text-2xl font-black mb-4 uppercase">👥 FRIENDS ({friends.length})</h2>

      <div className="space-y-3">{friends.map((friend) => (
          <div 
            key={friend._id} 
            className="flex items-center justify-between p-3 transition-all animate-comic-pop"
            style={{
              backgroundColor: '#fff5e6',
              border: '2px solid black',
              borderRadius: '8px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#ffff00';
              e.currentTarget.style.transform = 'rotate(0.5deg) scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#fff5e6';
              e.currentTarget.style.transform = 'none';
            }}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div 
                  className="h-12 w-12 rounded-full flex items-center justify-center text-white font-black overflow-hidden"
                  style={{
                    backgroundColor: '#ff0000',
                    border: '3px solid black',
                    boxShadow: '2px 2px 0 black'
                  }}
                >
                  {friend.avatarUrl ? (
                    <img src={friend.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    friend.displayName[0].toUpperCase()
                  )}
                </div>
                {friend.isOnline && (
                  <div 
                    className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full animate-pulse"
                    style={{ border: '2px solid black' }}
                  ></div>
                )}
              </div>

              <div>
                <p className="font-black uppercase">{friend.displayName}</p>
                <p 
                  className="text-sm font-bold"
                  style={{ color: friend.isOnline ? '#00ff00' : '#666' }}
                >
                  {friend.isOnline ? '⚡ ONLINE' : 'OFFLINE'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleStartChat(friend)}
                className="p-2 transition-all hover:scale-110"
                style={{
                  backgroundColor: '#00ffff',
                  border: '2px solid black',
                  borderRadius: '8px',
                  boxShadow: '2px 2px 0 black'
                }}
                title="Start chat"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </button>

              <div className="relative">
                <button
                  onClick={() => setMenuOpen(menuOpen === friend._id ? null : friend._id)}
                  className="p-2 transition-all hover:scale-110"
                  style={{
                    backgroundColor: 'white',
                    border: '2px solid black',
                    borderRadius: '8px',
                    boxShadow: '2px 2px 0 black'
                  }}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>

                {menuOpen === friend._id && (
                  <div 
                    className="absolute right-0 mt-2 w-48 py-1 z-10 animate-comic-pop"
                    style={{
                      backgroundColor: 'white',
                      border: '3px solid black',
                      borderRadius: '8px',
                      boxShadow: '4px 4px 0 black'
                    }}
                  >
                    <button
                      onClick={() => {
                        handleRemoveFriend(friend._id);
                        setMenuOpen(null);
                      }}
                      className="w-full text-left px-4 py-2 text-sm font-bold transition-all"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#ffff00';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      ❌ REMOVE FRIEND
                    </button>
                    <button
                      onClick={() => {
                        handleBlockUser(friend._id);
                        setMenuOpen(null);
                      }}
                      className="w-full text-left px-4 py-2 text-sm font-bold transition-all"
                      style={{ color: '#ff0000' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#ffff00';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      🚫 BLOCK USER
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FriendList;
