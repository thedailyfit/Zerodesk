import { Injectable, Logger, Optional, ForbiddenException } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';

type Sequence = 'REMINDER' | 'FEEDBACK' | 'MISSED_CALL' | 'REENGAGEMENT';
type Outcome = { key: string; status: string; reason?: string };

@Injectable()
export class AutomationSequenceService {
  private readonly logger = new Logger(AutomationSequenceService.name);
  constructor(private readonly prisma: PrismaService, @Optional() private readonly whatsappService?: WhatsappService) {}

  @Cron('*/15 * * * *')
  async runAutomatedSequences() {
    const workflows = await this.prisma.automationWorkflow.findMany({ where: { isActive: true, triggerType: 'SCHEDULED' }, select: { tenantId: true }, distinct: ['tenantId'] });
    for (const { tenantId } of workflows) {
      try { await this.runForTenant(tenantId); }
      catch (error) { this.logger.error(`Sequence tenant ${tenantId} failed: ${(error as Error).message}`); }
    }
  }

  async runForTenant(tenantId: string) {
    const subscription = await this.prisma.subscription.findUnique({ where: { tenantId } });
    if (!subscription || !['active', 'trialing'].includes(subscription.status.toLowerCase())) throw new ForbiddenException('Active subscription required');
    if (!this.whatsappService) return { status: 'unavailable', outcomes: [] };
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new ForbiddenException('Tenant unavailable');
    const workflows = await this.prisma.automationWorkflow.findMany({ where: { tenantId, isActive: true, triggerType: 'SCHEDULED' } });
    const enabled = new Set<Sequence>();
    for (const workflow of workflows) {
      const type = (workflow.definition as any)?.sequenceType;
      if (['REMINDER', 'FEEDBACK', 'MISSED_CALL', 'REENGAGEMENT'].includes(type)) enabled.add(type);
    }
    const outcomes: Outcome[] = [];
    for (const type of enabled) {
      try { outcomes.push(...await this.runSequence(tenant, type)); }
      catch (error) { outcomes.push({ key: type, status: 'failed', reason: (error as Error).message }); }
    }
    return { status: outcomes.some(o => ['failed', 'uncertain', 'pending'].includes(o.status)) ? 'attention_required' : 'completed', outcomes };
  }

  private async runSequence(tenant: any, type: Sequence): Promise<Outcome[]> {
    const now = new Date();
    const day = 86400000;
    const where: any = { tenantId: tenant.id };
    if (type === 'MISSED_CALL') Object.assign(where, { channel: 'VOICE', status: { in: ['MISSED', 'NO_ANSWER', 'FAILED'] }, createdAt: { gte: new Date(+now - day) } });
    else Object.assign(where, { deletedAt: null, status: type === 'REMINDER' ? 'SCHEDULED' : 'COMPLETED', scheduledAt: type === 'REMINDER' ? { gte: now, lte: new Date(+now + day) } : type === 'FEEDBACK' ? { gte: new Date(+now - 7 * day), lte: new Date(+now - 7200000) } : { gte: new Date(+now - 31 * day), lte: new Date(+now - 29 * day) } });
    const outcomes: Outcome[] = [];
    let cursor: string | undefined;
    let rows: any[];
    do {
      const query = { where, include: { customer: true }, orderBy: { id: 'asc' as const }, take: 100, ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}) };
      rows = type === 'MISSED_CALL' ? await this.prisma.conversation.findMany(query) : await this.prisma.appointment.findMany(query);
      for (const row of rows) {
        if (type === 'REENGAGEMENT' && await this.prisma.appointment.findFirst({ where: { tenantId: tenant.id, customerId: row.customerId, deletedAt: null, status: { notIn: ['CANCELLED', 'NO_SHOW'] }, scheduledAt: { gt: row.scheduledAt } } })) continue;
        const time = row.scheduledAt ? new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: tenant.timezone || 'Asia/Kolkata' }).format(row.scheduledAt) : '';
        const reviewUrl = (tenant.settings as any)?.reviewUrl;
        const safeReviewUrl = typeof reviewUrl === 'string' && /^https:\/\//.test(reviewUrl) ? reviewUrl : '';
        const messages: Record<Sequence, string> = {
          REMINDER: `Reminder from ${tenant.name}: your booking is scheduled for ${time}. Reply if you need assistance or a change.`,
          FEEDBACK: `Thank you for visiting ${tenant.name}. We welcome your feedback.${safeReviewUrl ? ` Share your experience: ${safeReviewUrl}` : ' Reply to share your experience.'}`,
          MISSED_CALL: `Hello from ${tenant.name}. We missed your call. Please reply if you would like assistance.`,
          REENGAGEMENT: `Hello from ${tenant.name}. Would you like to arrange another visit? Reply if you would like assistance.`,
        };
        outcomes.push(await this.deliver(tenant.id, `${type}:${row.id}`, row.customer, messages[type], type === 'REMINDER' ? row.id : undefined));
      }
      cursor = rows.length ? rows[rows.length - 1].id : undefined;
    } while (rows.length === 100);
    return outcomes;
  }

  private async deliver(tenantId: string, businessKey: string, customer: any, message: string, appointmentId?: string): Promise<Outcome> {
    // Claim before I/O. PENDING after a crash requires reconciliation, never an automatic duplicate send.
    let receipt: any;
    try { receipt = await this.prisma.automationDelivery.create({ data: { tenantId, businessKey } }); }
    catch (error: any) {
      if (error.code !== 'P2002') throw error;
      const previous = await this.prisma.automationDelivery.findUnique({ where: { tenantId_businessKey: { tenantId, businessKey } } });
      return { key: businessKey, status: (previous?.status || 'PENDING').toLowerCase() };
    }
    const finish = async (status: string, reason?: string, providerMessageId?: string) => {
      await this.prisma.automationDelivery.update({ where: { id: receipt.id }, data: { status, reason, providerMessageId } });
      return { key: businessKey, status: status.toLowerCase(), ...(reason ? { reason } : {}) };
    };
    const latest = customer ? await this.prisma.customer.findFirst({ where: { id: customer.id, tenantId, deletedAt: null } }) : null;
    if (!latest?.phone || latest.dndStatus || latest.anonymizedAt || latest.phone === '+919999999999') return finish('SKIPPED', 'Recipient unavailable or opted out');
    const consent = await this.prisma.patientConsent.findFirst({ where: { tenantId, customerId: latest.id, consentType: 'WHATSAPP_COMMUNICATION' }, orderBy: { grantedAt: 'desc' } });
    if (consent?.status !== 'GRANTED') return finish('SKIPPED', 'WhatsApp consent required');
    try {
      const result = await this.whatsappService!.sendMessage(tenantId, latest.phone, message);
      if (result?.skipped || result?.success === false) return finish('SKIPPED', result.reason || 'Send skipped');
      const providerId = result?.messages?.[0]?.id;
      if (!providerId) return finish('UNCERTAIN', 'No provider receipt');
      await this.prisma.$transaction(async tx => {
        await tx.automationDelivery.update({ where: { id: receipt.id }, data: { status: 'SENT', providerMessageId: providerId } });
        if (appointmentId) await tx.appointment.updateMany({ where: { id: appointmentId, tenantId }, data: { reminderSent: true } });
      });
      return { key: businessKey, status: 'sent' };
    } catch { return finish('UNCERTAIN', 'Send outcome requires reconciliation; retry suppressed'); }
  }
}
