import React from 'react';
import { format } from 'date-fns';
import AudioMessage from './AudioMessage';

const MessageItem = ({ message, isOwn }) => {
  return (
    <div className={`flex mb-4 ${isOwn ? 'justify-end' : 'justify-start'} animate-comic-pop`}>
      <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
        {!isOwn && (
          <div 
            className="text-xs font-black mb-1 uppercase"
            style={{ color: '#ff0000', textShadow: '1px 1px 0 black' }}
          >{message.sender.displayName}</div>
        )}
        
        <div
          className="px-4 py-3 relative"
          style={{
            background: isOwn ? '#FFD700' : 'white',
            color: 'black',
            border: '3px solid black',
            borderRadius: '20px',
            boxShadow: isOwn ? '4px 4px 0 black' : '-4px 4px 0 black',
            transform: isOwn ? 'rotate(1deg)' : 'rotate(-1deg)',
            fontWeight: '700'
          }}
        >
          {message.type === 'image' ? (
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
          
          {message.isEdited && message.type === 'text' && (
            <span className="text-xs opacity-75"> (edited)</span>
          )}
        </div>

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
    </div>
  );
};

export default MessageItem;
