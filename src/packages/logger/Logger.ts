/**
 * Logger - Centralized logging system
 * - Development: Console output with colors
 * - Production: Send to external services (Sentry, Datadog, etc.)
 */

export const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
} as const;

export type LogLevel = typeof LogLevel[keyof typeof LogLevel];

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: string;
  data?: unknown;
  error?: Error;
}

export interface LogConfig {
  /** Minimum log level to output */
  minLevel: LogLevel;
  /** Enable console output */
  enableConsole: boolean;
  /** Custom log handler (for external services) */
  onLog?: (entry: LogEntry) => void;
  /** Custom error handler (for Sentry, etc.) */
  onError?: (error: Error, context?: Record<string, unknown>) => void;
  /** Environment (auto-detected if not set) */
  environment?: 'development' | 'production' | 'test';
}

const defaultConfig: LogConfig = {
  minLevel: LogLevel.DEBUG,
  enableConsole: true,
  environment: import.meta.env?.MODE === 'production' ? 'production' : 'development',
};

export class Logger {
  private config: LogConfig;
  private context?: string;

  constructor(config: Partial<LogConfig> = {}, context?: string) {
    this.config = { ...defaultConfig, ...config };
    this.context = context;

    // In production, default to WARN level
    if (this.config.environment === 'production' && config.minLevel === undefined) {
      this.config.minLevel = LogLevel.WARN;
    }
  }

  /** Create a child logger with context */
  child(context: string): Logger {
    const childContext = this.context ? `${this.context}:${context}` : context;
    return new Logger(this.config, childContext);
  }

  /** Debug level log */
  debug(message: string, data?: unknown): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  /** Info level log */
  info(message: string, data?: unknown): void {
    this.log(LogLevel.INFO, message, data);
  }

  /** Warning level log */
  warn(message: string, data?: unknown): void {
    this.log(LogLevel.WARN, message, data);
  }

  /** Error level log */
  error(message: string, error?: Error | unknown, data?: unknown): void {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    this.log(LogLevel.ERROR, message, data, errorObj);
  }

  /** Log with timing */
  time(label: string): () => void {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      this.debug(`${label} completed in ${duration.toFixed(2)}ms`);
    };
  }

  /** Group related logs */
  group(label: string, fn: () => void): void {
    if (this.config.enableConsole && this.config.environment === 'development') {
      console.group(this.formatPrefix() + label);
      try {
        fn();
      } finally {
        console.groupEnd();
      }
    } else {
      fn();
    }
  }

  private log(level: LogLevel, message: string, data?: unknown, error?: Error): void {
    if (level < this.config.minLevel) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context: this.context,
      data,
      error,
    };

    // Console output
    if (this.config.enableConsole) {
      this.consoleLog(entry);
    }

    // Custom handler
    this.config.onLog?.(entry);

    // Error reporting
    if (level === LogLevel.ERROR && error && this.config.onError) {
      this.config.onError(error, {
        message,
        context: this.context,
        data,
      });
    }
  }

  private consoleLog(entry: LogEntry): void {
    const prefix = this.formatPrefix();
    const args: unknown[] = [prefix + entry.message];

    if (entry.data !== undefined) {
      args.push(entry.data);
    }
    if (entry.error) {
      args.push(entry.error);
    }

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(...args);
        break;
      case LogLevel.INFO:
        console.info(...args);
        break;
      case LogLevel.WARN:
        console.warn(...args);
        break;
      case LogLevel.ERROR:
        console.error(...args);
        break;
    }
  }

  private formatPrefix(): string {
    const parts: string[] = [];

    if (this.config.environment === 'development') {
      const time = new Date().toLocaleTimeString();
      parts.push(`[${time}]`);
    }

    if (this.context) {
      parts.push(`[${this.context}]`);
    }

    return parts.length > 0 ? parts.join(' ') + ' ' : '';
  }
}

/** Global logger instance */
export const logger = new Logger();

export default logger;
