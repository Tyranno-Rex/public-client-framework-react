/**
 * Advertisement API Service
 * Matches Spring Boot AdController endpoints
 */

import { getApiClient } from '../client';
import type { ApiResponse } from '../types';

const AD_BASE = '/api/ads';

export interface AdConfig {
  id: string;
  type: 'INTERSTITIAL' | 'BANNER' | 'NATIVE';
  imageUrl: string;
  clickUrl?: string;
  isActive: boolean;
  priority: number;
  startDate?: string;
  endDate?: string;
  title?: string;
  description?: string;
}

export interface AdConfigCreateRequest {
  type: 'INTERSTITIAL' | 'BANNER' | 'NATIVE';
  imageUrl: string;
  clickUrl?: string;
  isActive?: boolean;
  priority?: number;
  startDate?: string;
  endDate?: string;
  title?: string;
  description?: string;
}

export interface AdEventRequest {
  adId: string;
  userId?: string;
  deviceInfo?: string;
}

export interface AdStatistics {
  id: string;
  adId: string;
  date: string;
  totalImpressions: number;
  totalClicks: number;
  uniqueUsers: number;
  ctr: number;
}

export const adApi = {
  /**
   * Create ad configuration (Admin only)
   * POST /api/ads
   */
  createAdConfig: async (request: AdConfigCreateRequest): Promise<AdConfig> => {
    const response = await getApiClient().post<ApiResponse<AdConfig>>(
      AD_BASE,
      request
    );
    return response.data.data;
  },

  /**
   * Get all active ads
   * GET /api/ads/active
   */
  getActiveAds: async (): Promise<AdConfig[]> => {
    const response = await getApiClient().get<ApiResponse<AdConfig[]>>(
      `${AD_BASE}/active`
    );
    return response.data.data;
  },

  /**
   * Get active ads by type
   * GET /api/ads/active/{type}
   */
  getActiveAdsByType: async (type: AdConfig['type']): Promise<AdConfig[]> => {
    const response = await getApiClient().get<ApiResponse<AdConfig[]>>(
      `${AD_BASE}/active/${type}`
    );
    return response.data.data;
  },

  /**
   * Get interstitial ad (for app launch)
   * GET /api/ads/interstitial
   */
  getInterstitialAd: async (): Promise<AdConfig | null> => {
    const response = await getApiClient().get<ApiResponse<AdConfig | null>>(
      `${AD_BASE}/interstitial`
    );
    return response.data.data;
  },

  /**
   * Get ad configuration by ID
   * GET /api/ads/{id}
   */
  getAdConfig: async (id: string): Promise<AdConfig> => {
    const response = await getApiClient().get<ApiResponse<AdConfig>>(
      `${AD_BASE}/${id}`
    );
    return response.data.data;
  },

  /**
   * Delete ad configuration (Admin only)
   * DELETE /api/ads/{id}
   */
  deleteAdConfig: async (id: string): Promise<string> => {
    const response = await getApiClient().delete<ApiResponse<string>>(
      `${AD_BASE}/${id}`
    );
    return response.data.data;
  },

  /**
   * Record ad impression event
   * POST /api/ads/impression
   */
  recordImpression: async (request: AdEventRequest): Promise<string> => {
    const response = await getApiClient().post<ApiResponse<string>>(
      `${AD_BASE}/impression`,
      request
    );
    return response.data.data;
  },

  /**
   * Record ad click event
   * POST /api/ads/click
   */
  recordClick: async (request: AdEventRequest): Promise<string> => {
    const response = await getApiClient().post<ApiResponse<string>>(
      `${AD_BASE}/click`,
      request
    );
    return response.data.data;
  },

  /**
   * Get ad statistics for a specific date
   * GET /api/ads/{id}/statistics
   */
  getStatistics: async (id: string, date?: string): Promise<AdStatistics> => {
    const params = date ? { date } : {};
    const response = await getApiClient().get<ApiResponse<AdStatistics>>(
      `${AD_BASE}/${id}/statistics`,
      { params }
    );
    return response.data.data;
  },

  /**
   * Get ad statistics for a period
   * GET /api/ads/{id}/statistics/period
   */
  getStatisticsByPeriod: async (
    id: string,
    startDate: string,
    endDate: string
  ): Promise<AdStatistics[]> => {
    const response = await getApiClient().get<ApiResponse<AdStatistics[]>>(
      `${AD_BASE}/${id}/statistics/period`,
      { params: { startDate, endDate } }
    );
    return response.data.data;
  },

  /**
   * Get recent ad statistics (last 30 days)
   * GET /api/ads/{id}/statistics/recent
   */
  getRecentStatistics: async (id: string): Promise<AdStatistics[]> => {
    const response = await getApiClient().get<ApiResponse<AdStatistics[]>>(
      `${AD_BASE}/${id}/statistics/recent`
    );
    return response.data.data;
  },

  /**
   * Get all ads statistics for a specific date
   * GET /api/ads/statistics/daily
   */
  getAllStatisticsByDate: async (date?: string): Promise<AdStatistics[]> => {
    const params = date ? { date } : {};
    const response = await getApiClient().get<ApiResponse<AdStatistics[]>>(
      `${AD_BASE}/statistics/daily`,
      { params }
    );
    return response.data.data;
  },
};
