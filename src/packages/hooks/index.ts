/**
 * Hooks Package - Public exports
 */

// Authentication
export { useAuth } from './useAuth';

// State management
export { useLocalStorage } from './useLocalStorage';
export { useAsync, type UseAsyncState, type UseAsyncOptions } from './useAsync';
export { useToggle, useDisclosure, type UseToggleReturn } from './useToggle';

// Media and responsive
export {
  useMediaQuery,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  usePrefersDarkMode,
  usePrefersReducedMotion,
} from './useMediaQuery';
export {
  useWindowSize,
  useScrollPosition,
  useScrollDirection,
  type WindowSize,
  type ScrollPosition,
  type ScrollDirection,
} from './useWindowSize';

// DOM interactions
export { useOnClickOutside } from './useOnClickOutside';
export { useKeyPress, useEscapeKey, useEnterKey } from './useKeyPress';
export { useCopyToClipboard, type UseCopyToClipboardReturn } from './useCopyToClipboard';
