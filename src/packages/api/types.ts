/**
 * API Response Types - Matches Spring Boot server DTOs
 */

// Common API Response wrapper
export interface ApiResponse<T = unknown> {
  success: boolean;
  code: string;
  message: string;
  data: T;
  timestamp: string;
}

// Error response structure
export interface ErrorResponse {
  status: number;
  code: string;
  message: string;
  timestamp: string;
  path: string;
  errors?: FieldError[];
}

export interface FieldError {
  field: string;
  value: string;
  reason: string;
}

// Pagination types
export interface PageRequest {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Authentication types
export interface LoginRequest {
  token: string;
  provider?: 'kakao' | 'google' | 'apple' | string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  tokenType: string;
}

// Health check types
export interface HealthStatus {
  status: 'UP' | 'DOWN';
  database?: {
    status: 'UP' | 'DOWN';
    type?: string;
  };
  redis?: {
    status: 'UP' | 'DOWN';
  };
  timestamp?: string;
}

// User types (extend as needed)
export interface User {
  id: string;
  email?: string;
  username?: string;
  profileImage?: string;
  createdAt?: string;
  updatedAt?: string;
}

// API Error codes matching Spring Boot ErrorCode enum
export const ErrorCodes = {
  // Common errors (C0xx)
  INVALID_INPUT_VALUE: 'C001',
  METHOD_NOT_ALLOWED: 'C002',
  INTERNAL_SERVER_ERROR: 'C003',
  INVALID_TYPE_VALUE: 'C004',
  MISSING_REQUEST_PARAMETER: 'C005',
  RESOURCE_NOT_FOUND: 'C006',

  // Authentication errors (A0xx)
  INVALID_TOKEN: 'A001',
  EXPIRED_TOKEN: 'A002',
  REFRESH_TOKEN_NOT_FOUND: 'A003',
  INVALID_REFRESH_TOKEN: 'A004',
  UNAUTHORIZED_ACCESS: 'A005',
  FORBIDDEN_ACCESS: 'A006',
} as const;

export type ErrorCodeType = typeof ErrorCodes[keyof typeof ErrorCodes];
