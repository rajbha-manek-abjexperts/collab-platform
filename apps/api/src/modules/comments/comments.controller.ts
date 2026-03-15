import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CommentsService } from './comments.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @Post('documents/:documentId/comments')
  createDocumentComment(
    @Req() req,
    @Param('documentId') documentId: string,
    @Body() body: { content: string; parent_id?: string },
  ) {
    return this.commentsService.create(req.user.id, {
      document_id: documentId,
      content: body.content,
      parent_id: body.parent_id,
    });
  }

  @Post('whiteboards/:whiteboardId/comments')
  createWhiteboardComment(
    @Req() req,
    @Param('whiteboardId') whiteboardId: string,
    @Body() body: { content: string; position?: { x: number; y: number }; parent_id?: string },
  ) {
    return this.commentsService.create(req.user.id, {
      whiteboard_id: whiteboardId,
      content: body.content,
      position: body.position,
      parent_id: body.parent_id,
    });
  }

  @Get('documents/:documentId/comments')
  findDocumentComments(@Param('documentId') documentId: string) {
    return this.commentsService.findAllForDocument(documentId);
  }

  @Get('whiteboards/:whiteboardId/comments')
  findWhiteboardComments(@Param('whiteboardId') whiteboardId: string) {
    return this.commentsService.findAllForWhiteboard(whiteboardId);
  }

  @Get('comments/:id')
  findOne(@Param('id') id: string) {
    return this.commentsService.findOne(id);
  }

  @Get('comments/:id/replies')
  findReplies(@Param('id') id: string) {
    return this.commentsService.findReplies(id);
  }

  @Patch('comments/:id')
  update(
    @Req() req,
    @Param('id') id: string,
    @Body() body: { content?: string; is_resolved?: boolean },
  ) {
    return this.commentsService.update(id, req.user.id, body);
  }

  @Patch('comments/:id/resolve')
  resolve(@Param('id') id: string) {
    return this.commentsService.resolve(id);
  }

  @Delete('comments/:id')
  remove(@Req() req, @Param('id') id: string) {
    return this.commentsService.remove(id, req.user.id);
  }
}
