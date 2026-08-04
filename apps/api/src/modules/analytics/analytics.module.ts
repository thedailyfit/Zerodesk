import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { RollupService } from './rollup.service';

@Module({
  controllers: [AnalyticsController],
  providers: [AnalyticsService, RollupService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
