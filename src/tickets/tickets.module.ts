import { Module } from '@nestjs/common';

import { TicketsController } from './tickets.controller';
import { ExportModule } from '../export/export.module';

@Module({
  imports: [ExportModule],
  controllers: [TicketsController],
})
export class TicketsModule {}
