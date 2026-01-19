/**
 * InfiniteScroll - Automatic loading when scrolling
 */

import { useEffect, useRef, useCallback, type ReactNode } from 'react';
import { cn } from '../../utils/cn';

export interface InfiniteScrollProps {
  /** Children to render */
  children: ReactNode;
  /** Load more callback */
  onLoadMore: () => void | Promise<void>;
  /** Has more items to load */
  hasMore: boolean;
  /** Loading state */
  loading?: boolean;
  /** Custom loader element */
  loader?: ReactNode;
  /** End message */
  endMessage?: ReactNode;
  /** Threshold in pixels before loading more (default: 200) */
  threshold?: number;
  /** Use window scroll instead of container scroll */
  useWindow?: boolean;
  /** Additional class name */
  className?: string;
}

export function InfiniteScroll({
  children,
  onLoadMore,
  hasMore,
  loading = false,
  loader,
  endMessage,
  threshold = 200,
  useWindow = false,
  className,
}: InfiniteScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  const handleScroll = useCallback(() => {
    if (loadingRef.current || loading || !hasMore) return;

    let shouldLoad = false;

    if (useWindow) {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      shouldLoad = scrollTop + windowHeight >= docHeight - threshold;
    } else if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      shouldLoad = scrollTop + clientHeight >= scrollHeight - threshold;
    }

    if (shouldLoad) {
      loadingRef.current = true;
      Promise.resolve(onLoadMore()).finally(() => {
        loadingRef.current = false;
      });
    }
  }, [onLoadMore, hasMore, loading, threshold, useWindow]);

  useEffect(() => {
    const target = useWindow ? window : containerRef.current;
    if (!target) return;

    target.addEventListener('scroll', handleScroll);
    return () => target.removeEventListener('scroll', handleScroll);
  }, [handleScroll, useWindow]);

  // Check on mount and when hasMore changes
  useEffect(() => {
    handleScroll();
  }, [hasMore, handleScroll]);

  const defaultLoader = (
    <div className="flex items-center justify-center py-6">
      <div className="w-6 h-6 border-2 border-gray-300 border-t-primary-500 rounded-full animate-spin" />
    </div>
  );

  const defaultEndMessage = (
    <div className="text-center py-6 text-sm text-gray-500 dark:text-gray-400">
      모든 항목을 불러왔습니다
    </div>
  );

  return (
    <div
      ref={useWindow ? undefined : containerRef}
      className={cn(!useWindow && 'overflow-y-auto', className)}
    >
      {children}

      {loading && (loader || defaultLoader)}

      {!hasMore && !loading && (endMessage ?? defaultEndMessage)}
    </div>
  );
}
