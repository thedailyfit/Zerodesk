import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ObservabilityService } from './observability.service';
import { ObservabilityController } from './observability.controller';
import { EvalProcessor } from './eval.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'ai-evaluation-queue',
    }),
  ],
  controllers: [ObservabilityController],
  providers: [ObservabilityService, EvalProcessor],
  exports: [ObservabilityService],
})
export class ObservabilityModule {}
