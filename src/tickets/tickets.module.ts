import { Module } from '@nestjs/common';

import { TicketsController } from './tickets.controller';
import { ExportModule } from '../export/export.module';
import { ParticipationsModule } from '../participations/participations.module';

@Module({
  imports: [ExportModule, ParticipationsModule],
  controllers: [TicketsController],
})
export class TicketsModule {}
