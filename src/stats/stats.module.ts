import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { Ticket } from '../tickets/entities/ticket.entity';
import { Participation } from '../participations/entities/participation.entity';
import { Campaign } from '../campaigns/entities/campaign.entity';
import { User } from '../users/entities/user.entity';
import { Associate } from '../associates/entities/associate.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Ticket,
      Participation,
      Campaign,
      User,
      Associate,
    ]),
  ],
  controllers: [StatsController],
  providers: [StatsService],
  exports: [StatsService],
})
export class StatsModule {}
