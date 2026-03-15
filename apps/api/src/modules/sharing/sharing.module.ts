import { Module } from '@nestjs/common';
import { SharingController } from './sharing.controller';
import { SharingService } from './sharing.service';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AuditModule],
  controllers: [SharingController],
  providers: [SharingService],
  exports: [SharingService],
})
export class SharingModule {}
