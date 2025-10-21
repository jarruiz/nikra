import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ExportService } from './export.service';
import { ExportController } from './export.controller';
import { Participation } from '../participations/entities/participation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Participation])],
  controllers: [ExportController],
  providers: [ExportService],
  exports: [ExportService],
})
export class ExportModule {}
