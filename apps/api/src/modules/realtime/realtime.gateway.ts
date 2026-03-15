import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';
import { SupabaseService } from '../../supabase/supabase.service';

interface AuthenticatedSocket extends WebSocket {
  userId?: string;
  rooms?: Set<string>;
  userName?: string;
  avatarUrl?: string;
  presenceStatus?: 'online' | 'away' | 'busy';
  lastActivity?: number;
}

interface CursorPosition {
  userId: string;
  userName?: string;
  x: number;
  y: number;
  pageId?: string;
}

interface CanvasStroke {
  id: string;
  points: { x: number; y: number; pressure?: number }[];
  color: string;
  width: number;
  tool: 'pen' | 'eraser' | 'highlighter';
}

interface CanvasAction {
  type: 'stroke' | 'shape' | 'text' | 'image' | 'clear' | 'undo' | 'redo' | 'delete' | 'move' | 'resize';
  stroke?: CanvasStroke;
  objectId?: string;
  data?: unknown;
}

interface DocumentOp {
  type: 'insert' | 'delete' | 'retain' | 'format';
  position?: number;
  length?: number;
  text?: string;
  attributes?: Record<string, unknown>;
}

interface PresenceData {
  userId: string;
  userName?: string;
  avatarUrl?: string;
  status: 'online' | 'away' | 'busy';
  cursorPosition?: { x: number; y: number };
  activePageId?: string;
  lastActivity: number;
}

