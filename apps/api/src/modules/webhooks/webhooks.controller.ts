import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SupabaseAuthGuard } from '../../common/guards/auth.guard';
import { WebhooksService } from './webhooks.service';

@Controller('webhooks')
@UseGuards(SupabaseAuthGuard)
export class WebhooksController {
  constructor(private webhooksService: WebhooksService) {}

  @Post()
  createWebhook(
    @Req() req,
    @Body()
    body: {
      workspace_id: string;
      name: string;
      url: string;
      events: string[];
      secret?: string;
    },
  ) {
    return this.webhooksService.createWebhook(body.workspace_id, req.user.id, {
      name: body.name,
      url: body.url,
      events: body.events,
      secret: body.secret,
    });
  }

  @Get('workspace/:workspaceId')
  getWebhooks(@Param('workspaceId') workspaceId: string) {
    return this.webhooksService.getWebhooks(workspaceId);
  }

  @Get(':id')
  getWebhook(@Param('id') id: string) {
    return this.webhooksService.getWebhook(id);
  }

  @Patch(':id')
  updateWebhook(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      url?: string;
      events?: string[];
      is_active?: boolean;
    },
  ) {
    return this.webhooksService.updateWebhook(id, body);
  }

  @Delete(':id')
  deleteWebhook(@Param('id') id: string) {
    return this.webhooksService.deleteWebhook(id);
  }

  @Post('trigger')
  triggerWebhook(
    @Body()
    body: {
      event: string;
      workspace_id: string;
      payload: Record<string, any>;
    },
  ) {
    return this.webhooksService.triggerWebhook(
      body.event,
      body.workspace_id,
      body.payload,
    );
  }

  @Get(':id/deliveries')
  getDeliveries(
    @Param('id') id: string,
    @Query('limit') limit?: string,
  ) {
    return this.webhooksService.getDeliveries(id, limit ? parseInt(limit, 10) : 50);
  }
}
