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
import { DocumentService } from './document.service';

@Controller('workspaces/:workspaceId/documents')
@UseGuards(SupabaseAuthGuard)
export class DocumentController {
  constructor(private documentService: DocumentService) {}

  @Post()
  create(
    @Req() req,
    @Param('workspaceId') workspaceId: string,
    @Body() body: { title?: string; content?: object },
  ) {
    return this.documentService.create(req.user.id, workspaceId, body);
  }

  @Get()
  findAll(@Param('workspaceId') workspaceId: string) {
    return this.documentService.findAllInWorkspace(workspaceId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.documentService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: { title?: string; content?: object }) {
    return this.documentService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.documentService.remove(id);
  }
}
