import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const usePinStore = create(
  persist(
    (set, get) => ({
      pinHash: null,
      isLocked: false,
      isPinEnabled: false,
      
      // Set up PIN (hash it for security)
      setupPin: (pin) => {
        const hash = btoa(pin); // Simple encoding (you can use crypto for better security)
        set({ pinHash: hash, isPinEnabled: true, isLocked: false });
        return true;
      },
      
      // Verify PIN
      verifyPin: (pin) => {
        const { pinHash } = get();
        const hash = btoa(pin);
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
        const oldHash = btoa(oldPin);
        if (oldHash === pinHash) {
          const newHash = btoa(newPin);
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
