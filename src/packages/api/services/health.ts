/**
 * Health Check API Service
 * Matches Spring Boot HealthController endpoints
 */

import { getApiClient } from '../client';
import type { ApiResponse, HealthStatus } from '../types';

const HEALTH_BASE = '/api/health';

export const healthApi = {
  /**
   * Full system health check
   * GET /api/health
   */
  check: async (): Promise<HealthStatus> => {
    const response = await getApiClient().get<ApiResponse<HealthStatus>>(HEALTH_BASE);
    return response.data.data;
  },

  /**
   * Simple ping for load balancer
   * GET /api/health/ping
   */
  ping: async (): Promise<string> => {
    const response = await getApiClient().get<ApiResponse<string>>(`${HEALTH_BASE}/ping`);
    return response.data.data;
  },

  /**
   * Database connection status
   * GET /api/health/db
   */
  database: async (): Promise<{ status: string; type?: string }> => {
    const response = await getApiClient().get<ApiResponse<{ status: string; type?: string }>>(
      `${HEALTH_BASE}/db`
    );
    return response.data.data;
  },

  /**
   * Redis connection status
   * GET /api/health/redis
   */
  redis: async (): Promise<{ status: string }> => {
    const response = await getApiClient().get<ApiResponse<{ status: string }>>(
      `${HEALTH_BASE}/redis`
    );
    return response.data.data;
  },
};
