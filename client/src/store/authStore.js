import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      
      updateUser: (userData) => set((state) => ({
        user: { ...state.user, ...userData }
      })),
      
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      
      // Initialize auth state from persisted data
      initializeAuth: () => {
        const state = get();
        if (state.token && state.user) {
          set({ isAuthenticated: true });
        }
      },
    }),
    {
      name: 'auth-storage',
      getStorage: () => localStorage,
      // After rehydration, check if user should be authenticated
      onRehydrateStorage: () => (state) => {
        if (state?.token && state?.user) {
          state.isAuthenticated = true;
        }
      },
    }
  )
);
