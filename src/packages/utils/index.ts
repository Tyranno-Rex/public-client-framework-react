/**
 * Utils Package - Public exports
 */

// Class name utility
export { cn } from './cn';

// Formatting utilities
export {
  formatCurrency,
  formatNumber,
  formatCompactNumber,
  formatPercent,
  formatRelativeTime,
  formatDate,
  formatShortDate,
  formatTime,
  formatPhoneNumber,
  truncate,
  formatFileSize,
} from './formatting';

// Performance utilities
export {
  debounce,
  useDebounce,
  throttle,
  useThrottle,
  memoize,
  usePrevious,
  useIntersectionObserver,
  useLazyImage,
  useIdleCallback,
  measureAsync,
  markPerformance,
  measurePerformance,
} from './performance';

// Storage utilities
export {
  Storage,
  storage,
  sessionStore,
  getStorageItem,
  setStorageItem,
  removeStorageItem,
} from './storage';
export type { StorageDriver } from './storage';

// Validation utilities
export {
  validators,
  validate,
  validateForm,
} from './validation';
export type { ValidationResult, FormErrors } from './validation';
