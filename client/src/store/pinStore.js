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
        
        // Check new SHA-256 hash
        if (hash === pinHash) {
          set({ isLocked: false });
          return true;
        }
        
        // Migration: Check if old base64 hash matches (for backward compatibility)
        try {
          const oldHash = btoa(pin);
          if (oldHash === pinHash) {
            // Migrate to new SHA-256 hash
            set({ pinHash: hash, isLocked: false });
            console.log('PIN migrated to new secure hash');
            return true;
          }
        } catch (e) {
          // btoa failed, not a valid old hash
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
        
        // Check new SHA-256 hash
        if (oldHash === pinHash) {
          const newHash = CryptoJS.SHA256(newPin).toString();
          set({ pinHash: newHash });
          return true;
        }
        
        // Migration: Check if old base64 hash matches
        try {
          const oldBase64Hash = btoa(oldPin);
          if (oldBase64Hash === pinHash) {
            // Migrate to new SHA-256 hash
            const newHash = CryptoJS.SHA256(newPin).toString();
            set({ pinHash: newHash });
            console.log('PIN migrated to new secure hash during change');
            return true;
          }
        } catch (e) {
          // btoa failed
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
