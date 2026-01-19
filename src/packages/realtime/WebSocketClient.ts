/**
 * WebSocket Client - STOMP over WebSocket with reconnection
 * Matches Spring Boot server WebSocket configuration
 */

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';

export interface WebSocketConfig {
  /** WebSocket endpoint URL (e.g., 'ws://localhost:8080/ws') */
  url: string;
  /** Use SockJS fallback (for older browsers) */
  useSockJS?: boolean;
  /** JWT access token for authentication */
  accessToken?: string;
  /** Auto reconnect on disconnect */
  autoReconnect?: boolean;
  /** Reconnect delay in ms (default: 3000) */
  reconnectDelay?: number;
  /** Max reconnect attempts (default: 10) */
  maxReconnectAttempts?: number;
  /** Heartbeat interval in ms (default: 10000) */
  heartbeatInterval?: number;
  /** Debug mode */
  debug?: boolean;
}

type MessageHandler = (message: unknown) => void;
type ErrorHandler = (error: Error) => void;
type StateChangeHandler = (state: ConnectionState) => void;

interface Subscription {
  id: string;
  destination: string;
  handler: MessageHandler;
}

/**
 * WebSocket client with STOMP protocol support
 * Compatible with Spring Boot WebSocket server
 */
export class WebSocketClient {
  private config: Required<WebSocketConfig>;
  private socket: WebSocket | null = null;
  private state: ConnectionState = 'disconnected';
  private subscriptions: Map<string, Subscription> = new Map();
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private messageQueue: Array<{ destination: string; body: unknown }> = [];

  private stateListeners: Set<StateChangeHandler> = new Set();
  private errorListeners: Set<ErrorHandler> = new Set();

  constructor(config: WebSocketConfig) {
    this.config = {
      url: config.url,
      useSockJS: config.useSockJS ?? false,
      accessToken: config.accessToken ?? '',
      autoReconnect: config.autoReconnect ?? true,
      reconnectDelay: config.reconnectDelay ?? 3000,
      maxReconnectAttempts: config.maxReconnectAttempts ?? 10,
      heartbeatInterval: config.heartbeatInterval ?? 10000,
      debug: config.debug ?? false,
    };
  }

