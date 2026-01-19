/**
 * Realtime Package - WebSocket/STOMP client for real-time communication
 * Optional package - only install when needed
 */

export { WebSocketClient, type WebSocketConfig, type ConnectionState } from './WebSocketClient';
export { useWebSocket } from './useWebSocket';
export { useSubscription } from './useSubscription';
export { RealtimeProvider, useRealtime } from './RealtimeContext';
