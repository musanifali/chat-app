import React, { useEffect, useState } from 'react';

const MessageContextMenu = ({ isOwn, onEdit, onDelete, onDeleteForEveryone, position, onClose }) => {
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  useEffect(() => {
    // Adjust position if menu would go off screen
    const menuWidth = 200;
    const menuHeight = isOwn ? 150 : 80;
    const padding = 10;

    let adjustedX = position.x;
    let adjustedY = position.y;

    // Check right edge
    if (adjustedX + menuWidth > window.innerWidth) {
      adjustedX = window.innerWidth - menuWidth - padding;
    }

    // Check bottom edge
    if (adjustedY + menuHeight > window.innerHeight) {
      adjustedY = window.innerHeight - menuHeight - padding;
    }

    // Check left edge
    if (adjustedX < padding) {
      adjustedX = padding;
    }

    // Check top edge
    if (adjustedY < padding) {
      adjustedY = padding;
    }

    setAdjustedPosition({ x: adjustedX, y: adjustedY });
  }, [position, isOwn]);

  return (
    <>
      {/* Backdrop to close menu */}
      <div 
        className="fixed inset-0 z-30"
        onClick={onClose}
      />
      
      {/* Context Menu */}
      <div
        className="fixed z-40 py-1 animate-comic-pop"
        style={{
          top: `${adjustedPosition.y}px`,
          left: `${adjustedPosition.x}px`,
          backgroundColor: 'white',
          border: '3px solid black',
          borderRadius: '8px',
          boxShadow: '4px 4px 0 black',
          minWidth: '180px',
        }}
      >
        {isOwn && (
          <>
            <button
              onClick={() => {
                onEdit();
                onClose();
              }}
              className="w-full text-left px-4 py-2 text-sm font-bold hover:scale-105 transition-all flex items-center gap-2"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#FFD700';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              ✏️ Edit Message
            </button>
            
            <button
              onClick={() => {
                onDeleteForEveryone();
                onClose();
              }}
              className="w-full text-left px-4 py-2 text-sm font-bold hover:scale-105 transition-all flex items-center gap-2"
              style={{ color: '#ff0000' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#FFD700';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              🗑️ Delete for Everyone
            </button>
          </>
        )}
        
        <button
          onClick={() => {
            onDelete();
            onClose();
          }}
          className="w-full text-left px-4 py-2 text-sm font-bold hover:scale-105 transition-all flex items-center gap-2"
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#FFD700';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          🚫 Delete for Me
        </button>
      </div>
    </>
  );
};

export default MessageContextMenu;
