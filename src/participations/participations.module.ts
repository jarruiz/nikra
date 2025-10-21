import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ParticipationsService } from './participations.service';
import { ParticipationsController } from './participations.controller';
import { Participation } from './entities/participation.entity';
import { User } from '../users/entities/user.entity';
import { Associate } from '../associates/entities/associate.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Participation,
      User,
      Associate,
    ]),
  ],
  controllers: [ParticipationsController],
  providers: [ParticipationsService],
  exports: [ParticipationsService],
})
export class ParticipationsModule {}
