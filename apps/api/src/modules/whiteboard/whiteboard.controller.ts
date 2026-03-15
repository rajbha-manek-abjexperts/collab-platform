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
import { SupabaseAuthGuard } from '../../common/guards/auth.guard';
import { WhiteboardService } from './whiteboard.service';

@Controller('workspaces/:workspaceId/whiteboards')
@UseGuards(SupabaseAuthGuard)
export class WhiteboardController {
  constructor(private whiteboardService: WhiteboardService) {}

  @Post()
  create(
    @Req() req,
    @Param('workspaceId') workspaceId: string,
    @Body() body: { title?: string; canvas_data?: object },
  ) {
    return this.whiteboardService.create(req.user.id, workspaceId, body);
  }

  @Get()
  findAll(@Param('workspaceId') workspaceId: string) {
    return this.whiteboardService.findAllInWorkspace(workspaceId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.whiteboardService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: { title?: string; canvas_data?: object },
  ) {
    return this.whiteboardService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.whiteboardService.remove(id);
  }
}
