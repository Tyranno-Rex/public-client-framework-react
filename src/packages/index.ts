/**
 * Framework Public API - All packages exported from here
 *
 * Core packages are exported directly.
 * Optional packages (realtime, logger, i18n, form) should be imported separately.
 */

// ============================================
// Core Packages (always included)
// ============================================

// API - HTTP client, services, types
export * from './api';

// Store - Zustand state management
export * from './store';

// UI Components - Shared components and layouts
export * from './ui';

// Theme - Theme system
export * from './theme';

// Hooks - Custom React hooks
export * from './hooks';

// Utils - Utility functions
export * from './utils';

// Auth - Authentication helpers
export * from './auth';

// ============================================
// Optional Packages (import separately when needed)
// ============================================

// Realtime - WebSocket/STOMP client
// import { useWebSocket, useSubscription } from '@/packages/realtime';

// Logger - Centralized logging
// import { logger, useLogger } from '@/packages/logger';

// i18n - Internationalization
// import { I18nProvider, useTranslation } from '@/packages/i18n';

// Form - Form handling with validation
// import { useForm, validators } from '@/packages/form';
