import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SupabaseAuthGuard } from '../../common/guards/auth.guard';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(SupabaseAuthGuard)
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  getNotifications(@Req() req) {
    return this.notificationsService.getNotifications(req.user.id);
  }

  @Patch(':id/read')
  markAsRead(@Req() req, @Param('id') id: string) {
    return this.notificationsService.markAsRead(req.user.id, id);
  }

  @Patch('read-all')
  markAllAsRead(@Req() req) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }

  @Delete(':id')
  deleteNotification(@Req() req, @Param('id') id: string) {
    return this.notificationsService.deleteNotification(req.user.id, id);
  }

  @Get('preferences')
  getPreferences(@Req() req) {
    return this.notificationsService.getPreferences(req.user.id);
  }

  @Patch('preferences')
  updatePreference(
    @Req() req,
    @Body() body: { type: string; email_enabled: boolean },
  ) {
    return this.notificationsService.updatePreference(
      req.user.id,
      body.type,
      body.email_enabled,
    );
  }

  @Get('email-log')
  getEmailLog(@Req() req) {
    return this.notificationsService.getEmailLog(req.user.id);
  }
}
