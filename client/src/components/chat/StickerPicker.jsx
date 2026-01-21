import React from 'react';

// Comic-style stickers
const STICKERS = [
  { emoji: '💥', label: 'POW!' },
  { emoji: '💫', label: 'WHAM!' },
  { emoji: '⚡', label: 'ZAP!' },
  { emoji: '💢', label: 'BOOM!' },
  { emoji: '💨', label: 'WHOOSH!' },
  { emoji: '✨', label: 'SPARKLE!' },
  { emoji: '🔥', label: 'FIRE!' },
  { emoji: '💯', label: 'PERFECT!' },
  { emoji: '❤️‍🔥', label: 'HOT!' },
  { emoji: '🎉', label: 'PARTY!' },
  { emoji: '🎊', label: 'YAY!' },
  { emoji: '🎈', label: 'FUN!' },
  { emoji: '🎁', label: 'GIFT!' },
  { emoji: '🌟', label: 'STAR!' },
  { emoji: '⭐', label: 'COOL!' },
  { emoji: '💖', label: 'LOVE!' },
  { emoji: '💝', label: 'SWEET!' },
  { emoji: '🎯', label: 'TARGET!' },
  { emoji: '🏆', label: 'WIN!' },
  { emoji: '👑', label: 'KING!' },
  { emoji: '🚀', label: 'ROCKET!' },
  { emoji: '⚽', label: 'GOAL!' },
  { emoji: '🎸', label: 'ROCK!' },
  { emoji: '🎮', label: 'GAME!' },
];

const StickerPicker = ({ onSelect, onClose }) => {
  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Sticker Picker Modal */}
      <div 
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-11/12 max-w-md animate-comic-pop"
        style={{
          backgroundColor: 'white',
          border: '4px solid black',
          borderRadius: '16px',
          boxShadow: '8px 8px 0 black',
        }}
      >
        {/* Header */}
        <div 
          className="p-4 border-b-4 border-black flex items-center justify-between"
          style={{ backgroundColor: '#FFD700' }}
        >
          <h3 className="text-xl font-black uppercase">🎨 Stickers</h3>
          <button
            onClick={onClose}
            className="text-2xl font-black hover:scale-110 transition-transform"
            style={{
              backgroundColor: '#ff0000',
              color: 'white',
              border: '2px solid black',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              boxShadow: '2px 2px 0 black',
            }}
          >
            ×
          </button>
        </div>

        {/* Sticker Grid */}
        <div 
          className="p-4 grid grid-cols-4 sm:grid-cols-5 gap-3 overflow-y-auto"
          style={{
            maxHeight: '60vh',
            scrollbarWidth: 'thin',
            scrollbarColor: '#FFD700 #f0f0f0',
          }}
        >
          {STICKERS.map((sticker, index) => (
            <button
              key={index}
              onClick={() => {
                onSelect(sticker);
                onClose();
              }}
              className="flex flex-col items-center justify-center p-2 transition-all hover:scale-110 hover:bg-cyan-50"
              style={{
                border: '3px solid black',
                borderRadius: '12px',
                boxShadow: '3px 3px 0 black',
                backgroundColor: 'white',
                aspectRatio: '1',
              }}
            >
              <span className="text-3xl sm:text-4xl mb-1">{sticker.emoji}</span>
              <span className="text-xs font-black uppercase" style={{ color: '#ff0000', fontSize: '10px' }}>
                {sticker.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default StickerPicker;
