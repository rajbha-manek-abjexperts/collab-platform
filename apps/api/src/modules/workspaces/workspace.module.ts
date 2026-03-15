import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { WorkspaceController } from './workspace.controller';
import { WorkspaceService } from './workspace.service';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    AuditModule,
    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET') || 'default-secret-key',
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [WorkspaceController],
  providers: [WorkspaceService],
  exports: [WorkspaceService],
})
export class WorkspaceModule {}
