import React, { useState, useRef } from 'react';
import { useSocket } from '../../context/SocketContext';
import VoiceRecorder from './VoiceRecorder';
import GifPicker from './GifPicker';
import StickerPicker from './StickerPicker';
import toast from 'react-hot-toast';

const MessageInput = ({ onSend, conversationId }) => {
  const [message, setMessage] = useState('');
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
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

  const handleGifSelect = (gifUrl) => {
    onSend(gifUrl, 'gif');
    toast.success('GIF sent! 🎬');
  };

  const handleStickerSelect = (sticker) => {
    // Send sticker as a special text message with emoji + label
    onSend(`${sticker.emoji} ${sticker.label}`, 'sticker');
    toast.success('Sticker sent! 🎨');
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
      className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 safe-bottom"
      style={{
        backgroundColor: '#fff5e6',
        borderTop: '4px solid black',
        boxShadow: '0 -4px 0 #FFD700',
        backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.08) 1px, transparent 1px)',\n        backgroundSize: '8px 8px',
        paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))'\n      }}
    >
      <form onSubmit={handleSubmit} className="flex items-center gap-1 sm:gap-2">
        <button
          type="button"
          onClick={() => setShowVoiceRecorder(true)}
          className="p-2 sm:p-3 transition-all hover:scale-110 flex-shrink-0"
          style={{
            backgroundColor: '#FFD700',
            border: '3px solid black',
            boxShadow: '3px 3px 0 black',
            borderRadius: '12px'
          }}
          title="Record voice message"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 sm:p-3 transition-all hover:scale-110 flex-shrink-0"
          style={{
            backgroundColor: '#FFD700',
            border: '3px solid black',
            boxShadow: '3px 3px 0 black',
            borderRadius: '12px'
          }}
          title="Send image"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </button>

        {/* GIF Button */}
        <button
          type="button"
          onClick={() => setShowGifPicker(true)}
          className="px-2 sm:px-3 py-2 sm:py-3 transition-all hover:scale-110 flex items-center justify-center"
          style={{
            backgroundColor: '#00D9FF',
            border: '3px solid black',
            boxShadow: '3px 3px 0 black',
            borderRadius: '12px'
          }}
          title="Send GIF"
        >
          <span className="text-xs sm:text-base font-black">GIF</span>
        </button>

        {/* Sticker Button */}
        <button
          type="button"
          onClick={() => setShowStickerPicker(true)}
          className="px-2 sm:px-3 py-2 sm:py-3 transition-all hover:scale-110 flex items-center justify-center"
          style={{
            backgroundColor: '#00D9FF',
            border: '3px solid black',
            boxShadow: '3px 3px 0 black',
            borderRadius: '12px'
          }}
          title="Send sticker"
        >
          <span className="text-base sm:text-xl">🎨</span>
        </button>

        <input
          type="text"
          value={message}
          onChange={handleTyping}
          placeholder="💬 Type..."
          className="flex-1 min-w-0 px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 text-sm sm:text-base focus:outline-none font-bold"
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
          className="px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 text-xs sm:text-sm md:text-base disabled:cursor-not-allowed disabled:opacity-50 transition-all font-black uppercase flex-shrink-0"
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

      {/* GIF Picker Modal */}
      {showGifPicker && (
        <GifPicker 
          onSelect={handleGifSelect}
          onClose={() => setShowGifPicker(false)}
        />
      )}

      {/* Sticker Picker Modal */}
      {showStickerPicker && (
        <StickerPicker
          onSelect={handleStickerSelect}
          onClose={() => setShowStickerPicker(false)}
        />
      )}
    </div>
  );
};

export default MessageInput;
