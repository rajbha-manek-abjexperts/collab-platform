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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
