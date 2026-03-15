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
import { WorkspaceService } from './workspace.service';

@Controller('workspaces')
@UseGuards(SupabaseAuthGuard)
export class WorkspaceController {
  constructor(private workspaceService: WorkspaceService) {}

  @Post()
  create(
    @Req() req,
    @Body() body: { name: string; slug: string; description?: string },
  ) {
    return this.workspaceService.create(req.user.id, body);
  }

  @Get()
  findAll(@Req() req) {
    return this.workspaceService.findAllForUser(req.user.id);
  }

  @Get(':id')
  findOne(@Req() req, @Param('id') id: string) {
    return this.workspaceService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(
    @Req() req,
    @Param('id') id: string,
    @Body() body: { name?: string; description?: string },
  ) {
    return this.workspaceService.update(id, req.user.id, body);
  }

  @Delete(':id')
  remove(@Req() req, @Param('id') id: string) {
    return this.workspaceService.remove(id, req.user.id);
  }

  @Post(':id/members')
  addMember(
    @Param('id') id: string,
    @Body() body: { userId: string; role?: string },
  ) {
    return this.workspaceService.addMember(id, body.userId, body.role);
  }

  @Delete(':id/members/:userId')
  removeMember(@Param('id') id: string, @Param('userId') userId: string) {
    return this.workspaceService.removeMember(id, userId);
  }
}
