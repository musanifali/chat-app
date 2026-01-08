import React, { useState, useRef } from 'react';
import { useSocket } from '../../context/SocketContext';
import VoiceRecorder from './VoiceRecorder';
import toast from 'react-hot-toast';

const MessageInput = ({ onSend, conversationId }) => {
  const [message, setMessage] = useState('');
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const socket = useSocket();
  const fileInputRef = useRef(null);

  const handleTyping = (e) => {
    setMessage(e.target.value);

    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Emit typing event
    socket.emit('typing', { conversationId });

    // Set new timeout to stop typing
    const timeout = setTimeout(() => {
      socket.emit('stopTyping', { conversationId });
    }, 3000);

    setTypingTimeout(timeout);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!message.trim()) return;

    onSend(message.trim());
    setMessage('');
    
    // Stop typing
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    socket.emit('stopTyping', { conversationId });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/upload/image`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      const data = await response.json();
      
      if (data.success && data.data.url) {
        onSend(data.data.url, 'image');
        toast.success('Image sent');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error('Failed to upload image');
    }
  };

  const handleVoiceSend = (audioUrl, type, duration) => {
    onSend(audioUrl, type, duration);
    setShowVoiceRecorder(false);
  };

  if (showVoiceRecorder) {
    return (
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <VoiceRecorder
          onSend={handleVoiceSend}
          onCancel={() => setShowVoiceRecorder(false)}
        />
      </div>
    );
  }

  return (
    <div 
      className="px-6 py-4"
      style={{
        backgroundColor: '#fff5e6',
        borderTop: '4px solid black',
        boxShadow: '0 -4px 0 #ffff00',
        backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.08) 1px, transparent 1px)',
        backgroundSize: '8px 8px'
      }}
    >
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowVoiceRecorder(true)}
          className="px-3 py-3 transition-all hover:scale-110"
          style={{
            backgroundColor: '#ffff00',
            border: '3px solid black',
            boxShadow: '3px 3px 0 black',
            borderRadius: '12px'
          }}
          title="Record voice message"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="px-3 py-3 transition-all hover:scale-110"
          style={{
            backgroundColor: '#ffff00',
            border: '3px solid black',
            boxShadow: '3px 3px 0 black',
            borderRadius: '12px'
          }}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />

        <input
          type="text"
          value={message}
          onChange={handleTyping}
          placeholder="💬 Type a message..."
          className="flex-1 px-4 py-3 focus:outline-none font-bold"
          style={{
            backgroundColor: 'white',
            border: '3px solid black',
            boxShadow: '3px 3px 0 black',
            borderRadius: '15px',
            transform: 'rotate(-0.5deg)'
          }}
          onFocus={(e) => { 
            e.currentTarget.style.borderColor = '#ff0000'; 
            e.currentTarget.style.transform = 'rotate(0deg) scale(1.02)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'black';
            e.currentTarget.style.transform = 'rotate(-0.5deg) scale(1)';
          }}
        />

        <button
          type="submit"
          disabled={!message.trim()}
          className="px-2 sm:px-6 py-2 text-xs sm:text-base disabled:cursor-not-allowed disabled:opacity-50 transition-all font-black uppercase min-w-[60px] sm:min-w-[100px]"
          style={{
            backgroundColor: message.trim() ? '#ff0000' : '#9ca3af',
            color: 'white',
            border: '3px solid black',
            boxShadow: '3px 3px 0 black',
            borderRadius: '15px',
            transform: 'rotate(1deg)',
            textShadow: '2px 2px 0 black'
          }}
          onMouseEnter={(e) => { 
            if (message.trim()) {
              e.currentTarget.style.transform = 'rotate(1deg) scale(1.05)';
            }
          }}
          onMouseLeave={(e) => { 
            e.currentTarget.style.transform = 'rotate(1deg) scale(1)';
          }}
        >
          <span className="hidden sm:inline">⚡ SEND!</span>
          <span className="sm:hidden">⚡</span>
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
