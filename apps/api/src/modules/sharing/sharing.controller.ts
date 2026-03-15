import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SupabaseAuthGuard } from '../../common/guards/auth.guard';
import { SharingService } from './sharing.service';

@Controller('sharing')
export class SharingController {
  constructor(private sharingService: SharingService) {}

  @Post('links')
  @UseGuards(SupabaseAuthGuard)
  createSharedLink(
    @Req() req,
    @Body()
    body: {
      resource_type: 'document' | 'whiteboard';
      resource_id: string;
      password?: string;
      expires_at?: string;
      max_views?: number;
    },
  ) {
    return this.sharingService.createSharedLink(req.user.id, body);
  }

  @Get('links/:resourceType/:resourceId')
  @UseGuards(SupabaseAuthGuard)
  getSharedLinks(
    @Param('resourceType') resourceType: string,
    @Param('resourceId') resourceId: string,
  ) {
    return this.sharingService.getSharedLinksForResource(
      resourceType,
      resourceId,
    );
  }

  @Get('public/:slug')
  accessSharedLink(
    @Param('slug') slug: string,
    @Query('password') password?: string,
  ) {
    return this.sharingService.accessSharedLink(slug, password);
  }

  @Delete('links/:id')
  @UseGuards(SupabaseAuthGuard)
  deleteSharedLink(@Req() req, @Param('id') id: string) {
    return this.sharingService.deleteSharedLink(id, req.user.id);
  }
}
