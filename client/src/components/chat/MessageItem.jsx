import React, { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import AudioMessage from './AudioMessage';
import ReactionPicker from './ReactionPicker';
import MessageContextMenu from './MessageContextMenu';
import { useSocket } from '../../context/SocketContext';
import { useAuthStore } from '../../store/authStore';

const MessageItem = ({ message, isOwn }) => {
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);
  const { socket } = useSocket();
  const { user } = useAuthStore();
  const messageRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleContextMenu = (e) => {
    e.preventDefault();
    setContextMenuPosition({ x: e.pageX, y: e.pageY });
    setShowContextMenu(true);
  };

  const handleReaction = (emoji) => {
    const existingReaction = message.reactions?.find(r => r.emoji === emoji);
    const hasReacted = existingReaction?.users?.some(userId => userId === user.id);

    socket.emit('messageReaction', {
      messageId: message._id,
      emoji,
      action: hasReacted ? 'remove' : 'add',
    });

    setShowReactionPicker(false);
  };

  const handleReactionClick = (emoji) => {
    const existingReaction = message.reactions?.find(r => r.emoji === emoji);
    const hasReacted = existingReaction?.users?.some(userId => userId === user.id);

    socket.emit('messageReaction', {
      messageId: message._id,
      emoji,
      action: hasReacted ? 'remove' : 'add',
    });
  };

  const handleEdit = () => {
    if (message.type === 'text' && !message.deletedForEveryone) {
      setIsEditing(true);
    }
  };

  const handleSaveEdit = () => {
    if (editedContent.trim() && editedContent !== message.content) {
      socket.emit('editMessage', {
        messageId: message._id,
        newContent: editedContent.trim(),
      });
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedContent(message.content);
    setIsEditing(false);
  };

  const handleDelete = () => {
    socket.emit('deleteMessage', {
      messageId: message._id,
      deleteForEveryone: false,
    });
  };

  const handleDeleteForEveryone = () => {
    socket.emit('deleteMessage', {
      messageId: message._id,
      deleteForEveryone: true,
    });
  };

  // Don't render if deleted for this user
  if (message.deletedFor?.includes(user.id)) {
    return null;
  }

  return (
    <div 
      className={`flex mb-4 ${isOwn ? 'justify-end' : 'justify-start'} animate-comic-pop`}
      ref={messageRef}
      onContextMenu={handleContextMenu}
    >
      <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : 'order-1'} relative`}>
        {!isOwn && (
          <div 
            className="text-xs font-black mb-1 uppercase"
            style={{ color: '#ff0000', textShadow: '1px 1px 0 black' }}
          >{message.sender.displayName}</div>
        )}
        
        <div
          className="px-4 py-3 relative group"
          style={{
            background: message.deletedForEveryone ? '#f0f0f0' : (isOwn ? '#FFD700' : 'white'),
            color: message.deletedForEveryone ? '#999' : 'black',
            border: '3px solid black',
            borderRadius: '20px',
            boxShadow: isOwn ? '4px 4px 0 black' : '-4px 4px 0 black',
            transform: isOwn ? 'rotate(1deg)' : 'rotate(-1deg)',
            fontWeight: '700'
          }}
        >
          {/* Add Reaction Button */}
          {!message.deletedForEveryone && (
            <button
              onClick={() => setShowReactionPicker(!showReactionPicker)}
              className="absolute top-1 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{
                [isOwn ? 'left' : 'right']: '-30px',
                backgroundColor: 'white',
                border: '2px solid black',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                boxShadow: '2px 2px 0 black',
                cursor: 'pointer',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              😊
            </button>
          )}

          {showReactionPicker && (
            <ReactionPicker onSelect={handleReaction} isOwn={isOwn} />
          )}

          {isEditing ? (
            <div className="space-y-2" style={{ minWidth: '250px', maxWidth: '100%' }}>
              <input
                ref={inputRef}
                type="text"
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveEdit();
                  if (e.key === 'Escape') handleCancelEdit();
                }}
                className="w-full px-2 py-1 text-base"
                style={{
                  border: '2px solid black',
                  borderRadius: '8px',
                  fontWeight: '700',
                  boxSizing: 'border-box',
                }}
              />
              <div className={`flex gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <button
                  onClick={handleSaveEdit}
                  className="px-3 py-1 text-xs font-black uppercase"
                  style={{
                    backgroundColor: '#00D9FF',
                    border: '2px solid black',
                    borderRadius: '6px',
                    boxShadow: '2px 2px 0 black',
                  }}
                >
                  ✅ SAVE
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-3 py-1 text-xs font-black uppercase"
                  style={{
                    backgroundColor: '#fff',
                    border: '2px solid black',
                    borderRadius: '6px',
                    boxShadow: '2px 2px 0 black',
                  }}
                >
                  ❌ CANCEL
                </button>
              </div>
            </div>
          ) : (
            <>
              {message.deletedForEveryone ? (
                <p className="text-base italic opacity-75">🗑️ This message was deleted</p>
              ) : message.type === 'gif' ? (
                <img
                  src={message.content}
                  alt="GIF"
                  className="rounded-lg"
                  style={{ 
                    border: '3px solid black',
                    maxWidth: '300px',
                    maxHeight: '300px',
                    objectFit: 'contain'
                  }}
                />
              ) : message.type === 'sticker' ? (
                <div 
                  className="text-center py-2"
                  style={{
                    fontSize: '3rem',
                    lineHeight: '1',
                  }}
                >
                  {message.content}
                </div>
              ) : message.type === 'image' ? (
                <img
                  src={message.content}
                  alt="Shared image"
                  className="rounded-lg"
                  style={{ 
                    border: '3px solid black',
                    width: '250px',
                    height: '250px',
                    objectFit: 'cover'
                  }}
                />
              ) : message.type === 'audio' ? (
                <AudioMessage
                  audioUrl={message.content}
                  duration={message.audioDuration}
                  isOwn={isOwn}
                />
              ) : (
                <p className="text-base break-words">{message.content}</p>
              )}
              
              {message.isEdited && message.type === 'text' && !message.deletedForEveryone && (
                <span className="text-xs opacity-75"> (edited)</span>
              )}
            </>
          )}
        </div>

        {/* Display Reactions */}
        {!message.deletedForEveryone && message.reactions && message.reactions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {message.reactions.map((reaction, idx) => {
              const hasReacted = reaction.users?.some(userId => userId === user.id);
              const count = reaction.users?.length || 0;

              return (
                <button
                  key={idx}
                  onClick={() => handleReactionClick(reaction.emoji)}
                  className="inline-flex items-center gap-1 px-2 py-1 text-sm transition-transform hover:scale-110"
                  style={{
                    backgroundColor: hasReacted ? '#00D9FF' : 'white',
                    border: '2px solid black',
                    borderRadius: '12px',
                    boxShadow: '2px 2px 0 black',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                  }}
                >
                  <span>{reaction.emoji}</span>
                  <span style={{ fontSize: '11px' }}>{count}</span>
                </button>
              );
            })}
          </div>
        )}

        <div className="flex items-center space-x-2 mt-1">
          <span 
            className="text-xs font-bold"
            style={{ color: '#666', opacity: 0.8 }}
          >
            {format(new Date(message.createdAt), 'HH:mm')}
          </span>
          
          {isOwn && (
            <span className="text-xs font-bold">
              {message.status === 'read' ? (
                <span style={{ color: '#0066ff' }}>✓✓</span>
              ) : message.status === 'delivered' ? (
                <span style={{ color: '#666' }}>✓✓</span>
              ) : (
                <span style={{ color: '#999' }}>✓</span>
              )}
            </span>
          )}
        </div>
      </div>

      {/* Context Menu */}
      {showContextMenu && (
        <MessageContextMenu
          isOwn={isOwn}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDeleteForEveryone={handleDeleteForEveryone}
          position={contextMenuPosition}
          onClose={() => setShowContextMenu(false)}
        />
      )}
    </div>
  );
};

export default MessageItem;
