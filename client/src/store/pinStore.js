import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import CryptoJS from 'crypto-js';

const usePinStore = create(
  persist(
    (set, get) => ({
      pinHash: null,
      isLocked: false,
      isPinEnabled: false,
      
      // Set up PIN (hash it with SHA-256 for security)
      setupPin: (pin) => {
        const hash = CryptoJS.SHA256(pin).toString();
        set({ pinHash: hash, isPinEnabled: true, isLocked: false });
        return true;
      },
      
      // Verify PIN
      verifyPin: (pin) => {
        const { pinHash } = get();
        const hash = CryptoJS.SHA256(pin).toString();
        if (hash === pinHash) {
          set({ isLocked: false });
          return true;
        }
        return false;
      },
      
      // Lock the app
      lockApp: () => {
        const { isPinEnabled } = get();
        if (isPinEnabled) {
          set({ isLocked: true });
        }
      },
      
      // Unlock the app
      unlockApp: () => {
        set({ isLocked: false });
      },
      
      // Disable PIN
      disablePin: () => {
        set({ pinHash: null, isPinEnabled: false, isLocked: false });
      },
      
      // Change PIN
      changePin: (oldPin, newPin) => {
        const { pinHash } = get();
        const oldHash = CryptoJS.SHA256(oldPin).toString();
        if (oldHash === pinHash) {
          const newHash = CryptoJS.SHA256(newPin).toString();
          set({ pinHash: newHash });
          return true;
        }
        return false;
      },
    }),
    {
      name: 'dubu-pin-storage',
    }
  )
);

export default usePinStore;
