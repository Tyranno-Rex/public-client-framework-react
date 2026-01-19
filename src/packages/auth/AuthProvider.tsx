/**
 * AuthProvider - Authentication context with API client initialization
 */

import { useEffect, type ReactNode } from 'react';
import { initializeApiClient } from '../api';
import { useAuthStore } from '../store';

export interface AuthProviderProps {
  children: ReactNode;
  apiBaseUrl: string;
  onUnauthorized?: () => void;
}

export function AuthProvider({
  children,
  apiBaseUrl,
  onUnauthorized,
}: AuthProviderProps) {
  const { getAccessToken, getRefreshToken, setTokens, clearAuth } = useAuthStore();

  // Initialize API client
  useEffect(() => {
    initializeApiClient({
      baseURL: apiBaseUrl,
      getAccessToken,
      getRefreshToken,
      setTokens,
      clearTokens: clearAuth,
      onUnauthorized: () => {
        clearAuth();
        onUnauthorized?.();
      },
    });
  }, [apiBaseUrl, getAccessToken, getRefreshToken, setTokens, clearAuth, onUnauthorized]);

  return <>{children}</>;
}

export default AuthProvider;
