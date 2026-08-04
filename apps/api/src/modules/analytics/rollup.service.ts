import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RollupService {
  private readonly logger = new Logger(RollupService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Hourly Cron Job: Ensures Materialized Views and analytical aggregates are fresh.
   */
  @Cron(CronExpression.EVERY_HOUR)
  async refreshMaterializedViews() {
    this.logger.log('Executing hourly Materialized View refresh...');
    try {
      // Refresh Materialized View concurrently if supported
      await this.prisma.$executeRawUnsafe(
        `CREATE MATERIALIZED VIEW IF NOT EXISTS tenant_daily_analytics AS
         SELECT 
           tenant_id,
           COUNT(DISTINCT id) as total_customers,
           SUM(lifetime_value) as total_revenue
         FROM customers
         GROUP BY tenant_id;`
      );

      await this.prisma.$executeRawUnsafe(`REFRESH MATERIALIZED VIEW tenant_daily_analytics;`);
      this.logger.log('Materialized View tenant_daily_analytics refreshed successfully.');
    } catch (error) {
      this.logger.warn(`Materialized View refresh notice: ${error}`);
    }
  }
}
