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
  /** Token refresh 엔드포인트 (기본: /api/auth/refresh) */
  refreshEndpoint?: string;
  // Retry configuration
  retry?: {
    maxRetries?: number; // 최대 재시도 횟수 (기본: 3)
    retryDelay?: number; // 기본 재시도 지연 시간 ms (기본: 1000)
    retryOn?: number[]; // 재시도할 HTTP 상태 코드 (기본: [408, 500, 502, 503, 504])
  };
}

// Retry configuration defaults
const DEFAULT_RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000,
  retryOn: [408, 500, 502, 503, 504], // Request Timeout, Server errors
};

// Calculate delay with exponential backoff
function calculateRetryDelay(retryCount: number, baseDelay: number): number {
  // Exponential backoff: 1s, 2s, 4s, ...
  const exponentialDelay = baseDelay * Math.pow(2, retryCount - 1);
  // Add jitter (±20%) to prevent thundering herd
  const jitter = exponentialDelay * 0.2 * (Math.random() - 0.5);
  return Math.min(exponentialDelay + jitter, 30000); // Max 30 seconds
}

// Sleep utility
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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

// Default refresh endpoint
const DEFAULT_REFRESH_ENDPOINT = '/api/auth/refresh';

// Create API client factory
export function createApiClient(config: ApiClientConfig): AxiosInstance {
  const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config.retry };
  const refreshEndpoint = config.refreshEndpoint ?? DEFAULT_REFRESH_ENDPOINT;

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

          // 설정된 클라이언트를 사용하여 refresh 요청 (인터셉터 적용)
          const response = await client.post<ApiResponse<RefreshTokenResponse>>(
            refreshEndpoint,
            { refreshToken }
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

      // Retry logic for network errors and specific status codes
      const retryCount = (originalRequest as InternalAxiosRequestConfig & { _retryCount?: number })._retryCount || 0;
      const shouldRetry =
        retryCount < retryConfig.maxRetries &&
        (
          // Network error (no response)
          !error.response ||
          // Specific status codes
          (error.response?.status && retryConfig.retryOn.includes(error.response.status))
        ) &&
        // Don't retry POST/PUT/PATCH by default (not idempotent) unless explicitly safe
        (!['POST', 'PUT', 'PATCH'].includes(originalRequest.method?.toUpperCase() || '') ||
          originalRequest.headers?.['X-Idempotent'] === 'true');

      if (shouldRetry) {
        (originalRequest as InternalAxiosRequestConfig & { _retryCount?: number })._retryCount = retryCount + 1;
        const delay = calculateRetryDelay(retryCount + 1, retryConfig.retryDelay);

        console.warn(
          `[API] Retry ${retryCount + 1}/${retryConfig.maxRetries} after ${Math.round(delay)}ms for ${originalRequest.url}`
        );

        await sleep(delay);
        return client(originalRequest);
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
