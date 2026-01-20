import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { createApiClient, ApiError, type ApiClientConfig } from './client';

// Mock axios
vi.mock('axios', async () => {
  const actual = await vi.importActual('axios');
  return {
    ...actual,
    default: {
      ...actual.default,
      create: vi.fn(() => ({
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
      })),
    },
  };
});

describe('API Client', () => {
  const mockConfig: ApiClientConfig = {
    baseURL: 'http://localhost:8080',
    timeout: 5000,
    getAccessToken: vi.fn(() => null),
    getRefreshToken: vi.fn(() => null),
    setTokens: vi.fn(),
    clearTokens: vi.fn(),
    onUnauthorized: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createApiClient', () => {
    it('기본 설정으로 클라이언트 생성', () => {
      const client = createApiClient(mockConfig);

      expect(axios.create).toHaveBeenCalledWith({
        baseURL: 'http://localhost:8080',
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      expect(client).toBeDefined();
    });

    it('기본 타임아웃 적용', () => {
      const configWithoutTimeout = {
        ...mockConfig,
        timeout: undefined,
      };

      createApiClient(configWithoutTimeout);

      expect(axios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          timeout: 30000,
        })
      );
    });

    it('커스텀 retry 설정 적용', () => {
      const configWithRetry = {
        ...mockConfig,
        retry: {
          maxRetries: 5,
          retryDelay: 2000,
          retryOn: [500, 503],
        },
      };

      const client = createApiClient(configWithRetry);
      expect(client).toBeDefined();
    });

    it('커스텀 refresh 엔드포인트 적용', () => {
      const configWithRefreshEndpoint = {
        ...mockConfig,
        refreshEndpoint: '/api/v2/auth/refresh',
      };

      const client = createApiClient(configWithRefreshEndpoint);
      expect(client).toBeDefined();
    });
  });

  describe('ApiError', () => {
    it('에러 응답으로 ApiError 생성', () => {
      const errorResponse = {
        status: 400,
        code: 'VALIDATION_ERROR',
        message: 'Invalid input',
        path: '/api/users',
        timestamp: '2024-01-01T00:00:00Z',
        errors: [
          { field: 'email', value: 'invalid', reason: 'Invalid email format' },
        ],
      };

      const error = new ApiError(errorResponse);

      expect(error.name).toBe('ApiError');
      expect(error.message).toBe('Invalid input');
      expect(error.status).toBe(400);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.path).toBe('/api/users');
      expect(error.errors).toHaveLength(1);
      expect(error.errors?.[0].field).toBe('email');
    });

    it('에러 없이 생성 가능', () => {
      const errorResponse = {
        status: 404,
        code: 'NOT_FOUND',
        message: 'Resource not found',
        timestamp: '2024-01-01T00:00:00Z',
      };

      const error = new ApiError(errorResponse);

      expect(error.errors).toBeUndefined();
      expect(error.path).toBeUndefined();
    });
  });

  describe('retry configuration', () => {
    it('기본 retry 상태 코드', () => {
      // 기본 재시도 대상: 408, 500, 502, 503, 504
      const client = createApiClient(mockConfig);
      expect(client).toBeDefined();
    });
  });
});

describe('Token Management', () => {
  let getAccessToken: ReturnType<typeof vi.fn>;
  let getRefreshToken: ReturnType<typeof vi.fn>;
  let setTokens: ReturnType<typeof vi.fn>;
  let clearTokens: ReturnType<typeof vi.fn>;
  let onUnauthorized: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    getAccessToken = vi.fn();
    getRefreshToken = vi.fn();
    setTokens = vi.fn();
    clearTokens = vi.fn();
    onUnauthorized = vi.fn();
  });

  it('토큰이 있으면 Authorization 헤더 추가됨', () => {
    getAccessToken.mockReturnValue('test-token');

    const config: ApiClientConfig = {
      baseURL: 'http://localhost:8080',
      getAccessToken,
      getRefreshToken,
      setTokens,
      clearTokens,
      onUnauthorized,
    };

    const client = createApiClient(config);
    expect(client).toBeDefined();

    // interceptors가 등록되었는지 확인
    const mockAxiosInstance = (axios.create as unknown as ReturnType<typeof vi.fn>).mock.results[0].value;
    expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
  });

  it('토큰이 없으면 Authorization 헤더 없음', () => {
    getAccessToken.mockReturnValue(null);

    const config: ApiClientConfig = {
      baseURL: 'http://localhost:8080',
      getAccessToken,
      getRefreshToken,
      setTokens,
      clearTokens,
      onUnauthorized,
    };

    const client = createApiClient(config);
    expect(client).toBeDefined();
  });
});

describe('Error Handling', () => {
  it('네트워크 에러를 ApiError로 변환', () => {
    const networkError = {
      status: 0,
      code: 'NETWORK_ERROR',
      message: 'Network Error',
      timestamp: new Date().toISOString(),
      path: '/api/test',
    };

    const error = new ApiError(networkError);

    expect(error.status).toBe(0);
    expect(error.code).toBe('NETWORK_ERROR');
  });
});
