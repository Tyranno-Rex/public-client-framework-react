/**
 * ErrorReporter - Centralized error reporting
 * Designed to integrate with Sentry, Datadog, or custom endpoints
 */

export interface ErrorContext {
  /** User ID if authenticated */
  userId?: string;
  /** Current route/page */
  route?: string;
  /** Additional metadata */
  tags?: Record<string, string>;
  /** Extra data */
  extra?: Record<string, unknown>;
}

export interface ErrorReporterConfig {
  /** Enable error reporting */
  enabled: boolean;
  /** Environment name */
  environment: string;
  /** App version */
  version?: string;
  /** Custom error endpoint */
  endpoint?: string;
  /** Before send hook - return false to skip */
  beforeSend?: (error: Error, context: ErrorContext) => boolean;
  /** Custom send function (for Sentry SDK, etc.) */
  sendError?: (error: Error, context: ErrorContext) => void;
}

const defaultConfig: ErrorReporterConfig = {
  enabled: import.meta.env?.MODE === 'production',
  environment: import.meta.env?.MODE || 'development',
  version: import.meta.env?.VITE_APP_VERSION,
};

export class ErrorReporter {
  private config: ErrorReporterConfig;
  private globalContext: ErrorContext = {};

  constructor(config: Partial<ErrorReporterConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  /** Configure the error reporter */
  configure(config: Partial<ErrorReporterConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /** Set global context (user info, etc.) */
  setContext(context: Partial<ErrorContext>): void {
    this.globalContext = { ...this.globalContext, ...context };
  }

  /** Set user context */
  setUser(userId: string | null): void {
    if (userId) {
      this.globalContext.userId = userId;
    } else {
      delete this.globalContext.userId;
    }
  }

  /** Clear all context */
  clearContext(): void {
    this.globalContext = {};
  }

  /** Report an error */
  captureError(error: Error, context: ErrorContext = {}): void {
    if (!this.config.enabled) {
      console.error('[ErrorReporter] Error captured (reporting disabled):', error);
      return;
    }

    const mergedContext: ErrorContext = {
      ...this.globalContext,
      ...context,
      tags: { ...this.globalContext.tags, ...context.tags },
      extra: { ...this.globalContext.extra, ...context.extra },
    };

    // Before send hook
    if (this.config.beforeSend && !this.config.beforeSend(error, mergedContext)) {
      return;
    }

    // Use custom send function if provided
    if (this.config.sendError) {
      this.config.sendError(error, mergedContext);
      return;
    }

    // Default: send to endpoint
    if (this.config.endpoint) {
      this.sendToEndpoint(error, mergedContext);
    }
  }

  /** Capture a message as an error */
  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info'): void {
    const error = new Error(message);
    this.captureError(error, {
      tags: { level },
    });
  }

  /** Create error boundary handler */
  createErrorHandler(): (error: Error, errorInfo: { componentStack: string }) => void {
    return (error, errorInfo) => {
      this.captureError(error, {
        extra: {
          componentStack: errorInfo.componentStack,
        },
      });
    };
  }

  private async sendToEndpoint(error: Error, context: ErrorContext): Promise<void> {
    if (!this.config.endpoint) return;

    try {
      const payload = {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
        context,
        environment: this.config.environment,
        version: this.config.version,
        timestamp: new Date().toISOString(),
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      };

      await fetch(this.config.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (sendError) {
      console.error('[ErrorReporter] Failed to send error:', sendError);
    }
  }
}

/** Global error reporter instance */
export const errorReporter = new ErrorReporter();

export default errorReporter;
