import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SupabaseAuthGuard } from '../../common/guards/auth.guard';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
@UseGuards(SupabaseAuthGuard)
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Post('track')
  trackEvent(
    @Req() req,
    @Body()
    body: {
      workspaceId?: string;
      eventType: string;
      eventData?: Record<string, unknown>;
    },
  ) {
    return this.analyticsService.trackEvent(req.user.id, {
      ...body,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  @Get('workspace/:workspaceId/stats')
  getWorkspaceStats(@Param('workspaceId') workspaceId: string) {
    return this.analyticsService.getWorkspaceStats(workspaceId);
  }

  @Get('user/stats')
  getUserStats(@Req() req) {
    return this.analyticsService.getUserStats(req.user.id);
  }

  @Get('workspace/:workspaceId/popular-documents')
  getPopularDocuments(@Param('workspaceId') workspaceId: string) {
    return this.analyticsService.getPopularDocuments(workspaceId);
  }

  @Get('workspace/:workspaceId/active-users')
  getActiveUsers(@Param('workspaceId') workspaceId: string) {
    return this.analyticsService.getActiveUsers(workspaceId);
  }
}
