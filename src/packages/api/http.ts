/**
 * HTTP - Type-safe HTTP client wrapper
 * Wraps axios with generic type enforcement
 */

import type { AxiosRequestConfig } from 'axios';
import { getApiClient, ApiError } from './client';
import type { ApiResponse, PageRequest, PageResponse } from './types';

export interface RequestOptions extends Omit<AxiosRequestConfig, 'url' | 'method' | 'data' | 'params'> {
  /** Show toast on error */
  showError?: boolean;
  /** Retry count on failure */
  retryCount?: number;
}

/**
 * Type-safe HTTP methods
 */
export const http = {
  /**
   * GET request with type-safe response
   */
  async get<T>(url: string, params?: Record<string, unknown>, options?: RequestOptions): Promise<T> {
    const client = getApiClient();
    const response = await client.get<ApiResponse<T>>(url, { params, ...options });
    return response.data.data;
  },

  /**
   * POST request with type-safe request and response
   */
  async post<TRequest, TResponse>(
    url: string,
    data?: TRequest,
    options?: RequestOptions
  ): Promise<TResponse> {
    const client = getApiClient();
    const response = await client.post<ApiResponse<TResponse>>(url, data, options);
    return response.data.data;
  },

  /**
   * PUT request with type-safe request and response
   */
  async put<TRequest, TResponse>(
    url: string,
    data?: TRequest,
    options?: RequestOptions
  ): Promise<TResponse> {
    const client = getApiClient();
    const response = await client.put<ApiResponse<TResponse>>(url, data, options);
    return response.data.data;
  },

  /**
   * PATCH request with type-safe request and response
   */
  async patch<TRequest, TResponse>(
    url: string,
    data?: TRequest,
    options?: RequestOptions
  ): Promise<TResponse> {
    const client = getApiClient();
    const response = await client.patch<ApiResponse<TResponse>>(url, data, options);
    return response.data.data;
  },

  /**
   * DELETE request with type-safe response
   */
  async delete<T = void>(url: string, options?: RequestOptions): Promise<T> {
    const client = getApiClient();
    const response = await client.delete<ApiResponse<T>>(url, options);
    return response.data.data;
  },

  /**
   * Paginated GET request
   */
  async getPage<T>(
    url: string,
    pageRequest?: PageRequest,
    options?: RequestOptions
  ): Promise<PageResponse<T>> {
    const client = getApiClient();
    const response = await client.get<ApiResponse<PageResponse<T>>>(url, {
      params: pageRequest,
      ...options,
    });
    return response.data.data;
  },
};

/**
 * Create a typed API service
 */
export function createApiService<T extends Record<string, unknown>>(
  baseUrl: string
) {
  return {
    async getAll(params?: Record<string, unknown>): Promise<T[]> {
      return http.get<T[]>(baseUrl, params);
    },

    async getById(id: string | number): Promise<T> {
      return http.get<T>(`${baseUrl}/${id}`);
    },

    async getPage(pageRequest?: PageRequest): Promise<PageResponse<T>> {
      return http.getPage<T>(baseUrl, pageRequest);
    },

    async create<TCreate = Partial<T>>(data: TCreate): Promise<T> {
      return http.post<TCreate, T>(baseUrl, data);
    },

    async update<TUpdate = Partial<T>>(id: string | number, data: TUpdate): Promise<T> {
      return http.put<TUpdate, T>(`${baseUrl}/${id}`, data);
    },

    async patch<TUpdate = Partial<T>>(id: string | number, data: TUpdate): Promise<T> {
      return http.patch<TUpdate, T>(`${baseUrl}/${id}`, data);
    },

    async delete(id: string | number): Promise<void> {
      return http.delete<void>(`${baseUrl}/${id}`);
    },
  };
}

/**
 * Handle API errors with callback
 */
export function handleApiError(
  error: unknown,
  handlers?: {
    onBadRequest?: (error: ApiError) => void;
    onUnauthorized?: (error: ApiError) => void;
    onForbidden?: (error: ApiError) => void;
    onNotFound?: (error: ApiError) => void;
    onConflict?: (error: ApiError) => void;
    onServerError?: (error: ApiError) => void;
    onNetworkError?: (error: ApiError) => void;
    onDefault?: (error: ApiError) => void;
  }
): void {
  if (!(error instanceof ApiError)) {
    console.error('Unknown error:', error);
    return;
  }

  switch (error.status) {
    case 400:
      handlers?.onBadRequest?.(error);
      break;
    case 401:
      handlers?.onUnauthorized?.(error);
      break;
    case 403:
      handlers?.onForbidden?.(error);
      break;
    case 404:
      handlers?.onNotFound?.(error);
      break;
    case 409:
      handlers?.onConflict?.(error);
      break;
    case 0:
      handlers?.onNetworkError?.(error);
      break;
    default:
      if (error.status >= 500) {
        handlers?.onServerError?.(error);
      } else {
        handlers?.onDefault?.(error);
      }
  }
}

export { ApiError };
