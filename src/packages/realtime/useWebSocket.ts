/**
 * useWebSocket - Hook for WebSocket connection management
 */

import { useEffect, useCallback, useRef } from 'react';
import { useRealtime } from './RealtimeContext';

interface UseWebSocketOptions {
  /** Auto connect when hook mounts */
  autoConnect?: boolean;
  /** Callback when connected */
  onConnect?: () => void;
  /** Callback when disconnected */
  onDisconnect?: () => void;
  /** Callback when error occurs */
  onError?: (error: Error) => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { client, connectionState, connect, disconnect, isConnected } = useRealtime();
  const { autoConnect = false, onConnect, onDisconnect, onError } = options;

  const prevConnectedRef = useRef(isConnected);

  // Handle connection state changes
  useEffect(() => {
    if (isConnected && !prevConnectedRef.current) {
      onConnect?.();
    } else if (!isConnected && prevConnectedRef.current) {
      onDisconnect?.();
    }
    prevConnectedRef.current = isConnected;
  }, [isConnected, onConnect, onDisconnect]);

  // Listen to errors
  useEffect(() => {
    if (!client || !onError) return;
    return client.onError(onError);
  }, [client, onError]);

  // Auto connect
  useEffect(() => {
    if (autoConnect && !isConnected) {
      connect().catch(onError);
    }
  }, [autoConnect, isConnected, connect, onError]);

  // Send message helper
  const send = useCallback(
    (destination: string, body: unknown) => {
      client?.send(destination, body);
    },
    [client]
  );

  return {
    connectionState,
    isConnected,
    connect,
    disconnect,
    send,
  };
}
