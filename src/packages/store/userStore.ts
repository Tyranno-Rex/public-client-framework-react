/**
 * User Store - Zustand store for user profile and preferences
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: 'ko' | 'en';
  notifications: {
    push: boolean;
    email: boolean;
    sms: boolean;
  };
}

export interface UserProfile {
  id: string;
  username: string;
  email?: string;
  profileImage?: string;
  bio?: string;
  points: number;
  balance: number;
  level: number;
  createdAt?: string;
}

export interface UserState {
  // State
  profile: UserProfile | null;
  preferences: UserPreferences;
  isLoading: boolean;
  error: string | null;

  // Actions
  setProfile: (profile: UserProfile | null) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  setPreferences: (preferences: Partial<UserPreferences>) => void;
  setTheme: (theme: UserPreferences['theme']) => void;
  setLanguage: (language: UserPreferences['language']) => void;
  addPoints: (points: number) => void;
  addBalance: (amount: number) => void;
  reset: () => void;
}

const defaultPreferences: UserPreferences = {
  theme: 'system',
  language: 'ko',
  notifications: {
    push: true,
    email: true,
    sms: false,
  },
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      // Initial state
      profile: null,
      preferences: defaultPreferences,
      isLoading: false,
      error: null,

      // Set full profile
      setProfile: (profile) => {
        set({ profile });
      },

      // Partial profile update
      updateProfile: (updates) => {
        set((state) => ({
          profile: state.profile ? { ...state.profile, ...updates } : null,
        }));
      },

      // Update preferences
      setPreferences: (preferences) => {
        set((state) => ({
          preferences: { ...state.preferences, ...preferences },
        }));
      },

      // Theme shortcut
      setTheme: (theme) => {
        set((state) => ({
          preferences: { ...state.preferences, theme },
        }));
      },

      // Language shortcut
      setLanguage: (language) => {
        set((state) => ({
          preferences: { ...state.preferences, language },
        }));
      },

      // Points management
      addPoints: (points) => {
        set((state) => ({
          profile: state.profile
            ? { ...state.profile, points: state.profile.points + points }
            : null,
        }));
      },

      // Balance management
      addBalance: (amount) => {
        set((state) => ({
          profile: state.profile
            ? { ...state.profile, balance: state.profile.balance + amount }
            : null,
        }));
      },

      // Reset store
      reset: () => {
        set({
          profile: null,
          preferences: defaultPreferences,
          isLoading: false,
          error: null,
        });
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        profile: state.profile,
        preferences: state.preferences,
      }),
    }
  )
);

// Selectors
export const selectProfile = (state: UserState) => state.profile;
export const selectPreferences = (state: UserState) => state.preferences;
export const selectTheme = (state: UserState) => state.preferences.theme;
export const selectLanguage = (state: UserState) => state.preferences.language;
export const selectPoints = (state: UserState) => state.profile?.points ?? 0;
export const selectBalance = (state: UserState) => state.profile?.balance ?? 0;
