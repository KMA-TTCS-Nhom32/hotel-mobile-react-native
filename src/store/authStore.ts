import type { User } from '@ahomevilla-hotel/node-sdk';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { authService } from '@/services/auth/authService';

interface AuthState {
  // User data (persisted)
  user: User | null;

  // Actions
  setUser: (user: User | null) => void;
  loadProfile: () => Promise<User | null>;
  clearAuth: () => void;
}

/**
 * Lightweight Zustand store for user data management and persistence
 * Works in conjunction with React Query useAuth hook for auth operations
 */
export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      // Initial state
      user: null,

      // Set user data (called after successful login/profile fetch)
      setUser: (user: User | null) => {
        set({ user });
      },

      // Load user profile from API
      loadProfile: async () => {
        try {
          const userProfile = await authService.getProfile();
          set({ user: userProfile });
          return userProfile;
        } catch (error) {
          console.error('Profile loading error:', error);
          set({ user: null });
          throw error;
        }
      },

      // Clear user data
      clearAuth: () => {
        set({ user: null });
      },
    }),
    {
      name: 'auth-storage',
      // storage: createJSONStorage(() => ({
      //   getItem: async (name: string) => {
      //     const value = await Storage.getItem<string>(name);
      //     return value;
      //   },
      //   setItem: async (name: string, value: string) => {
      //     await Storage.setItem(name, value);
      //   },
      //   removeItem: async (name: string) => {
      //     await Storage.removeItem(name);
      //   },
      // })),
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist user data
      partialize: state => ({
        user: state.user,
      }),
    }
  )
);

/**
 * Enhanced auth hook that combines React Query and Zustand
 * - React Query: Handles auth operations, caching, and server state
 * - Zustand: Handles user data persistence and global state
 */
export const useAuth = () => {
  const { user, setUser, loadProfile, clearAuth } = useAuthStore();

  return {
    // User data from Zustand
    user,

    // Actions
    setUser,
    loadProfile,
    clearAuth,
  };
};

/**
 * Hook specifically for user profile data with loading state
 */
export const useProfile = () => {
  const { user, loadProfile } = useAuthStore();

  return {
    user,
    loadProfile,
    isLoading: false, // Loading state handled by React Query useAuth hook
  };
};
