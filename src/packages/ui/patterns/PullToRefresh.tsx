/**
 * PullToRefresh - Mobile pull-to-refresh pattern
 */

import { useState, useRef, useCallback, type ReactNode, type TouchEvent } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface PullToRefreshProps {
  /** Content to render */
  children: ReactNode;
  /** Refresh callback */
  onRefresh: () => Promise<void>;
  /** Pull threshold in pixels (default: 80) */
  threshold?: number;
  /** Max pull distance (default: 120) */
  maxPull?: number;
  /** Disabled state */
  disabled?: boolean;
  /** Additional class name */
  className?: string;
}

export function PullToRefresh({
  children,
  onRefresh,
  threshold = 80,
  maxPull = 120,
  disabled = false,
  className,
}: PullToRefreshProps) {
  const [pulling, setPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);

  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (disabled || refreshing) return;

    // Only start pull if at top of scroll
    const container = containerRef.current;
    if (container && container.scrollTop > 0) return;

    startY.current = e.touches[0].clientY;
    setPulling(true);
  }, [disabled, refreshing]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!pulling || disabled || refreshing) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;

    if (diff > 0) {
      // Apply resistance
      const resistance = 0.5;
      const distance = Math.min(diff * resistance, maxPull);
      setPullDistance(distance);

      // Prevent default scroll
      if (distance > 0) {
        e.preventDefault();
      }
    }
  }, [pulling, disabled, refreshing, maxPull]);

  const handleTouchEnd = useCallback(async () => {
    if (!pulling || disabled) return;

    setPulling(false);

    if (pullDistance >= threshold) {
      setRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
      }
    }

    setPullDistance(0);
  }, [pulling, disabled, pullDistance, threshold, onRefresh]);

  const progress = Math.min(pullDistance / threshold, 1);
  const rotation = progress * 180;

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-y-auto', className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <motion.div
        className="absolute left-0 right-0 flex justify-center z-10"
        style={{
          top: -40,
          y: pullDistance > 0 || refreshing ? pullDistance : 0,
        }}
        animate={{
          y: refreshing ? threshold : pullDistance,
        }}
      >
        <div
          className={cn(
            'w-10 h-10 rounded-full bg-white dark:bg-dark-card shadow-lg',
            'flex items-center justify-center'
          )}
        >
          <RefreshCw
            className={cn(
              'w-5 h-5 text-primary-500',
              refreshing && 'animate-spin'
            )}
            style={{
              transform: refreshing ? undefined : `rotate(${rotation}deg)`,
              opacity: progress,
            }}
          />
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        animate={{
          y: refreshing ? threshold * 0.5 : pulling ? pullDistance : 0,
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30,
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
