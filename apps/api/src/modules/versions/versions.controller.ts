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
import { VersionsService } from './versions.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class VersionsController {
  constructor(private versionsService: VersionsService) {}

  @Post('documents/:documentId/versions')
  createDocumentVersion(
    @Req() req,
    @Param('documentId') documentId: string,
    @Body() body: { snapshot: object; label?: string },
  ) {
    return this.versionsService.create(req.user.id, {
      document_id: documentId,
      snapshot: body.snapshot,
      label: body.label,
    });
  }

  @Post('whiteboards/:whiteboardId/versions')
  createWhiteboardVersion(
    @Req() req,
    @Param('whiteboardId') whiteboardId: string,
    @Body() body: { snapshot: object; label?: string },
  ) {
    return this.versionsService.create(req.user.id, {
      whiteboard_id: whiteboardId,
      snapshot: body.snapshot,
      label: body.label,
    });
  }

  @Get('documents/:documentId/versions')
  findDocumentVersions(@Param('documentId') documentId: string) {
    return this.versionsService.findAllForDocument(documentId);
  }

  @Get('whiteboards/:whiteboardId/versions')
  findWhiteboardVersions(@Param('whiteboardId') whiteboardId: string) {
    return this.versionsService.findAllForWhiteboard(whiteboardId);
  }

  @Get('versions/:id')
  findOne(@Param('id') id: string) {
    return this.versionsService.findOne(id);
  }

  @Patch('versions/:id')
  updateLabel(@Param('id') id: string, @Body() body: { label: string }) {
    return this.versionsService.updateLabel(id, body.label);
  }

  @Delete('versions/:id')
  remove(@Param('id') id: string) {
    return this.versionsService.remove(id);
  }
}
