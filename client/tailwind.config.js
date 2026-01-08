/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Pop Art/Comic Book Theme Colors - Exact Palette
        comic: {
          red: '#ff0000',      // Main actions, errors
          blue: '#0066ff',     // Links, info
          yellow: '#ffff00',   // Accents, highlights, own messages
          magenta: '#ff00ff',  // Private messages, tertiary
          cyan: '#00ffff',     // Quaternary accent
          green: '#00ff00',    // Success states
          cream: '#fff5e6',    // Main background (comic paper)
          'light-yellow': '#ffffcc', // Secondary surfaces
          white: '#ffffff',    // Message bubbles, cards
          black: '#000000',    // Bold outlines
          'dark-gray': '#333333', // Secondary text
        },
      },
      fontFamily: {
        bangers: ['Bangers', 'cursive'],
        luckiest: ['Luckiest Guy', 'cursive'],
        comic: ['Arial Black', 'Arial Bold', 'sans-serif'],
      },
      borderRadius: {
        'comic': '0.25rem',  // Minimal angular comic panels
        'bubble': '1.5rem 1.5rem 1.5rem 0.25rem',
        'bubble-right': '1.5rem 1.5rem 0.25rem 1.5rem',
      },
      borderWidth: {
        'comic': '3px',
        'thick': '4px',
      },
      backgroundImage: {
        // Halftone pattern (old comic printing)
        'halftone': "url('data:image/svg+xml,%3Csvg width=\"20\" height=\"20\" viewBox=\"0 0 20 20\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"%23000000\" fill-opacity=\"0.05\" fill-rule=\"evenodd\"%3E%3Ccircle cx=\"3\" cy=\"3\" r=\"3\"/%3E%3Ccircle cx=\"13\" cy=\"13\" r=\"3\"/%3E%3C/g%3E%3C/svg%3E')",
        // Crosshatch grid (comic paper)
        'crosshatch': "repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(0,0,0,0.03) 20px, rgba(0,0,0,0.03) 22px), repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(0,0,0,0.03) 20px, rgba(0,0,0,0.03) 22px)",
      },
      boxShadow: {
        'comic-sm': '2px 2px 0px 0px rgba(0, 0, 0, 1)',
        'comic': '4px 4px 0px 0px rgba(0, 0, 0, 1)',
        'comic-lg': '6px 6px 0px 0px rgba(0, 0, 0, 1)',
        'comic-xl': '8px 8px 0px 0px rgba(0, 0, 0, 1)',
        // Colored glows for special effects
        'glow-yellow': '0 0 20px rgba(255, 255, 0, 0.8)',
        'glow-red': '0 0 20px rgba(255, 0, 0, 0.8)',
        'glow-blue': '0 0 20px rgba(0, 102, 255, 0.8)',
      },
      animation: {
        'kapow': 'kapow 0.6s ease-out',
        'comic-pop': 'comic-pop 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'comic-shake': 'comic-shake 0.5s ease-in-out',
        'starburst': 'starburst 0.6s ease-out',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'ripple': 'ripple 0.6s ease-out',
      },
      keyframes: {
        kapow: {
          '0%': { transform: 'scale(0.8) rotate(-5deg)', opacity: '0' },
          '50%': { transform: 'scale(1.3) rotate(5deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },
        'comic-pop': {
          '0%': { transform: 'scale(0) rotate(-15deg)', opacity: '0' },
          '50%': { transform: 'scale(1.1) rotate(5deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },
        'comic-shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-4px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(4px)' },
        },
        starburst: {
          '0%': { transform: 'scale(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'scale(2) rotate(180deg)', opacity: '0' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 10px currentColor' },
          '50%': { boxShadow: '0 0 25px currentColor, 0 0 50px currentColor' },
        },
        ripple: {
          '0%': { transform: 'scale(0)', opacity: '1' },
          '100%': { transform: 'scale(2)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}
