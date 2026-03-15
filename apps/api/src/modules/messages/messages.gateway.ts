import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  path: '/socket.io',
  transports: ['websocket', 'polling'],
})
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MessagesGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('register')
  handleRegister(@ConnectedSocket() client: Socket, @MessageBody() data: { userId: string }) {
    const { userId } = data;
    client.data.userId = userId;
    this.logger.log(`User ${userId} registered with socket ${client.id}`);
    return { event: 'registered', data: { userId } };
  }

  @SubscribeMessage('join_conversation')
  handleJoinConversation(@ConnectedSocket() client: Socket, @MessageBody() data: { conversationId: string }) {
    const { conversationId } = data;
    client.join(conversationId);
    this.logger.log(`Socket ${client.id} joined conversation ${conversationId}`);
    return { event: 'joined', data: { conversationId } };
  }

  @SubscribeMessage('leave_conversation')
  handleLeaveConversation(@ConnectedSocket() client: Socket, @MessageBody() data: { conversationId: string }) {
    const { conversationId } = data;
    client.leave(conversationId);
    this.logger.log(`Socket ${client.id} left conversation ${conversationId}`);
    return { event: 'left', data: { conversationId } };
  }

  @SubscribeMessage('send_message')
  handleMessage(@ConnectedSocket() client: Socket, @MessageBody() data: { 
    conversationId: string; 
    content: string; 
    messageId: string;
  }) {
    const { conversationId, content, messageId } = data;
    const senderId = client.data.userId || 'anonymous';
    const timestamp = new Date().toISOString();

    this.logger.log(`New message in ${conversationId} from ${senderId}: ${content}`);

    // Broadcast to everyone in the conversation
    this.server.to(conversationId).emit('new_message', {
      id: messageId,
      conversationId,
      senderId,
      content,
      timestamp,
    });

    return { event: 'message_sent', data: { success: true, messageId } };
  }

  @SubscribeMessage('typing')
  handleTyping(@ConnectedSocket() client: Socket, @MessageBody() data: { 
    conversationId: string; 
    isTyping: boolean;
  }) {
    const { conversationId, isTyping } = data;
    const userId = client.data.userId || 'anonymous';

    client.to(conversationId).emit('user_typing', {
      conversationId,
      userId,
      isTyping,
    });

    return { event: 'typing_ack', data: { isTyping } };
  }

  @SubscribeMessage('mark_read')
  handleReadReceipt(@ConnectedSocket() client: Socket, @MessageBody() data: { 
    conversationId: string; 
    messageId: string;
  }) {
    const { conversationId, messageId } = data;
    const userId = client.data.userId || 'anonymous';
    
    this.server.to(conversationId).emit('message_read', {
      conversationId,
      messageId,
      readBy: userId,
      readAt: new Date().toISOString(),
    });

    return { event: 'read_ack', data: { success: true } };
  }
}
