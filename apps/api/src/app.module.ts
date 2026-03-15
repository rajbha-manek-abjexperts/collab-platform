import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SupabaseModule } from './supabase/supabase.module';
import { AuthModule } from './modules/auth/auth.module';
import { WorkspaceModule } from './modules/workspaces/workspace.module';
import { DocumentModule } from './modules/documents/document.module';
import { WhiteboardModule } from './modules/whiteboard/whiteboard.module';
import { RealtimeModule } from './modules/realtime/realtime.module';
import { VersionsModule } from './modules/versions/versions.module';
import { CommentsModule } from './modules/comments/comments.module';
import { ReactionsModule } from './modules/reactions/reactions.module';
import { StorageModule } from './modules/storage/storage.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AuditModule } from './modules/audit/audit.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { SharingModule } from './modules/sharing/sharing.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SupabaseModule,
    AuthModule,
    WorkspaceModule,
    DocumentModule,
    WhiteboardModule,
    RealtimeModule,
    VersionsModule,
    CommentsModule,
    ReactionsModule,
    StorageModule,
    NotificationsModule,
    AnalyticsModule,
    AuditModule,
    WebhooksModule,
    SharingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
