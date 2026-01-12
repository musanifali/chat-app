import React, { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { useChatStore } from '../store/chatStore';
import api from '../services/api';
import ConversationList from '../components/chat/ConversationList';
import ChatWindow from '../components/chat/ChatWindow';
import toast from 'react-hot-toast';

const Home = () => {
  const { conversations, setConversations, activeConversation } = useChatStore();
  const [loading, setLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await api.get('/chat/conversations');
      setConversations(response.data.conversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] w-screen flex bg-comic-cream overflow-hidden">
      {/* Mobile Overlay */}
      {showSidebar && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`
          fixed md:relative
          w-80 max-w-[85vw]
          h-full
          bg-white
          z-50
          transition-transform duration-300
          ${
            showSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }
        `}
        style={{
          borderRight: '4px solid black',
          boxShadow: '4px 0 0 black'
        }}
      >
        <ConversationList 
          conversations={conversations} 
          loading={loading}
          onClose={() => setShowSidebar(false)}
        />
      </div>

      {/* Chat area */}
      <div className="flex-1 bg-halftone min-w-0 h-full overflow-hidden flex flex-col">
        {activeConversation ? (
          <ChatWindow onToggleSidebar={() => setShowSidebar(!showSidebar)} />
        ) : (
          <div className="h-full flex items-center justify-center p-4">
            <div className="text-center space-y-4 sm:space-y-6 max-w-md px-4 sm:px-6">
              <div className="flex justify-center">
                <div 
                  className="p-6 sm:p-8 rounded-full relative"
                  style={{
                    backgroundColor: '#ff0000',
                    border: '4px solid black',
                    boxShadow: '6px 6px 0 black'
                  }}
                >
                  <MessageCircle className="w-12 h-12 sm:w-16 sm:h-16 text-yellow-300" strokeWidth={3} />
                  <div 
                    className="absolute -top-2 -right-2 px-2 sm:px-3 py-1 text-xs sm:text-sm font-black uppercase"
                    style={{
                      backgroundColor: '#FFD700',
                      border: '2px solid black',
                      borderRadius: '999px',
                      transform: 'rotate(12deg)'
                    }}
                  >
                    NEW!
                  </div>
                </div>
              </div>
              <div className="space-y-2 sm:space-y-3">
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-wider text-black">
                  SELECT A CHAT!
                </h3>
                <p className="text-base sm:text-lg text-gray-700 font-bold">
                  Pick a friend and start chatting! �
                </p>
                <button
                  onClick={() => setShowSidebar(true)}
                  className="md:hidden mt-4 px-6 py-3 font-black uppercase text-sm transition-all hover:scale-105"
                  style={{
                    backgroundColor: '#ffff00',
                    border: '3px solid black',
                    borderRadius: '12px',
                    boxShadow: '3px 3px 0 black'
                  }}
                >
                  📱 OPEN CHATS
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
