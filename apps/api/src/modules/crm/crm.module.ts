import { Module } from '@nestjs/common';
import { LeadController } from './lead.controller';
import { LeadService } from './lead.service';
import { PipelineController } from './pipeline.controller';
import { ActivityService } from './activity.service';

@Module({
  controllers: [LeadController, PipelineController],
  providers: [LeadService, ActivityService],
  exports: [LeadService, ActivityService],
})
export class CrmModule {}
