import { Injectable } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_by?: string[];
}

interface Conversation {
  id: string;
  participants: string[];
  last_message: string;
  last_message_at: string;
  created_at: string;
}

@Injectable()
export class MessagesService {
  private supabase;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL || 'http://localhost:54321',
      process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
    );
  }

  // Get all conversations for a user
  async getConversations(userId: string): Promise<Conversation[]> {
    // Return demo conversations for now
    return [
      {
        id: 'conv-1',
        participants: [userId, 'user-2'],
        last_message: 'Hey, did you see the latest designs?',
        last_message_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
      {
        id: 'conv-2',
        participants: [userId, 'user-3'],
        last_message: 'The document is ready for review',
        last_message_at: new Date(Date.now() - 3600000).toISOString(),
        created_at: new Date().toISOString(),
      },
      {
        id: 'conv-3',
        participants: [userId, 'user-4'],
        last_message: 'Thanks for the update!',
        last_message_at: new Date(Date.now() - 7200000).toISOString(),
        created_at: new Date().toISOString(),
      },
    ];
  }

  // Get messages in a conversation
  async getMessages(conversationId: string, limit = 50): Promise<Message[]> {
    // Return demo messages
    const userId = 'user-1';
    return [
      {
        id: 'msg-1',
        conversation_id: conversationId,
        sender_id: 'user-2',
        content: 'Hey! Did you get a chance to look at the latest designs I shared?',
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'msg-2',
        conversation_id: conversationId,
        sender_id: userId,
        content: 'Yes! They look amazing. I love the new color scheme.',
        created_at: new Date(Date.now() - 3500000).toISOString(),
      },
      {
        id: 'msg-3',
        conversation_id: conversationId,
        sender_id: 'user-2',
        content: "Great! I've made some more updates. Let me know what you think.",
        created_at: new Date(Date.now() - 3400000).toISOString(),
      },
      {
        id: 'msg-4',
        conversation_id: conversationId,
        sender_id: userId,
        content: 'Sure, send them over! I\'m in the workspace now.',
        created_at: new Date(Date.now() - 3300000).toISOString(),
      },
      {
        id: 'msg-5',
        conversation_id: conversationId,
        sender_id: 'user-2',
        content: 'Perfect! I\'ve just added them to the shared folder.',
        created_at: new Date(Date.now() - 3200000).toISOString(),
      },
    ];
  }

  // Send a new message
  async createMessage(conversationId: string, senderId: string, content: string): Promise<Message> {
    const message: Message = {
      id: 'msg-' + Date.now(),
      conversation_id: conversationId,
      sender_id: senderId,
      content,
      created_at: new Date().toISOString(),
    };

    return message;
  }

  // Mark messages as read
  async markAsRead(conversationId: string, userId: string, messageIds: string[]): Promise<void> {
    // In production, update the database
  }

  // Get unread count
  async getUnreadCount(userId: string): Promise<number> {
    return 3; // Demo count
  }
}
