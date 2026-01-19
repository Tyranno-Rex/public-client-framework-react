/**
 * useAuth Hook - Authentication helpers
 */

import { useCallback } from 'react';
import { useAuthStore } from '../store';
import type { LoginRequest } from '../api';

export function useAuth() {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    clearAuth,
  } = useAuthStore();

  const handleLogin = useCallback(
    async (request: LoginRequest) => {
      return login(request);
    },
    [login]
  );

  const handleLogout = useCallback(async () => {
    await logout();
  }, [logout]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login: handleLogin,
    logout: handleLogout,
    clearAuth,
  };
}

export default useAuth;
