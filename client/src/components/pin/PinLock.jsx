import React, { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import usePinStore from '../../store/pinStore';

const PinLock = ({ onUnlock }) => {
  const [pin, setPin] = useState('');
  const [shake, setShake] = useState(false);
  const verifyPin = usePinStore((state) => state.verifyPin);

  const handlePinInput = (digit) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      
      if (newPin.length === 4) {
        // Verify PIN
        setTimeout(() => {
          if (verifyPin(newPin)) {
            toast.success('🔓 Unlocked!');
            onUnlock?.();
          } else {
            toast.error('❌ Wrong PIN!');
            setShake(true);
            setTimeout(() => {
              setShake(false);
              setPin('');
            }, 500);
          }
        }, 200);
      }
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-comic-cream halftone-bg">
      <div className={`w-full max-w-md ${shake ? 'animate-shake' : 'animate-comic-pop'}`}>
        <div 
          className="p-8 bg-white border-[4px] border-black rounded-[20px]"
          style={{
            boxShadow: '8px 8px 0 black',
          }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div 
              className="inline-flex items-center justify-center w-20 h-20 mb-4 bg-comic-red border-[4px] border-black rounded-full animate-pulse"
              style={{
                boxShadow: '4px 4px 0 black',
              }}
            >
              <Lock className="w-10 h-10 text-white" strokeWidth={3} />
            </div>
            <h1 
              className="text-4xl font-black uppercase mb-2 text-comic-red"
              style={{
                textShadow: '3px 3px 0 black',
                WebkitTextStroke: '1px black'
              }}
            >
              🔒 LOCKED
            </h1>
            <p className="font-bold text-lg text-gray-700">
              Enter your PIN to unlock
            </p>
          </div>

          {/* PIN Display */}
          <div className="flex justify-center gap-4 mb-8">
            {[0, 1, 2, 3].map((index) => (
              <div
                key={index}
                className={`w-14 h-14 flex items-center justify-center bg-comic-cream border-[3px] border-black rounded-xl transition-all ${
                  shake ? 'animate-shake' : ''
                }`}
                style={{
                  boxShadow: pin.length > index ? '3px 3px 0 black' : '2px 2px 0 black',
                  transform: pin.length > index ? 'scale(1.1)' : 'scale(1)'
                }}
              >
                {pin.length > index && (
                  <div className="w-4 h-4 bg-black rounded-full animate-comic-pop" />
                )}
              </div>
            ))}
          </div>

          {/* Number Pad */}
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
              <button
                key={digit}
                onClick={() => handlePinInput(digit.toString())}
                className="h-16 font-black text-2xl bg-white border-[3px] border-black rounded-xl transition-all hover:scale-105 active:scale-95 touch-manipulation"
                style={{
                  boxShadow: '3px 3px 0 black',
                  WebkitTapHighlightColor: 'transparent'
                }}
              >
                {digit}
              </button>
            ))}
            <div /> {/* Empty space */}
            <button
              onClick={() => handlePinInput('0')}
              className="h-16 font-black text-2xl bg-white border-[3px] border-black rounded-xl transition-all hover:scale-105 active:scale-95 touch-manipulation"
              style={{
                boxShadow: '3px 3px 0 black',
                WebkitTapHighlightColor: 'transparent'
              }}
            >
              0
            </button>
            <button
              onClick={handleBackspace}
              className="h-16 font-black text-lg bg-comic-red text-white border-[3px] border-black rounded-xl transition-all hover:scale-105 active:scale-95 touch-manipulation"
              style={{
                boxShadow: '3px 3px 0 black',
                WebkitTapHighlightColor: 'transparent'
              }}
            >
              ←
            </button>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default PinLock;
