/**
 * App Configuration
 */

export const config = {
  // API Settings
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
    timeout: 30000,
  },

  // App Info
  app: {
    name: import.meta.env.VITE_APP_NAME || 'My App',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  },

  // Feature Flags
  features: {
    enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    enablePushNotifications: import.meta.env.VITE_ENABLE_PUSH === 'true',
  },
} as const;

export default config;
