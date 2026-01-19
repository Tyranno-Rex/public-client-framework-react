/**
 * useLogger - Hook for component-scoped logging
 */

import { useMemo } from 'react';
import { Logger, logger } from './Logger';

/**
 * Create a logger scoped to a component
 * @param componentName - Name of the component for context
 */
export function useLogger(componentName: string): Logger {
  return useMemo(() => logger.child(componentName), [componentName]);
}
