/**
 * API Client - Axios-based HTTP client with interceptors
 */

import axios, { AxiosError } from 'axios';
import type { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import type { ApiResponse, ErrorResponse, RefreshTokenResponse } from './types';

// Configuration
export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  setTokens: (accessToken: string, refreshToken?: string) => void;
  clearTokens: () => void;
  onUnauthorized?: () => void;
}

// Custom error class
export class ApiError extends Error {
  public status: number;
  public code: string;
  public path?: string;
  public errors?: Array<{ field: string; value: string; reason: string }>;

  constructor(errorResponse: ErrorResponse) {
    super(errorResponse.message);
    this.name = 'ApiError';
    this.status = errorResponse.status;
    this.code = errorResponse.code;
    this.path = errorResponse.path;
    this.errors = errorResponse.errors;
  }
}

// Create API client factory
export function createApiClient(config: ApiClientConfig): AxiosInstance {
  const client = axios.create({
    baseURL: config.baseURL,
    timeout: config.timeout || 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor - Add auth token
  client.interceptors.request.use(
    (requestConfig: InternalAxiosRequestConfig) => {
      const token = config.getAccessToken();
      if (token) {
        requestConfig.headers.Authorization = `Bearer ${token}`;
      }
      return requestConfig;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor - Handle errors and token refresh
  let isRefreshing = false;
  let failedQueue: Array<{
    resolve: (value: unknown) => void;
    reject: (error: unknown) => void;
    config: AxiosRequestConfig;
  }> = [];

  const processQueue = (error: Error | null, token: string | null = null) => {
    failedQueue.forEach(({ resolve, reject, config }) => {
      if (error) {
        reject(error);
      } else if (token) {
        config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
        resolve(client(config));
      }
    });
    failedQueue = [];
  };

  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<ErrorResponse>) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      // Handle 401 Unauthorized
      if (error.response?.status === 401 && !originalRequest._retry) {
        // Skip refresh for auth endpoints
        if (originalRequest.url?.includes('/auth/login') ||
            originalRequest.url?.includes('/auth/refresh')) {
          config.clearTokens();
          config.onUnauthorized?.();
          return Promise.reject(error);
        }

        if (isRefreshing) {
          // Queue the request while refreshing
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject, config: originalRequest });
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshToken = config.getRefreshToken();
          if (!refreshToken) {
            throw new Error('No refresh token available');
          }

          const response = await axios.post<ApiResponse<RefreshTokenResponse>>(
            `${config.baseURL}/api/auth/refresh`,
            { refreshToken },
            { headers: { 'Content-Type': 'application/json' } }
          );

          const { accessToken } = response.data.data;
          config.setTokens(accessToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          processQueue(null, accessToken);

          return client(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError as Error);
          config.clearTokens();
          config.onUnauthorized?.();
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      // Transform error response
      if (error.response?.data) {
        return Promise.reject(new ApiError(error.response.data));
      }

      // Network or other errors
      return Promise.reject(
        new ApiError({
          status: error.response?.status || 0,
          code: 'NETWORK_ERROR',
          message: error.message || 'Network error occurred',
          timestamp: new Date().toISOString(),
          path: originalRequest?.url || '',
        })
      );
    }
  );

  return client;
}

// Default instance holder
let defaultClient: AxiosInstance | null = null;

export function getApiClient(): AxiosInstance {
  if (!defaultClient) {
    throw new Error('API client not initialized. Call initializeApiClient first.');
  }
  return defaultClient;
}

export function initializeApiClient(config: ApiClientConfig): AxiosInstance {
  defaultClient = createApiClient(config);
  return defaultClient;
}
