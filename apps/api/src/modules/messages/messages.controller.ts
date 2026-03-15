import { Controller, Get, Post, Body, Param, Req, UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('api/messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('conversations')
  async getConversations(@Req() req) {
    const userId = req.user?.id || 'user-1';
    return this.messagesService.getConversations(userId);
  }

  @Get(':conversationId')
  async getMessages(
    @Param('conversationId') conversationId: string,
    @Req() req,
  ) {
    const userId = req.user?.id || 'user-1';
    return this.messagesService.getMessages(conversationId);
  }

  @Post()
  async sendMessage(
    @Body() body: { conversationId: string; content: string },
    @Req() req,
  ) {
    const senderId = req.user?.id || 'user-1';
    return this.messagesService.createMessage(body.conversationId, senderId, body.content);
  }

  @Get('unread/count')
  async getUnreadCount(@Req() req) {
    const userId = req.user?.id || 'user-1';
    const count = await this.messagesService.getUnreadCount(userId);
    return { count };
  }
}
