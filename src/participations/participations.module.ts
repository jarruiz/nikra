import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ParticipationsService } from './participations.service';
import { ParticipationsController } from './participations.controller';
import { Participation } from './entities/participation.entity';
import { User } from '../users/entities/user.entity';
import { Associate } from '../associates/entities/associate.entity';
import { Campaign } from '../campaigns/entities/campaign.entity';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Participation,
      User,
      Associate,
      Campaign,
    ]),
    EmailModule,
  ],
  controllers: [ParticipationsController],
  providers: [ParticipationsService],
  exports: [ParticipationsService],
})
export class ParticipationsModule {}
