import { Injectable, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@Injectable()
export class MessagesGateway {
  private readonly logger = new Logger(MessagesGateway.name);
  private server: Server;
  private userSockets: Map<string, Set<string>> = new Map();
  private typingTimers: Map<string, NodeJS.Timeout> = new Map();

  afterInit(server: Server) {
    this.server = server;
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    // Remove socket from user mappings
    this.userSockets.forEach((sockets, userId) => {
      sockets.delete(client.id);
      if (sockets.size === 0) {
        this.userSockets.delete(userId);
      }
    });
  }

  // Handle user joining with their user ID
  registerUser(client: Socket, userId: string) {
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)!.add(client.id);
    client.data.userId = userId;
    this.logger.log(`User ${userId} registered with socket ${client.id}`);
  }

  // Join a conversation room
  joinConversation(client: Socket, conversationId: string) {
    client.join(conversationId);
    this.logger.log(`Socket ${client.id} joined conversation ${conversationId}`);
    
    // Notify others in the room
    client.to(conversationId).emit('user_joined', {
      conversationId,
      userId: client.data.userId,
    });
  }

  // Leave a conversation room
  leaveConversation(client: Socket, conversationId: string) {
    client.leave(conversationId);
    this.logger.log(`Socket ${client.id} left conversation ${conversationId}`);
    
    // Notify others in the room
    client.to(conversationId).emit('user_left', {
      conversationId,
      userId: client.data.userId,
    });
  }

  // Handle new message
  async handleMessage(client: Socket, payload: {
    conversationId: string;
    content: string;
    messageId: string;
    timestamp: string;
  }) {
    const { conversationId, content, messageId, timestamp } = payload;
    const userId = client.data.userId;

    this.logger.log(`New message in ${conversationId} from ${userId}: ${content}`);

    // Broadcast to everyone in the conversation (including sender for confirmation)
    this.server.to(conversationId).emit('new_message', {
      id: messageId,
      conversationId,
      senderId: userId,
      content,
      timestamp,
      status: 'sent',
    });

    return { success: true, messageId };
  }

  // Handle typing indicator
  handleTyping(client: Socket, payload: { conversationId: string; isTyping: boolean }) {
    const { conversationId, isTyping } = payload;
    const userId = client.data.userId;

    // Clear existing timer
    const timerKey = `${conversationId}:${userId}`;
    if (this.typingTimers.has(timerKey)) {
      clearTimeout(this.typingTimers.get(timerKey)!);
    }

    if (isTyping) {
      // Set a timeout to auto-stop typing after 3 seconds
      const timer = setTimeout(() => {
        this.server.to(conversationId).emit('user_stopped_typing', {
          conversationId,
          userId,
        });
        this.typingTimers.delete(timerKey);
      }, 3000);
      this.typingTimers.set(timerKey, timer);
    }

    // Broadcast typing status
    client.to(conversationId).emit('user_typing', {
      conversationId,
      userId,
      isTyping,
    });
  }

  // Send message read receipt
  handleReadReceipt(client: Socket, payload: { conversationId: string; messageId: string; userId: string }) {
    const { conversationId, messageId, userId } = payload;
    
    this.server.to(conversationId).emit('message_read', {
      conversationId,
      messageId,
      readBy: userId,
      readAt: new Date().toISOString(),
    });
  }

  // Get online users in a conversation
  getOnlineUsers(conversationId: string): string[] {
    const room = this.server.sockets.adapter.rooms.get(conversationId);
    if (!room) return [];
    
    const onlineUsers: string[] = [];
    room.forEach((socketId) => {
      const socket = this.server.sockets.sockets.get(socketId);
      if (socket?.data.userId) {
        onlineUsers.push(socket.data.userId);
      }
    });
    return onlineUsers;
  }
}
