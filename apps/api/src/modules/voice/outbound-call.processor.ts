import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { VoiceService } from './voice.service';
import { PrismaService } from '../../prisma/prisma.service';

export interface OutboundCallJobData {
  tenantId: string;
  phoneNumber: string;
  purpose?: string;
  customerName?: string;
}

@Processor('outbound-calls')
export class OutboundCallProcessor extends WorkerHost {
  private readonly logger = new Logger(OutboundCallProcessor.name);

  constructor(
    private voiceService: VoiceService,
    private prisma: PrismaService,
  ) {
    super();
  }

  async process(job: Job<OutboundCallJobData>): Promise<any> {
    const { tenantId, phoneNumber, purpose, customerName } = job.data;
    this.logger.log(`Processing outbound call job ${job.id} for tenant ${tenantId} to ${phoneNumber}`);

    // Fetch tenant to check timezone for TCPA compliance
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    const timezone = tenant?.timezone || 'America/New_York';

    // Verify legal calling hours (8:00 AM - 9:00 PM local time)
    const isAllowedHours = this.checkLegalCallingHours(timezone);

    if (!isAllowedHours) {
      this.logger.warn(
        `Outside legal calling hours (8 AM - 9 PM in ${timezone}) for job ${job.id}. Delaying job to next 8 AM window.`,
      );
      const delayMs = this.calculateMsUntilNext8AM(timezone);
      
      await job.moveToDelayed(Date.now() + delayMs, job.token);
      return { status: 'rescheduled', delayMs, reason: 'TCPA_OUTSIDE_HOURS' };
    }

    // Call allowed -> execute call via VoiceService
    try {
      const result = await this.voiceService.executeOutboundCall(tenantId, phoneNumber, purpose);
      this.logger.log(`Outbound call executed successfully for job ${job.id}: ${JSON.stringify(result)}`);
      return result;
    } catch (error) {
      this.logger.error(`Outbound call failed for job ${job.id}: ${error}`);
      throw error;
    }
  }

  /**
   * Helper to check if current time in tenant's timezone is between 8 AM (8) and 9 PM (21).
   */
  private checkLegalCallingHours(timezone: string): boolean {
    try {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour: 'numeric',
        hour12: false,
      });
      const hour = parseInt(formatter.format(now), 10);
      return hour >= 8 && hour < 21;
    } catch (error) {
      this.logger.warn(`Failed to parse timezone ${timezone}, defaulting to allowed: ${error}`);
      return true;
    }
  }

  /**
   * Calculate milliseconds until 8:00 AM local time in tenant's timezone.
   */
  private calculateMsUntilNext8AM(timezone: string): number {
    try {
      const now = new Date();
      const localStr = now.toLocaleString('en-US', { timeZone: timezone });
      const localDate = new Date(localStr);

      const target = new Date(localDate);
      if (localDate.getHours() >= 21) {
        // If past 9 PM, schedule for tomorrow at 8 AM
        target.setDate(target.getDate() + 1);
      }
      target.setHours(8, 0, 0, 0);

      const diffMs = target.getTime() - localDate.getTime();
      return Math.max(diffMs, 60000); // At least 1 minute delay
    } catch {
      return 8 * 3600 * 1000; // Fallback 8 hours delay
    }
  }
}
