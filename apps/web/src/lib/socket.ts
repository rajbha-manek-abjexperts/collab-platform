type EventHandler = (data: unknown) => void;

interface SocketMessage {
  event: string;
  data: unknown;
}

export class CollabSocket {
  private ws: WebSocket | null = null;
  private listeners = new Map<string, Set<EventHandler>>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private heartbeatInterval = 30000;
  private pendingMessages: string[] = [];
  private _isConnected = false;
  private _isAuthenticated = false;
  private url: string;
  private token: string | null = null;
  private currentRooms = new Set<string>();

  constructor(url: string) {
    this.url = url;
  }

  get isConnected() {
    return this._isConnected;
  }

  get isAuthenticated() {
    return this._isAuthenticated;
  }

  connect(token: string): Promise<void> {
    this.token = token;

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          this._isConnected = true;
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          this.authenticate(token);
          this.flushPendingMessages();
          this.emit('connected', null);
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: SocketMessage = JSON.parse(event.data as string);
            this.handleMessage(message);
          } catch {
            // Ignore malformed messages
          }
        };

        this.ws.onclose = () => {
          this._isConnected = false;
          this._isAuthenticated = false;
          this.stopHeartbeat();
          this.emit('disconnected', null);
          this.attemptReconnect();
        };

        this.ws.onerror = () => {
          this.emit('error', { message: 'WebSocket error' });
          if (!this._isConnected) {
            reject(new Error('WebSocket connection failed'));
          }
        };
      } catch (err) {
        reject(err);
      }
    });
  }

  disconnect() {
    this.reconnectAttempts = this.maxReconnectAttempts; // Prevent reconnect
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.stopHeartbeat();
    this.currentRooms.clear();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this._isConnected = false;
    this._isAuthenticated = false;
  }

  // ─── Room Management ──────────────────────────────────────────────

  joinRoom(room: string) {
    this.currentRooms.add(room);
    this.send('join', { room });
  }

  leaveRoom(room: string) {
    this.currentRooms.delete(room);
    this.send('leave', { room });
  }

  joinWorkspace(workspaceId: string) {
    const room = `workspace:${workspaceId}`;
    this.currentRooms.add(room);
    this.send('workspace:join', { workspaceId });
  }

  leaveWorkspace(workspaceId: string) {
    const room = `workspace:${workspaceId}`;
    this.currentRooms.delete(room);
    this.send('workspace:leave', { workspaceId });
  }

  // ─── Cursor ───────────────────────────────────────────────────────

  sendCursorMove(room: string, x: number, y: number, pageId?: string) {
    this.send('cursor:move', { room, x, y, pageId });
  }

  // ─── Canvas Drawing ───────────────────────────────────────────────

  sendCanvasDraw(room: string, action: {
    type: string;
    stroke?: unknown;
    objectId?: string;
    data?: unknown;
  }) {
    this.send('canvas:draw', { room, action });
  }

  sendStrokeStart(room: string, strokeId: string, color: string, width: number, tool: string) {
    this.send('canvas:stroke:start', { room, strokeId, color, width, tool });
  }

  sendStrokePoint(room: string, strokeId: string, point: { x: number; y: number; pressure?: number }) {
    this.send('canvas:stroke:point', { room, strokeId, point });
  }

  sendStrokeEnd(room: string, strokeId: string) {
    this.send('canvas:stroke:end', { room, strokeId });
  }

  // ─── Document Editing ─────────────────────────────────────────────

  sendDocumentUpdate(room: string, ops: unknown) {
    this.send('document:update', { room, ops });
  }

  sendDocumentSelection(room: string, range: { index: number; length: number } | null) {
    this.send('document:selection', { room, range });
  }

  sendDocumentSave(room: string, version: number) {
    this.send('document:save', { room, version });
  }

  // ─── Presence ─────────────────────────────────────────────────────

  sendPresenceUpdate(room: string, status: 'online' | 'away' | 'busy') {
    this.send('presence:update', { room, status });
  }

  requestPresence(room: string) {
    this.send('presence:get', { room });
  }

  // ─── Typing Indicators ───────────────────────────────────────────

  sendTypingStart(room: string) {
    this.send('typing:start', { room });
  }

  sendTypingStop(room: string) {
    this.send('typing:stop', { room });
  }

  // ─── Event Handling ───────────────────────────────────────────────

  on(event: string, handler: EventHandler): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);

    return () => {
      this.listeners.get(event)?.delete(handler);
    };
  }

  off(event: string, handler: EventHandler) {
    this.listeners.get(event)?.delete(handler);
  }

  // ─── Private Methods ─────────────────────────────────────────────

  private send(event: string, data: unknown) {
    const message = JSON.stringify({ event, data });
    if (this._isConnected && this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(message);
    } else {
      this.pendingMessages.push(message);
    }
  }

  private authenticate(token: string) {
    this.send('auth', { token });
  }

  private handleMessage(message: SocketMessage) {
    if (message.event === 'auth:success') {
      this._isAuthenticated = true;
      this.rejoinRooms();
    }

    this.emit(message.event, message.data);
  }

  private emit(event: string, data: unknown) {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(data);
        } catch {
          // Prevent handler errors from breaking the socket
        }
      });
    }
  }

  private flushPendingMessages() {
    while (this.pendingMessages.length > 0) {
      const message = this.pendingMessages.shift()!;
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(message);
      }
    }
  }

  private rejoinRooms() {
    this.currentRooms.forEach((room) => {
      if (room.startsWith('workspace:')) {
        const workspaceId = room.replace('workspace:', '');
        this.send('workspace:join', { workspaceId });
      } else {
        this.send('join', { room });
      }
    });
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.emit('reconnect:failed', null);
      return;
    }

    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
    this.reconnectAttempts++;

    this.emit('reconnecting', { attempt: this.reconnectAttempts, maxAttempts: this.maxReconnectAttempts });

    this.reconnectTimer = setTimeout(() => {
      if (this.token) {
        this.connect(this.token).catch(() => {
          // Reconnect will be attempted again on close
        });
      }
    }, delay);
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this._isConnected) {
        this.currentRooms.forEach((room) => {
          this.send('presence:heartbeat', { room });
        });
      }
    }, this.heartbeatInterval);
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }
}

let socketInstance: CollabSocket | null = null;

export function getSocket(url?: string): CollabSocket {
  if (!socketInstance) {
    const wsUrl = url || process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001/ws';
    socketInstance = new CollabSocket(wsUrl);
  }
  return socketInstance;
}

export function resetSocket() {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}
