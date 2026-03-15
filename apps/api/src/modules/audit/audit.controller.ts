import {
  Controller,
  Get,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SupabaseAuthGuard } from '../../common/guards/auth.guard';
import { AuditService } from './audit.service';

@Controller('workspaces/:workspaceId/audit-logs')
@UseGuards(SupabaseAuthGuard)
export class AuditController {
  constructor(private auditService: AuditService) {}

  @Get()
  findAll(
    @Param('workspaceId') workspaceId: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('action') action?: string,
    @Query('resource_type') resourceType?: string,
    @Query('user_id') userId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.auditService.getWorkspaceAuditLogs(workspaceId, {
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
      action,
      resource_type: resourceType,
      user_id: userId,
      from,
      to,
    });
  }

  @Get('export')
  exportLogs(
    @Param('workspaceId') workspaceId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('action') action?: string,
    @Query('resource_type') resourceType?: string,
  ) {
    return this.auditService.exportAuditLogs(workspaceId, {
      from,
      to,
      action,
      resource_type: resourceType,
    });
  }

  @Get('user')
  userLogs(
    @Req() req,
    @Param('workspaceId') workspaceId: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.auditService.getUserAuditLogs(req.user.id, {
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
      workspace_id: workspaceId,
    });
  }
}
