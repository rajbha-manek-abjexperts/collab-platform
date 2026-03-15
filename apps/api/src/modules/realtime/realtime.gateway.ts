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
}

@WebSocketGateway({ path: '/ws' })
export class RealtimeGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private clients = new Map<string, AuthenticatedSocket>();

  constructor(private supabaseService: SupabaseService) {}

  async handleConnection(client: AuthenticatedSocket) {
    client.rooms = new Set();
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      this.clients.delete(client.userId);
      client.rooms?.forEach((room) => {
        this.broadcastToRoom(room, 'user:left', {
          userId: client.userId,
        });
      });
    }
  }

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
    this.clients.set(userData.user.id, client);
    client.send(JSON.stringify({ event: 'auth:success', data: { userId: userData.user.id } }));
  }

  @SubscribeMessage('join')
  handleJoin(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { room: string },
  ) {
    if (!client.userId) return;
    client.rooms.add(data.room);
    this.broadcastToRoom(data.room, 'user:joined', {
      userId: client.userId,
    });
  }

  @SubscribeMessage('leave')
  handleLeave(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { room: string },
  ) {
    if (!client.userId) return;
    client.rooms.delete(data.room);
    this.broadcastToRoom(data.room, 'user:left', {
      userId: client.userId,
    });
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

  @SubscribeMessage('document:update')
  handleDocumentUpdate(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { room: string; ops: unknown },
  ) {
    if (!client.userId) return;
    this.broadcastToRoom(
      data.room,
      'document:update',
      { userId: client.userId, ops: data.ops },
      client.userId,
    );
  }

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
