/**
 * Store Package - Public exports
 */

// Auth store
export {
  useAuthStore,
  selectIsAuthenticated,
  selectUser,
  selectAuthLoading,
  selectAuthError,
} from './authStore';
export type { AuthState } from './authStore';

// User store
export {
  useUserStore,
  selectProfile,
  selectPreferences,
  selectTheme,
  selectLanguage,
  selectPoints,
  selectBalance,
} from './userStore';
export type { UserState, UserProfile, UserPreferences } from './userStore';
