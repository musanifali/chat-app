import React, { useState } from 'react';
import { Lock, Check } from 'lucide-react';
import { Button } from '../ui/button';
import toast from 'react-hot-toast';
import usePinStore from '../../store/pinStore';

const PinSetup = ({ onComplete }) => {
  const [step, setStep] = useState(1); // 1: enter PIN, 2: confirm PIN
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const setupPin = usePinStore((state) => state.setupPin);

  const handlePinInput = (digit) => {
    if (step === 1 && pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      if (newPin.length === 4) {
        setTimeout(() => setStep(2), 300);
      }
    } else if (step === 2 && confirmPin.length < 4) {
      const newConfirmPin = confirmPin + digit;
      setConfirmPin(newConfirmPin);
      if (newConfirmPin.length === 4) {
        // Verify pins match
        setTimeout(() => {
          if (pin === newConfirmPin) {
            setupPin(pin);
            toast.success('🔒 PIN Lock Enabled!');
            onComplete?.();
          } else {
            toast.error('PINs do not match!');
            setPin('');
            setConfirmPin('');
            setStep(1);
          }
        }, 300);
      }
    }
  };

  const handleBackspace = () => {
    if (step === 1) {
      setPin(pin.slice(0, -1));
    } else {
      setConfirmPin(confirmPin.slice(0, -1));
    }
  };

  const currentPin = step === 1 ? pin : confirmPin;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-comic-cream halftone-bg">
      <div className="w-full max-w-md animate-comic-pop">
        <div 
          className="p-8 bg-white border-[4px] border-black rounded-[20px]"
          style={{
            boxShadow: '8px 8px 0 black',
          }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div 
              className="inline-flex items-center justify-center w-20 h-20 mb-4 bg-comic-yellow border-[4px] border-black rounded-full"
              style={{
                boxShadow: '4px 4px 0 black',
              }}
            >
              <Lock className="w-10 h-10 text-black" strokeWidth={3} />
            </div>
            <h1 
              className="text-4xl font-black uppercase mb-2 text-comic-blue"
              style={{
                textShadow: '3px 3px 0 black',
                WebkitTextStroke: '1px black'
              }}
            >
              {step === 1 ? '🔐 SET PIN' : '✅ CONFIRM'}
            </h1>
            <p className="font-bold text-lg text-gray-700">
              {step === 1 ? 'Enter a 4-digit PIN' : 'Re-enter your PIN'}
            </p>
          </div>

          {/* PIN Display */}
          <div className="flex justify-center gap-4 mb-8">
            {[0, 1, 2, 3].map((index) => (
              <div
                key={index}
                className="w-14 h-14 flex items-center justify-center bg-comic-cream border-[3px] border-black rounded-xl transition-all"
                style={{
                  boxShadow: currentPin.length > index ? '3px 3px 0 black' : '2px 2px 0 black',
                  transform: currentPin.length > index ? 'scale(1.1)' : 'scale(1)'
                }}
              >
                {currentPin.length > index && (
                  <div className="w-4 h-4 bg-black rounded-full animate-comic-pop" />
                )}
              </div>
            ))}
          </div>

          {/* Number Pad */}
          <div className="grid grid-cols-3 gap-3 mb-4">
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

          {/* Skip Button */}
          <Button
            onClick={() => onComplete?.()}
            variant="ghost"
            className="w-full"
          >
            Skip for now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PinSetup;