@WebSocketGateway({ path: '/ws' })
export class RealtimeGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private clients = new Map<string, AuthenticatedSocket>();
  private roomPresence = new Map<string, Map<string, PresenceData>>();

  constructor(private supabaseService: SupabaseService) {}

  async handleConnection(client: AuthenticatedSocket) {
    client.rooms = new Set();
    client.lastActivity = Date.now();
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      this.clients.delete(client.userId);
      client.rooms?.forEach((room) => {
        this.removePresenceFromRoom(room, client.userId!);
        this.broadcastToRoom(room, 'user:left', {
          userId: client.userId,
        });
        this.broadcastPresenceUpdate(room);
      });
    }
  }

  // ─── Authentication ──────────────────────────────────────────────

  @SubscribeMessage('auth')
  async handleAuth(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { token: string },
  ) {
    const { data: userData, error } = await this.supabaseService
      .getClient()
      .auth.getUser(data.token);

    if (error || !userData.user) {
      client.send(JSON.stringify({ event: 'auth:error', data: 'Invalid token' }));
      client.close();
      return;
    }

    client.userId = userData.user.id;
    client.userName = userData.user.user_metadata?.name || userData.user.email;
    client.avatarUrl = userData.user.user_metadata?.avatar_url;
    client.presenceStatus = 'online';
    this.clients.set(userData.user.id, client);
    client.send(JSON.stringify({
      event: 'auth:success',
      data: {
        userId: userData.user.id,
        userName: client.userName,
      },
    }));
  }

  // ─── Workspace Rooms ─────────────────────────────────────────────

  @SubscribeMessage('workspace:join')
  handleWorkspaceJoin(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { workspaceId: string },
  ) {
    if (!client.userId) return;
    const room = `workspace:${data.workspaceId}`;
    this.joinRoom(client, room);
  }

  @SubscribeMessage('workspace:leave')
  handleWorkspaceLeave(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { workspaceId: string },
  ) {
    if (!client.userId) return;
    const room = `workspace:${data.workspaceId}`;
    this.leaveRoom(client, room);
  }

  @SubscribeMessage('join')
  handleJoin(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { room: string },
  ) {
    if (!client.userId) return;
    this.joinRoom(client, data.room);
  }

  @SubscribeMessage('leave')
  handleLeave(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { room: string },
  ) {
    if (!client.userId) return;
    this.leaveRoom(client, data.room);
  }

  // ─── Cursor Broadcasting ─────────────────────────────────────────

  @SubscribeMessage('cursor:move')
  handleCursorMove(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { room: string; x: number; y: number; pageId?: string },
  ) {
    if (!client.userId) return;
    client.lastActivity = Date.now();

    const cursor: CursorPosition = {
      userId: client.userId,
      userName: client.userName,
      x: data.x,
      y: data.y,
      pageId: data.pageId,
    };

    this.updatePresenceField(data.room, client.userId, {
      cursorPosition: { x: data.x, y: data.y },
      activePageId: data.pageId,
      lastActivity: Date.now(),
    });

    this.broadcastToRoom(data.room, 'cursor:update', cursor, client.userId);
  }

  @SubscribeMessage('cursor')
  handleCursor(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { room: string; x: number; y: number },
  ) {
    if (!client.userId) return;
    this.broadcastToRoom(
      data.room,
      'cursor:move',
      { userId: client.userId, x: data.x, y: data.y },
      client.userId,
    );
  }

  // ─── Canvas Drawing Sync ─────────────────────────────────────────

  @SubscribeMessage('canvas:draw')
  handleCanvasDraw(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { room: string; action: CanvasAction },
  ) {
    if (!client.userId) return;
    client.lastActivity = Date.now();

    this.broadcastToRoom(
      data.room,
      'canvas:draw',
      { userId: client.userId, userName: client.userName, action: data.action },
      client.userId,
    );
  }

  @SubscribeMessage('canvas:stroke:start')
  handleCanvasStrokeStart(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { room: string; strokeId: string; color: string; width: number; tool: string },
  ) {
    if (!client.userId) return;
    this.broadcastToRoom(
      data.room,
      'canvas:stroke:start',
      { userId: client.userId, strokeId: data.strokeId, color: data.color, width: data.width, tool: data.tool },
      client.userId,
    );
  }

  @SubscribeMessage('canvas:stroke:point')
  handleCanvasStrokePoint(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { room: string; strokeId: string; point: { x: number; y: number; pressure?: number } },
  ) {
    if (!client.userId) return;
    this.broadcastToRoom(
      data.room,
      'canvas:stroke:point',
      { userId: client.userId, strokeId: data.strokeId, point: data.point },
      client.userId,
    );
  }

  @SubscribeMessage('canvas:stroke:end')
  handleCanvasStrokeEnd(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { room: string; strokeId: string },
  ) {
    if (!client.userId) return;
    this.broadcastToRoom(
      data.room,
      'canvas:stroke:end',
      { userId: client.userId, strokeId: data.strokeId },
      client.userId,
    );
  }

  // ─── Document Editing Sync ────────────────────────────────────────

  @SubscribeMessage('document:update')
  handleDocumentUpdate(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { room: string; ops: DocumentOp[] | unknown },
  ) {
    if (!client.userId) return;
    client.lastActivity = Date.now();

    this.broadcastToRoom(
      data.room,
      'document:update',
      { userId: client.userId, userName: client.userName, ops: data.ops },
      client.userId,
    );
  }

  @SubscribeMessage('document:selection')
  handleDocumentSelection(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { room: string; range: { index: number; length: number } | null },
  ) {
    if (!client.userId) return;
    this.broadcastToRoom(
      data.room,
      'document:selection',
      { userId: client.userId, userName: client.userName, range: data.range },
      client.userId,
    );
  }

  @SubscribeMessage('document:save')
  handleDocumentSave(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { room: string; version: number },
  ) {
    if (!client.userId) return;
    this.broadcastToRoom(
      data.room,
      'document:saved',
      { userId: client.userId, version: data.version, savedAt: new Date().toISOString() },
    );
  }

  // ─── Whiteboard Sync ─────────────────────────────────────────────

  @SubscribeMessage('whiteboard:update')
  handleWhiteboardUpdate(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { room: string; action: unknown },
  ) {
    if (!client.userId) return;
    this.broadcastToRoom(
      data.room,
      'whiteboard:update',
      { userId: client.userId, action: data.action },
      client.userId,
    );
  }

  // ─── Presence Updates ─────────────────────────────────────────────

  @SubscribeMessage('presence:update')
  handlePresenceUpdate(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { room: string; status: 'online' | 'away' | 'busy' },
  ) {
    if (!client.userId) return;
    client.presenceStatus = data.status;
    client.lastActivity = Date.now();

    this.updatePresenceField(data.room, client.userId, {
      status: data.status,
      lastActivity: Date.now(),
    });

    this.broadcastPresenceUpdate(data.room);
  }

  @SubscribeMessage('presence:heartbeat')
  handlePresenceHeartbeat(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { room: string },
  ) {
    if (!client.userId) return;
    client.lastActivity = Date.now();

    this.updatePresenceField(data.room, client.userId, {
      lastActivity: Date.now(),
    });
  }

  @SubscribeMessage('presence:get')
  handlePresenceGet(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { room: string },
  ) {
    if (!client.userId) return;
    const presence = this.getRoomPresence(data.room);
    client.send(JSON.stringify({
      event: 'presence:list',
      data: { room: data.room, users: presence },
    }));
  }

  // ─── Typing Indicators ───────────────────────────────────────────

  @SubscribeMessage('typing:start')
  handleTypingStart(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { room: string },
  ) {
    if (!client.userId) return;
    this.broadcastToRoom(
      data.room,
      'typing:start',
      { userId: client.userId, userName: client.userName },
      client.userId,
    );
  }

  @SubscribeMessage('typing:stop')
  handleTypingStop(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { room: string },
  ) {
    if (!client.userId) return;
    this.broadcastToRoom(
      data.room,
      'typing:stop',
      { userId: client.userId },
      client.userId,
    );
  }

  // ─── Private Helpers ──────────────────────────────────────────────

  private joinRoom(client: AuthenticatedSocket, room: string) {
    client.rooms!.add(room);

    const presence: PresenceData = {
      userId: client.userId!,
      userName: client.userName,
      avatarUrl: client.avatarUrl,
      status: client.presenceStatus || 'online',
      lastActivity: Date.now(),
    };

    if (!this.roomPresence.has(room)) {
      this.roomPresence.set(room, new Map());
    }
    this.roomPresence.get(room)!.set(client.userId!, presence);

    this.broadcastToRoom(room, 'user:joined', {
      userId: client.userId,
      userName: client.userName,
    });

    this.broadcastPresenceUpdate(room);
  }

  private leaveRoom(client: AuthenticatedSocket, room: string) {
    client.rooms!.delete(room);
    this.removePresenceFromRoom(room, client.userId!);

    this.broadcastToRoom(room, 'user:left', {
      userId: client.userId,
    });

    this.broadcastPresenceUpdate(room);
  }

  private removePresenceFromRoom(room: string, userId: string) {
    const roomMap = this.roomPresence.get(room);
    if (roomMap) {
      roomMap.delete(userId);
      if (roomMap.size === 0) {
        this.roomPresence.delete(room);
      }
    }
  }

  private updatePresenceField(room: string, userId: string, fields: Partial<PresenceData>) {
    const roomMap = this.roomPresence.get(room);
    if (!roomMap) return;
    const existing = roomMap.get(userId);
    if (existing) {
      roomMap.set(userId, { ...existing, ...fields });
    }
  }

  private getRoomPresence(room: string): PresenceData[] {
    const roomMap = this.roomPresence.get(room);
    if (!roomMap) return [];
    return Array.from(roomMap.values());
  }

  private broadcastPresenceUpdate(room: string) {
    const presence = this.getRoomPresence(room);
    this.broadcastToRoom(room, 'presence:update', {
      room,
      users: presence,
    });
  }

  private broadcastToRoom(
    room: string,
    event: string,
    data: unknown,
    excludeUserId?: string,
  ) {
    this.clients.forEach((client, userId) => {
      if (userId !== excludeUserId && client.rooms?.has(room)) {
        client.send(JSON.stringify({ event, data }));
      }
    });
  }
}
