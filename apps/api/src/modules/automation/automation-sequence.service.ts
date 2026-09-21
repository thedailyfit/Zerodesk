import { Injectable, Logger, Optional } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class AutomationSequenceService {
  private readonly logger = new Logger(AutomationSequenceService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    @Optional() private readonly whatsappService?: WhatsappService,
  ) {}

  /**
   * Automated cron executing every 15 minutes across all active tenants.
   * Uses Redis distributed lock to ensure only one instance executes in multi-container setups.
   */
  @Cron('*/15 * * * *')
  async runAutomatedSequences() {
    const lockKey = 'lock:cron:automated-sequences';
    const lockTtlSeconds = 840; // 14 minutes
    const acquired = await this.redis.setNx(lockKey, 'locked', lockTtlSeconds);

    if (!acquired) {
      this.logger.log('Another cluster instance is executing the automated sequence cron. Skipping.');
      return;
    }

    this.logger.log('Acquired distributed lock. Starting automated WhatsApp sequence runner...');
    try {
      await Promise.allSettled([
        this.runAppointmentReminders(),
        this.runPostConsultationFeedback(),
        this.runMissedCallRecovery(),
        this.runThirtyDayReEngagement(),
      ]);
    } catch (err: any) {
      this.logger.error(`Automated sequences runner encountered an error: ${err.message}`);
    } finally {
      await this.redis.del(lockKey);
      this.logger.log('Automated WhatsApp sequence runner finished. Released distributed lock.');
    }
  }

  /**
   * Sequence 1: 24-Hour & 2-Hour Appointment Reminders
   */
  async runAppointmentReminders() {
    if (!this.whatsappService) return;

    const now = new Date();
    const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const pendingAppointments = await this.prisma.appointment.findMany({
      where: {
        status: 'SCHEDULED',
        reminderSent: false,
        scheduledAt: {
          gte: now,
          lte: next24Hours,
        },
      },
      include: {
        customer: true,
        service: true,
        staff: true,
        tenant: true,
      },
      take: 50,
    });

    for (const appt of pendingAppointments) {
      const phone = appt.customer?.phone;
      if (!phone || phone === '+919999999999') continue;

      const clinicName = appt.tenant?.name || 'ZeroDesk Clinic';
      const docName = appt.staff?.name ? ` with Dr. ${appt.staff.name}` : '';
      const formattedTime = appt.scheduledAt.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      const formattedDate = appt.scheduledAt.toLocaleDateString('en-IN', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });

      const reminderText =
        `⏰ Reminder: You have an upcoming appointment at ${clinicName}!

` +
        `👤 Patient: ${appt.customer.name || 'Valued Patient'}
` +
        `🩺 Service: ${appt.service?.name || 'Consultation'}${docName}
` +
        `📅 Date: ${formattedDate}
` +
        `⏰ Time: ${formattedTime}

` +
        `Please reply "1" to Confirm or "2" if you need to Reschedule.`;

      try {
        await this.whatsappService.sendMessage(appt.tenantId, phone, reminderText);
        await this.prisma.appointment.update({
          where: { id: appt.id },
          data: { reminderSent: true },
        });
        this.logger.log(`Sent 24h/2h appointment reminder to ${phone} for appointment ${appt.id}`);
      } catch (err: any) {
        this.logger.warn(`Failed to send appointment reminder for ${appt.id}: ${err.message}`);
      }
    }
  }

  /**
   * Sequence 2: Post-Consultation Google Review & Feedback (2h after appointment completion)
   */
  async runPostConsultationFeedback() {
    if (!this.whatsappService) return;

    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);

    const completedAppts = await this.prisma.appointment.findMany({
      where: {
        status: 'COMPLETED',
        scheduledAt: {
          gte: sixHoursAgo,
          lte: twoHoursAgo,
        },
      },
      include: {
        customer: true,
        staff: true,
        tenant: true,
      },
      take: 50,
    });

    for (const appt of completedAppts) {
      const phone = appt.customer?.phone;
      if (!phone || phone === '+919999999999') continue;

      // Check if feedback message was already sent in this conversation
      const existingFeedbackMsg = await this.prisma.message.findFirst({
        where: {
          tenantId: appt.tenantId,
          content: { contains: '[Feedback Request]' },
          createdAt: { gte: sixHoursAgo },
        },
      });

      if (existingFeedbackMsg) continue;

      const clinicName = appt.tenant?.name || 'ZeroDesk Clinic';
      const docName = appt.staff?.name ? `Dr. ${appt.staff.name}` : 'our medical team';

      const feedbackText =
        `[Feedback Request]
` +
        `⭐ Thank you for visiting ${clinicName} today!

` +
        `We hope your consultation with ${docName} was wonderful. Your health and comfort are our highest priorities.

` +
        `Could you take 30 seconds to rate your experience or leave us a Google review? It helps other patients find quality care:
` +
        `👉 https://g.page/r/review/${appt.tenant.slug}

` +
        `Have post-visit questions? Reply directly to this message!`;

      try {
        await this.whatsappService.sendMessage(appt.tenantId, phone, feedbackText);
        this.logger.log(`Dispatched Google review sequence to ${phone} for tenant ${appt.tenantId}`);
      } catch (err: any) {
        this.logger.warn(`Failed to send review request to ${phone}: ${err.message}`);
      }
    }
  }

  /**
   * Sequence 3: Missed Call Recovery (within 15 minutes of missed/failed voice call)
   */
  async runMissedCallRecovery() {
    if (!this.whatsappService) return;

    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);

    const missedConversations = await this.prisma.conversation.findMany({
      where: {
        channel: 'VOICE',
        status: { in: ['MISSED', 'NO_ANSWER', 'FAILED'] },
        createdAt: { gte: fifteenMinsAgo },
      },
      include: {
        customer: true,
        tenant: true,
      },
      take: 30,
    });

    for (const conv of missedConversations) {
      const phone = conv.customer?.phone;
      if (!phone || phone === '+919999999999') continue;

      const clinicName = conv.tenant?.name || 'our clinic';
      const bookingUrl = `https://zerodesk.in/book/${conv.tenant?.slug}`;

      const missedCallText =
        `📞 Hello from ${clinicName}! We noticed we just missed your call.

` +
        `Our lines were busy assisting other patients, but we are here to help you right now.

` +
        `📅 Book an appointment online in 30 seconds: ${bookingUrl}
` +
        `💬 Or simply reply to this WhatsApp message and our AI assistant will assist you immediately.`;

      try {
        await this.whatsappService.sendMessage(conv.tenantId, phone, missedCallText);
        // Mark conversation status as RECOVERED to prevent repeat sends
        await this.prisma.conversation.update({
          where: { id: conv.id },
          data: { status: 'RECOVERED' },
        });
        this.logger.log(`Dispatched missed call recovery sequence to ${phone}`);
      } catch (err: any) {
        this.logger.warn(`Failed missed call recovery for ${phone}: ${err.message}`);
      }
    }
  }

  /**
   * Sequence 4: 30-Day Routine Re-Engagement
   */
  async runThirtyDayReEngagement() {
    if (!this.whatsappService) return;

    const thirtyDaysAgoStart = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgoEnd = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000);

    const pastAppts = await this.prisma.appointment.findMany({
      where: {
        status: 'COMPLETED',
        scheduledAt: {
          gte: thirtyDaysAgoStart,
          lte: thirtyDaysAgoEnd,
        },
      },
      include: {
        customer: true,
        tenant: true,
        service: true,
      },
      take: 50,
    });

    for (const appt of pastAppts) {
      const phone = appt.customer?.phone;
      if (!phone || phone === '+919999999999') continue;

      // Ensure customer has no newer appointment booked
      const newerAppt = await this.prisma.appointment.findFirst({
        where: {
          tenantId: appt.tenantId,
          customerId: appt.customerId,
          scheduledAt: { gte: thirtyDaysAgoEnd },
        },
      });

      if (newerAppt) continue;

      const clinicName = appt.tenant?.name || 'ZeroDesk Clinic';
      const reEngageText =
        `🌿 Hello ${appt.customer.name || 'there'}! It has been 30 days since your last ${appt.service?.name || 'consultation'} at ${clinicName}.

` +
        `Consistent care and routine checkups are the secret to lasting health and glowing results.

` +
        `Would you like to schedule your follow-up appointment this week? Reply "YES" and we'll find the perfect slot for you!`;

      try {
        await this.whatsappService.sendMessage(appt.tenantId, phone, reEngageText);
        this.logger.log(`Dispatched 30-day re-engagement sequence to ${phone}`);
      } catch (err: any) {
        this.logger.warn(`Failed 30-day re-engagement for ${phone}: ${err.message}`);
      }
    }
  }
}
