/**
 * Authentication API Service
 * Matches Spring Boot AuthController endpoints
 */

import { getApiClient } from '../client';
import type {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
} from '../types';

const AUTH_BASE = '/api/auth';

export const authApi = {
  /**
   * OAuth login with token and provider
   * POST /api/auth/login
   */
  login: async (request: LoginRequest): Promise<LoginResponse> => {
    const response = await getApiClient().post<ApiResponse<LoginResponse>>(
      `${AUTH_BASE}/login`,
      request
    );
    return response.data.data;
  },

  /**
   * Refresh access token using refresh token
   * POST /api/auth/refresh
   */
  refreshToken: async (request: RefreshTokenRequest): Promise<RefreshTokenResponse> => {
    const response = await getApiClient().post<ApiResponse<RefreshTokenResponse>>(
      `${AUTH_BASE}/refresh`,
      request
    );
    return response.data.data;
  },

  /**
   * Logout and invalidate refresh tokens
   * POST /api/auth/logout
   */
  logout: async (): Promise<void> => {
    await getApiClient().post(`${AUTH_BASE}/logout`);
  },

  /**
   * Auth service health check
   * GET /api/auth/health
   */
  health: async (): Promise<string> => {
    const response = await getApiClient().get<string>(`${AUTH_BASE}/health`);
    return response.data;
  },
};
