/**
 * gRPC Client - Base client configuration
 *
 * Usage:
 * 1. Generate proto files: npm run proto:generate
 * 2. Import services from generated files
 * 3. Use createGrpcClient to create client instances
 */

import { grpc } from '@improbable-eng/grpc-web';

export interface GrpcClientConfig {
  /** gRPC endpoint URL (e.g., 'http://localhost:8080') */
  baseUrl: string;
  /** Enable debug logging */
  debug?: boolean;
  /** Request timeout in ms */
  timeout?: number;
  /** Custom headers */
  headers?: Record<string, string>;
}

/**
 * Default gRPC client configuration
 */
const defaultConfig: GrpcClientConfig = {
  baseUrl: import.meta.env.VITE_GRPC_URL || 'http://localhost:8080',
  debug: import.meta.env.DEV,
  timeout: 10000,
};

/**
 * Create gRPC metadata from headers
 */
export function createMetadata(headers: Record<string, string> = {}): grpc.Metadata {
  const metadata = new grpc.Metadata();
  Object.entries(headers).forEach(([key, value]) => {
    metadata.set(key, value);
  });
  return metadata;
}

/**
 * Get authorization header with access token
 */
export function getAuthHeader(accessToken?: string): Record<string, string> {
  if (!accessToken) return {};
  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

/**
 * Create gRPC client with configuration
 *
 * Example:
 * ```ts
 * const config = createGrpcClient({ baseUrl: 'http://localhost:8080' });
 * const healthService = new HealthServiceClient(config.baseUrl);
 * ```
 */
export function createGrpcClient(config: Partial<GrpcClientConfig> = {}): GrpcClientConfig {
  return {
    ...defaultConfig,
    ...config,
  };
}

/**
 * gRPC error handler
 */
export function handleGrpcError(error: grpc.Error): Error {
  const message = error.message || 'gRPC request failed';
  const code = error.code;

  if (defaultConfig.debug) {
    console.error('[gRPC Error]', { code, message, error });
  }

  return new Error(`[gRPC ${code}] ${message}`);
}

/**
 * NOTE: After generating proto files with `npm run proto:generate`,
 * import and use service clients like this:
 *
 * ```ts
 * import { HealthServiceClient } from './generated/health_grpc_web_pb';
 * import { Empty } from './generated/common_pb';
 *
 * const config = createGrpcClient();
 * const healthClient = new HealthServiceClient(config.baseUrl);
 *
 * const request = new Empty();
 * healthClient.check(request, createMetadata(), (err, response) => {
 *   if (err) {
 *     console.error(handleGrpcError(err));
 *     return;
 *   }
 *   console.log('Health:', response.toObject());
 * });
 * ```
 */
