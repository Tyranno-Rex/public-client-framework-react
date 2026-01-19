import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from './authStore';

describe('authStore', () => {
  beforeEach(() => {
    // 스토어 초기화
    useAuthStore.getState().logout();
  });

  describe('login', () => {
    it('토큰 설정 시 isAuthenticated가 true가 됨', () => {
      const store = useAuthStore.getState();

      store.setTokens('access-token', 'refresh-token');

      expect(store.accessToken).toBe('access-token');
      expect(store.refreshToken).toBe('refresh-token');
      expect(store.isAuthenticated).toBe(true);
    });

    it('사용자 정보 설정', () => {
      const store = useAuthStore.getState();
      const user = {
        id: '123',
        email: 'test@example.com',
        username: 'testuser',
      };

      store.setUser(user);

      expect(store.user).toEqual(user);
    });
  });

  describe('logout', () => {
    it('로그아웃 시 모든 상태 초기화', () => {
      const store = useAuthStore.getState();

      // 먼저 로그인 상태로 만들기
      store.setTokens('access-token', 'refresh-token');
      store.setUser({ id: '123', email: 'test@example.com' });

      // 로그아웃
      store.logout();

      expect(store.accessToken).toBeNull();
      expect(store.refreshToken).toBeNull();
      expect(store.user).toBeNull();
      expect(store.isAuthenticated).toBe(false);
    });
  });

  describe('setAccessToken', () => {
    it('액세스 토큰만 업데이트', () => {
      const store = useAuthStore.getState();

      store.setTokens('old-access', 'refresh-token');
      store.setAccessToken('new-access');

      expect(store.accessToken).toBe('new-access');
      expect(store.refreshToken).toBe('refresh-token');
    });
  });

  describe('clearTokens', () => {
    it('토큰만 삭제하고 사용자 정보는 유지', () => {
      const store = useAuthStore.getState();
      const user = { id: '123', email: 'test@example.com' };

      store.setTokens('access-token', 'refresh-token');
      store.setUser(user);
      store.clearTokens();

      expect(store.accessToken).toBeNull();
      expect(store.refreshToken).toBeNull();
      expect(store.user).toEqual(user);
      expect(store.isAuthenticated).toBe(false);
    });
  });

  describe('selectors', () => {
    it('isAuthenticated 셀렉터', () => {
      const store = useAuthStore.getState();

      expect(useAuthStore.getState().isAuthenticated).toBe(false);

      store.setTokens('token', 'refresh');

      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });
  });
});
