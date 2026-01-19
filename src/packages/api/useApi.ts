/**
 * useApi - React hooks for API calls with loading/error states
 * Provides a simple alternative to React Query for common use cases
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { ApiError } from './client';

export interface UseApiState<T> {
  /** Response data */
  data: T | null;
  /** Loading state */
  loading: boolean;
  /** Error object */
  error: ApiError | null;
  /** Request has been called at least once */
  called: boolean;
}

export interface UseApiOptions {
  /** Execute immediately on mount */
  immediate?: boolean;
  /** Callback on success */
  onSuccess?: (data: unknown) => void;
  /** Callback on error */
  onError?: (error: ApiError) => void;
  /** Reset error on new request */
  resetErrorOnRequest?: boolean;
}

export interface UseApiResult<T, TArgs extends unknown[]> extends UseApiState<T> {
  /** Execute the API call */
  execute: (...args: TArgs) => Promise<T | null>;
  /** Reset state to initial */
  reset: () => void;
  /** Set data manually */
  setData: (data: T | null) => void;
  /** Abort the current request */
  abort: () => void;
}

/**
 * Hook for making API calls with loading/error state management
 * @param apiFunction - The API function to call
 * @param options - Hook options
 */
export function useApi<T, TArgs extends unknown[] = []>(
  apiFunction: (...args: TArgs) => Promise<T>,
  options: UseApiOptions = {}
): UseApiResult<T, TArgs> {
  const {
    immediate = false,
    onSuccess,
    onError,
    resetErrorOnRequest = true,
  } = options;

  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: immediate,
    error: null,
    called: false,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      abortControllerRef.current?.abort();
    };
  }, []);

  const execute = useCallback(
    async (...args: TArgs): Promise<T | null> => {
      // Abort previous request
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();

      setState((prev) => ({
        ...prev,
        loading: true,
        error: resetErrorOnRequest ? null : prev.error,
        called: true,
      }));

      try {
        const result = await apiFunction(...args);

        if (mountedRef.current) {
          setState((prev) => ({
            ...prev,
            data: result,
            loading: false,
            error: null,
          }));
          onSuccess?.(result);
        }

        return result;
      } catch (err) {
        const apiError = err instanceof ApiError ? err : new ApiError({
          status: 0,
          code: 'UNKNOWN_ERROR',
          message: err instanceof Error ? err.message : 'Unknown error',
          timestamp: new Date().toISOString(),
          path: '',
        });

        if (mountedRef.current) {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: apiError,
          }));
          onError?.(apiError);
        }

        return null;
      }
    },
    [apiFunction, onSuccess, onError, resetErrorOnRequest]
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      called: false,
    });
  }, []);

  const setData = useCallback((data: T | null) => {
    setState((prev) => ({ ...prev, data }));
  }, []);

  const abort = useCallback(() => {
    abortControllerRef.current?.abort();
    setState((prev) => ({ ...prev, loading: false }));
  }, []);

  // Execute immediately if requested
  useEffect(() => {
    if (immediate) {
      execute(...([] as unknown as TArgs));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    ...state,
    execute,
    reset,
    setData,
    abort,
  };
}

/**
 * Hook for paginated API calls
 */
export interface UsePaginatedApiOptions<T> extends UseApiOptions {
  /** Initial page (default: 0) */
  initialPage?: number;
  /** Page size (default: 10) */
  pageSize?: number;
  /** Merge new items with existing (for infinite scroll) */
  mergeItems?: boolean;
  /** Get items from response */
  getItems?: (response: T) => unknown[];
  /** Check if there are more pages */
  hasMorePages?: (response: T) => boolean;
}

export interface UsePaginatedApiResult<T, TArgs extends unknown[]> {
  /** Current items */
  items: unknown[];
  /** Full response data */
  data: T | null;
  /** Loading state */
  loading: boolean;
  /** Loading more items */
  loadingMore: boolean;
  /** Error object */
  error: ApiError | null;
  /** Current page */
  page: number;
  /** Has more pages */
  hasMore: boolean;
  /** Load first page */
  load: (...args: TArgs) => Promise<void>;
  /** Load next page */
  loadMore: (...args: TArgs) => Promise<void>;
  /** Refresh (reload first page) */
  refresh: (...args: TArgs) => Promise<void>;
  /** Reset state */
  reset: () => void;
}

export function usePaginatedApi<T, TArgs extends unknown[] = []>(
  apiFunction: (page: number, ...args: TArgs) => Promise<T>,
  options: UsePaginatedApiOptions<T> = {}
): UsePaginatedApiResult<T, TArgs> {
  const {
    initialPage = 0,
    // pageSize is available in options for external use
    mergeItems = true,
    getItems = (response) => (response as { content?: unknown[] }).content || [],
    hasMorePages = (response) => {
      const r = response as { hasNext?: boolean; last?: boolean };
      if (r.hasNext !== undefined) return r.hasNext;
      if (r.last !== undefined) return !r.last;
      return false;
    },
    onSuccess,
    onError,
  } = options;

  const [items, setItems] = useState<unknown[]>([]);
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(true);

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const load = useCallback(
    async (...args: TArgs) => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiFunction(initialPage, ...args);

        if (mountedRef.current) {
          setData(response);
          setItems(getItems(response));
          setPage(initialPage);
          setHasMore(hasMorePages(response));
          setLoading(false);
          onSuccess?.(response);
        }
      } catch (err) {
        if (mountedRef.current) {
          const apiError = err instanceof ApiError ? err : new ApiError({
            status: 0,
            code: 'UNKNOWN_ERROR',
            message: err instanceof Error ? err.message : 'Unknown error',
            timestamp: new Date().toISOString(),
            path: '',
          });
          setError(apiError);
          setLoading(false);
          onError?.(apiError);
        }
      }
    },
    [apiFunction, initialPage, getItems, hasMorePages, onSuccess, onError]
  );

  const loadMore = useCallback(
    async (...args: TArgs) => {
      if (!hasMore || loadingMore) return;

      setLoadingMore(true);

      try {
        const nextPage = page + 1;
        const response = await apiFunction(nextPage, ...args);

        if (mountedRef.current) {
          setData(response);
          const newItems = getItems(response);
          setItems((prev) => (mergeItems ? [...prev, ...newItems] : newItems));
          setPage(nextPage);
          setHasMore(hasMorePages(response));
          setLoadingMore(false);
          onSuccess?.(response);
        }
      } catch (err) {
        if (mountedRef.current) {
          const apiError = err instanceof ApiError ? err : new ApiError({
            status: 0,
            code: 'UNKNOWN_ERROR',
            message: err instanceof Error ? err.message : 'Unknown error',
            timestamp: new Date().toISOString(),
            path: '',
          });
          setError(apiError);
          setLoadingMore(false);
          onError?.(apiError);
        }
      }
    },
    [apiFunction, page, hasMore, loadingMore, getItems, hasMorePages, mergeItems, onSuccess, onError]
  );

  const refresh = useCallback(
    async (...args: TArgs) => {
      setItems([]);
      await load(...args);
    },
    [load]
  );

  const reset = useCallback(() => {
    setItems([]);
    setData(null);
    setLoading(false);
    setLoadingMore(false);
    setError(null);
    setPage(initialPage);
    setHasMore(true);
  }, [initialPage]);

  return {
    items,
    data,
    loading,
    loadingMore,
    error,
    page,
    hasMore,
    load,
    loadMore,
    refresh,
    reset,
  };
}
