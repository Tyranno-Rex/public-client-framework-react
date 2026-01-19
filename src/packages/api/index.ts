/**
 * API Package - Public exports
 */

// Client
export { createApiClient, getApiClient, initializeApiClient, ApiError } from './client';
export type { ApiClientConfig } from './client';

// HTTP abstraction
export { http, createApiService, handleApiError } from './http';
export type { RequestOptions } from './http';

// Types
export type {
  ApiResponse,
  ErrorResponse,
  FieldError,
  PageRequest,
  PageResponse,
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  HealthStatus,
  User,
  ErrorCodeType,
} from './types';

export { ErrorCodes } from './types';

// API Hooks
export {
  useApi,
  usePaginatedApi,
} from './useApi';
export type {
  UseApiState,
  UseApiOptions,
  UseApiResult,
  UsePaginatedApiOptions,
  UsePaginatedApiResult,
} from './useApi';

// Services
export { authApi } from './services/auth';
export { healthApi } from './services/health';
