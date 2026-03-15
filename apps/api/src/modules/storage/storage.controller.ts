import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SupabaseAuthGuard } from '../../common/guards/auth.guard';
import { StorageService } from './storage.service';

@Controller('workspaces/:workspaceId/files')
@UseGuards(SupabaseAuthGuard)
export class StorageController {
  constructor(private storageService: StorageService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @Req() req,
    @Param('workspaceId') workspaceId: string,
    @UploadedFile() file: Express.Multer.File,
    @Query('documentId') documentId?: string,
    @Query('whiteboardId') whiteboardId?: string,
  ) {
    return this.storageService.upload(req.user.id, workspaceId, file, {
      documentId,
      whiteboardId,
    });
  }

  @Get()
  findAll(@Param('workspaceId') workspaceId: string) {
    return this.storageService.findAllInWorkspace(workspaceId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.storageService.findOne(id);
  }

  @Get(':id/signed-url')
  getSignedUrl(
    @Param('id') id: string,
    @Query('expiresIn') expiresIn?: string,
  ) {
    return this.storageService.getSignedUrl(
      id,
      expiresIn ? parseInt(expiresIn, 10) : undefined,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.storageService.remove(id);
  }
}
