import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CampaignsService } from './campaigns.service';
import { CampaignsController } from './campaigns.controller';
import { CampaignsSchedulerService } from './campaigns-scheduler.service';
import { Campaign } from './entities/campaign.entity';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Campaign]),
    UploadModule,
  ],
  controllers: [CampaignsController],
  providers: [CampaignsService, CampaignsSchedulerService],
  exports: [CampaignsService],
})
export class CampaignsModule {}
