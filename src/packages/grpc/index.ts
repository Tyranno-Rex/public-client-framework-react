/**
 * gRPC Package - gRPC-Web client for browser
 *
 * Setup:
 * 1. Install dependencies: npm install
 * 2. Generate proto files: npm run proto:generate
 * 3. Use gRPC clients in your components
 *
 * Note: This package provides the foundation for gRPC communication.
 * Service-specific clients will be available after proto generation.
 */

export {
  createGrpcClient,
  createMetadata,
  getAuthHeader,
  handleGrpcError,
  type GrpcClientConfig,
} from './GrpcClient';

/**
 * TODO: After proto generation, export service clients:
 *
 * export { HealthServiceClient } from './generated/health_grpc_web_pb';
 * export { UserServiceClient } from './generated/user_grpc_web_pb';
 *
 * And message types:
 * export * from './generated/common_pb';
 * export * from './generated/user_pb';
 * export * from './generated/health_pb';
 */
