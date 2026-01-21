import React, { useState } from 'react';

const EMOJIS = ['❤️', '👍', '😂', '😮', '😢', '🔥', '🎉', '👏'];

const ReactionPicker = ({ onSelect, isOwn }) => {
  return (
    <div 
      className="absolute bottom-full mb-2 flex gap-1 p-2 animate-comic-pop z-20"
      style={{
        backgroundColor: 'white',
        border: '3px solid black',
        borderRadius: '12px',
        boxShadow: '4px 4px 0 black',
        [isOwn ? 'right' : 'left']: '0',
      }}
    >
      {EMOJIS.map((emoji) => (
        <button
          key={emoji}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(emoji);
          }}
          className="text-2xl hover:scale-125 transition-transform p-1"
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
};

export default ReactionPicker;
