/**
 * ErrorBoundary - Catch and handle React component errors
 */

import { Component, type ReactNode, type ErrorInfo } from 'react';
import { cn } from '../../utils/cn';

export interface ErrorBoundaryProps {
  children: ReactNode;
  /** Fallback UI when error occurs */
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  /** Error callback */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Show reset button */
  showReset?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.props.onError?.(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      // Custom fallback
      if (this.props.fallback) {
        if (typeof this.props.fallback === 'function') {
          return this.props.fallback(this.state.error, this.handleReset);
        }
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <DefaultErrorFallback
          error={this.state.error}
          onReset={this.props.showReset !== false ? this.handleReset : undefined}
        />
      );
    }

    return this.props.children;
  }
}

/** Default error fallback UI */
function DefaultErrorFallback({
  error,
  onReset,
}: {
  error: Error;
  onReset?: () => void;
}) {
  const isDev = import.meta.env?.MODE === 'development';

  return (
    <div
      className={cn(
        'min-h-[200px] flex flex-col items-center justify-center p-6',
        'bg-red-50 dark:bg-red-900/20 rounded-2xl'
      )}
    >
      <div className="text-center space-y-4">
        <div className="text-4xl">😵</div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          문제가 발생했습니다
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md">
          예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
        </p>

        {isDev && (
          <details className="text-left mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg text-xs">
            <summary className="cursor-pointer font-medium text-red-600 dark:text-red-400">
              Error Details (Dev Only)
            </summary>
            <pre className="mt-2 overflow-auto max-h-40 text-gray-700 dark:text-gray-300">
              {error.message}
              {'\n\n'}
              {error.stack}
            </pre>
          </details>
        )}

        {onReset && (
          <button
            onClick={onReset}
            className={cn(
              'px-4 py-2 rounded-xl font-medium text-sm',
              'bg-primary-500 text-white hover:bg-primary-600',
              'transition-colors'
            )}
          >
            다시 시도
          </button>
        )}
      </div>
    </div>
  );
}

/** Page-level error fallback */
export function PageErrorFallback({
  error,
  onReset,
}: {
  error: Error;
  onReset?: () => void;
}) {
  const isDev = import.meta.env?.MODE === 'development';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-dark-bg">
      <div className="text-center space-y-6 max-w-md">
        <div className="text-6xl">🚫</div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          페이지를 표시할 수 없습니다
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          예상치 못한 오류가 발생했습니다.
          <br />
          문제가 계속되면 고객센터에 문의해주세요.
        </p>

        {isDev && (
          <div className="text-left p-4 bg-white dark:bg-gray-800 rounded-xl text-xs border border-red-200 dark:border-red-800">
            <p className="font-medium text-red-600 dark:text-red-400 mb-2">
              {error.name}: {error.message}
            </p>
            <pre className="overflow-auto max-h-32 text-gray-600 dark:text-gray-400">
              {error.stack}
            </pre>
          </div>
        )}

        <div className="flex gap-3 justify-center">
          {onReset && (
            <button
              onClick={onReset}
              className={cn(
                'px-6 py-3 rounded-xl font-medium',
                'bg-primary-500 text-white hover:bg-primary-600',
                'transition-colors'
              )}
            >
              다시 시도
            </button>
          )}
          <button
            onClick={() => window.location.href = '/'}
            className={cn(
              'px-6 py-3 rounded-xl font-medium',
              'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
              'hover:bg-gray-200 dark:hover:bg-gray-700',
              'transition-colors'
            )}
          >
            홈으로
          </button>
        </div>
      </div>
    </div>
  );
}

export default ErrorBoundary;
