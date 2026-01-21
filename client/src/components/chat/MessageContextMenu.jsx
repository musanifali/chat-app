import React from 'react';

const MessageContextMenu = ({ isOwn, onEdit, onDelete, onDeleteForEveryone, position, onClose }) => {
  return (
    <>
      {/* Backdrop to close menu */}
      <div 
        className="fixed inset-0 z-30"
        onClick={onClose}
      />
      
      {/* Context Menu */}
      <div
        className="absolute z-40 py-1 animate-comic-pop"
        style={{
          top: position.y,
          left: position.x,
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
