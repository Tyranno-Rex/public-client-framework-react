/**
 * RealtimeContext - React context for WebSocket connection
 */

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { WebSocketClient, type WebSocketConfig, type ConnectionState } from './WebSocketClient';

interface RealtimeContextValue {
  /** WebSocket client instance */
  client: WebSocketClient | null;
  /** Current connection state */
  connectionState: ConnectionState;
  /** Connect to WebSocket server */
  connect: () => Promise<void>;
  /** Disconnect from WebSocket server */
  disconnect: () => void;
  /** Check if connected */
  isConnected: boolean;
}

const RealtimeContext = createContext<RealtimeContextValue | null>(null);

export interface RealtimeProviderProps {
  children: ReactNode;
  /** WebSocket configuration */
  config: WebSocketConfig;
  /** Auto connect on mount */
  autoConnect?: boolean;
  /** Get access token dynamically */
  getAccessToken?: () => string | null;
}

export function RealtimeProvider({
  children,
  config,
  autoConnect = false,
  getAccessToken,
}: RealtimeProviderProps) {
  const [client] = useState(() => new WebSocketClient(config));
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');

  // Listen to state changes
  useEffect(() => {
    const unsubscribe = client.onStateChange(setConnectionState);
    return unsubscribe;
  }, [client]);

  // Update token when it changes
  useEffect(() => {
    if (getAccessToken) {
      const token = getAccessToken();
      if (token) {
        client.setAccessToken(token);
      }
    }
  }, [client, getAccessToken]);

  // Auto connect
  useEffect(() => {
    if (autoConnect) {
      client.connect().catch(console.error);
    }

    return () => {
      client.disconnect();
    };
  }, [client, autoConnect]);

  const connect = useCallback(async () => {
    if (getAccessToken) {
      const token = getAccessToken();
      if (token) {
        client.setAccessToken(token);
      }
    }
    await client.connect();
  }, [client, getAccessToken]);

  const disconnect = useCallback(() => {
    client.disconnect();
  }, [client]);

  const value: RealtimeContextValue = {
    client,
    connectionState,
    connect,
    disconnect,
    isConnected: connectionState === 'connected',
  };

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime(): RealtimeContextValue {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within RealtimeProvider');
  }
  return context;
}