  /** Connect to WebSocket server */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.state === 'connected' || this.state === 'connecting') {
        resolve();
        return;
      }

      this.setState('connecting');
      this.log('Connecting to', this.config.url);

      try {
        // Create WebSocket connection
        const url = this.buildUrl();
        this.socket = new WebSocket(url);

        this.socket.onopen = () => {
          this.log('WebSocket connected');
          this.sendConnectFrame();
          this.reconnectAttempts = 0;
          this.setState('connected');
          this.startHeartbeat();
          this.flushMessageQueue();
          resolve();
        };

        this.socket.onclose = (event) => {
          this.log('WebSocket closed:', event.code, event.reason);
          this.handleDisconnect();
        };

        this.socket.onerror = (event) => {
          this.log('WebSocket error:', event);
          const error = new Error('WebSocket connection failed');
          this.notifyError(error);
          reject(error);
        };

        this.socket.onmessage = (event) => {
          this.handleMessage(event.data);
        };
      } catch (error) {
        this.setState('disconnected');
        reject(error);
      }
    });
  }

  /** Disconnect from WebSocket server */
  disconnect(): void {
    this.log('Disconnecting...');
    this.stopReconnect();
    this.stopHeartbeat();

    if (this.socket) {
      this.sendDisconnectFrame();
      this.socket.close();
      this.socket = null;
    }

    this.subscriptions.clear();
    this.setState('disconnected');
  }

  /** Subscribe to a destination */
  subscribe(destination: string, handler: MessageHandler): () => void {
    const id = `sub-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    this.subscriptions.set(id, { id, destination, handler });

    if (this.state === 'connected') {
      this.sendSubscribeFrame(id, destination);
    }

    this.log('Subscribed to', destination);

    // Return unsubscribe function
    return () => {
      this.unsubscribe(id);
    };
  }

  /** Unsubscribe from a destination */
  private unsubscribe(id: string): void {
    const sub = this.subscriptions.get(id);
    if (sub) {
      if (this.state === 'connected') {
        this.sendUnsubscribeFrame(id);
      }
      this.subscriptions.delete(id);
      this.log('Unsubscribed from', sub.destination);
    }
  }

  /** Send message to destination */
  send(destination: string, body: unknown): void {
    if (this.state !== 'connected') {
      this.messageQueue.push({ destination, body });
      this.log('Message queued (not connected):', destination);
      return;
    }

    this.sendMessageFrame(destination, body);
  }

  /** Update access token */
  setAccessToken(token: string): void {
    this.config.accessToken = token;
  }

  /** Get current connection state */
  getState(): ConnectionState {
    return this.state;
  }

  /** Listen to state changes */
  onStateChange(handler: StateChangeHandler): () => void {
    this.stateListeners.add(handler);
    return () => this.stateListeners.delete(handler);
  }

  /** Listen to errors */
  onError(handler: ErrorHandler): () => void {
    this.errorListeners.add(handler);
    return () => this.errorListeners.delete(handler);
  }

  // === Private Methods ===

  private buildUrl(): string {
    let url = this.config.url;

    // Add access token as query param for SockJS compatibility
    if (this.config.accessToken) {
      const separator = url.includes('?') ? '&' : '?';
      url += `${separator}access_token=${encodeURIComponent(this.config.accessToken)}`;
    }

    return url;
  }

  private setState(state: ConnectionState): void {
    if (this.state !== state) {
      this.state = state;
      this.stateListeners.forEach((handler) => handler(state));
    }
  }

  private notifyError(error: Error): void {
    this.errorListeners.forEach((handler) => handler(error));
  }

  private handleDisconnect(): void {
    this.stopHeartbeat();
    this.setState('disconnected');

    if (this.config.autoReconnect && this.reconnectAttempts < this.config.maxReconnectAttempts) {
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;

    this.reconnectAttempts++;
    const delay = this.config.reconnectDelay * Math.min(this.reconnectAttempts, 5);

    this.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.config.maxReconnectAttempts})`);
    this.setState('reconnecting');

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect().catch(() => {
        // Will trigger another reconnect via handleDisconnect
      });
    }, delay);
  }

  private stopReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.reconnectAttempts = 0;
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        this.socket.send('\n'); // STOMP heartbeat
      }
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const msg = this.messageQueue.shift()!;
      this.send(msg.destination, msg.body);
    }
  }

  // === STOMP Frame Methods ===

  private sendConnectFrame(): void {
    const headers: Record<string, string> = {
      'accept-version': '1.2',
      'heart-beat': `${this.config.heartbeatInterval},${this.config.heartbeatInterval}`,
    };

    if (this.config.accessToken) {
      headers['Authorization'] = `Bearer ${this.config.accessToken}`;
    }

    this.sendFrame('CONNECT', headers);
  }

  private sendDisconnectFrame(): void {
    this.sendFrame('DISCONNECT', {});
  }

  private sendSubscribeFrame(id: string, destination: string): void {
    this.sendFrame('SUBSCRIBE', {
      id,
      destination,
    });
  }

  private sendUnsubscribeFrame(id: string): void {
    this.sendFrame('UNSUBSCRIBE', { id });
  }

  private sendMessageFrame(destination: string, body: unknown): void {
    const content = typeof body === 'string' ? body : JSON.stringify(body);
    this.sendFrame('SEND', {
      destination,
      'content-type': 'application/json',
    }, content);
  }

  private sendFrame(command: string, headers: Record<string, string>, body = ''): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return;
    }

    let frame = command + '\n';
    for (const [key, value] of Object.entries(headers)) {
      frame += `${key}:${value}\n`;
    }
    frame += '\n' + body + '\0';

    this.socket.send(frame);
  }

  private handleMessage(data: string): void {
    // Parse STOMP frame
    const lines = data.split('\n');
    const command = lines[0];

    if (command === 'MESSAGE') {
      const headers: Record<string, string> = {};
      let i = 1;

      while (lines[i] && lines[i] !== '') {
        const [key, ...valueParts] = lines[i].split(':');
        headers[key] = valueParts.join(':');
        i++;
      }

      // Body is after empty line, remove null terminator
      const body = lines.slice(i + 1).join('\n').replace(/\0$/, '');

      const subscriptionId = headers['subscription'];
      const subscription = this.subscriptions.get(subscriptionId);

      if (subscription) {
        try {
          const parsed = body ? JSON.parse(body) : null;
          subscription.handler(parsed);
        } catch {
          subscription.handler(body);
        }
      }
    } else if (command === 'CONNECTED') {
      this.log('STOMP connected');
      // Resubscribe all subscriptions
      this.subscriptions.forEach((sub) => {
        this.sendSubscribeFrame(sub.id, sub.destination);
      });
    } else if (command === 'ERROR') {
      const errorMessage = lines.slice(1).join('\n');
      this.log('STOMP error:', errorMessage);
      this.notifyError(new Error(errorMessage));
    }
  }

  private log(...args: unknown[]): void {
    if (this.config.debug) {
      console.log('[WebSocket]', ...args);
    }
  }
}

export default WebSocketClient;
