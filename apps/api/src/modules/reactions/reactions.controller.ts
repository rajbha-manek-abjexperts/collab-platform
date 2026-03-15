import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SupabaseAuthGuard } from '../../common/guards/auth.guard';
import { ReactionsService } from './reactions.service';

@Controller()
@UseGuards(SupabaseAuthGuard)
export class ReactionsController {
  constructor(private reactionsService: ReactionsService) {}

  @Post('comments/:commentId/reactions/:emoji')
  toggle(
    @Req() req,
    @Param('commentId') commentId: string,
    @Param('emoji') emoji: string,
  ) {
    return this.reactionsService.toggle(req.user.id, commentId, emoji);
  }

  @Get('comments/:commentId/reactions')
  findAll(@Param('commentId') commentId: string) {
    return this.reactionsService.findAllForComment(commentId);
  }

  @Delete('reactions/:id')
  remove(@Req() req, @Param('id') id: string) {
    return this.reactionsService.remove(id, req.user.id);
  }
}
