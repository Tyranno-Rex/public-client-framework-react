/**
 * useSubscription - Hook for subscribing to WebSocket topics
 */

import { useEffect, useCallback, useState, useRef } from 'react';
import { useRealtime } from './RealtimeContext';

interface UseSubscriptionOptions<T> {
  /** Only subscribe when this is true */
  enabled?: boolean;
  /** Callback when message received */
  onMessage?: (message: T) => void;
  /** Callback when error occurs */
  onError?: (error: Error) => void;
}

/**
 * Subscribe to a WebSocket destination
 * @param destination - STOMP destination (e.g., '/topic/chat/room1')
 * @param options - Subscription options
 */
export function useSubscription<T = unknown>(
  destination: string,
  options: UseSubscriptionOptions<T> = {}
) {
  const { client, isConnected } = useRealtime();
  const { enabled = true, onMessage, onError } = options;

  const [lastMessage, setLastMessage] = useState<T | null>(null);
  const [messages, setMessages] = useState<T[]>([]);

  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  // Subscribe when connected
  useEffect(() => {
    if (!client || !isConnected || !enabled) return;

    const handleMessage = (message: unknown) => {
      const typedMessage = message as T;
      setLastMessage(typedMessage);
      setMessages((prev) => [...prev, typedMessage]);
      onMessageRef.current?.(typedMessage);
    };

    const unsubscribe = client.subscribe(destination, handleMessage);

    return () => {
      unsubscribe();
    };
  }, [client, isConnected, enabled, destination]);

  // Listen to errors
  useEffect(() => {
    if (!client || !onError) return;
    return client.onError(onError);
  }, [client, onError]);

  // Clear messages
  const clearMessages = useCallback(() => {
    setMessages([]);
    setLastMessage(null);
  }, []);

  return {
    /** Last received message */
    lastMessage,
    /** All received messages */
    messages,
    /** Clear message history */
    clearMessages,
    /** Whether currently subscribed */
    isSubscribed: isConnected && enabled,
  };
}
