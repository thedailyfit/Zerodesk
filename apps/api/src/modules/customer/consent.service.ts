import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ConsentService {
  private readonly logger = new Logger(ConsentService.name);

  constructor(private prisma: PrismaService) {}

  async recordConsent(
    tenantId: string,
    customerId: string,
    consentType: 'VOICE_RECORDING' | 'WHATSAPP_COMMUNICATION' | 'DATA_PROCESSING',
    channel: 'VOICE' | 'WHATSAPP' | 'WEB',
    ipAddress?: string,
  ) {
    const customer = await this.prisma.customer.findFirst({
      where: { id: customerId, tenantId },
    });
    if (!customer) {
      throw new NotFoundException('Patient / Customer not found');
    }

    return this.prisma.patientConsent.create({
      data: {
        tenantId,
        customerId,
        consentType,
        status: 'GRANTED',
        channel,
        ipAddress: ipAddress || null,
        grantedAt: new Date(),
      },
    });
  }

  async revokeConsent(tenantId: string, customerId: string, consentType: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id: customerId, tenantId },
    });
    if (!customer) {
      throw new NotFoundException('Patient / Customer not found');
    }

    await this.prisma.patientConsent.updateMany({
      where: { tenantId, customerId, consentType, status: 'GRANTED' },
      data: {
        status: 'REVOKED',
        revokedAt: new Date(),
      },
    });

    if (consentType === 'WHATSAPP_COMMUNICATION') {
      await this.prisma.customer.update({
        where: { id: customerId },
        data: { dndStatus: true, optedOutAt: new Date() },
      });
    }

    return { success: true, message: `Consent for ${consentType} revoked successfully` };
  }

  /**
   * Execute DPDP Act 2023 Section 12 Right to Erasure:
   * Anonymizes personal health & identifiable records while preserving statutory financial records.
   */
  async executeDpdpDataErasure(tenantId: string, customerId: string, reason?: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id: customerId, tenantId },
    });
    if (!customer) {
      throw new NotFoundException('Patient / Customer not found');
    }

    const hashedSuffix = customer.id.slice(-6);

    const updated = await this.prisma.$transaction(async (tx) => {
      // 1. Revoke all active consents
      await tx.patientConsent.updateMany({
        where: { tenantId, customerId, status: 'GRANTED' },
        data: { status: 'REVOKED', revokedAt: new Date() },
      });

      // 2. Anonymize Customer record
      const anonymized = await tx.customer.update({
        where: { id: customerId },
        data: {
          name: `Anonymized Patient #${hashedSuffix}`,
          phone: `+91000000${hashedSuffix}`,
          email: null,
          aiSummary: null,
          sentiment: null,
          metadata: { dpdpErased: true, erasedAt: new Date().toISOString(), reason: reason || 'Patient DPDP Section 12 Request' },
          tags: ['DPDP_ERASED'],
          dndStatus: true,
          anonymizedAt: new Date(),
        },
      });

      // 3. Anonymize conversation summaries, raw messages, and media
      const conversations = await tx.conversation.findMany({
        where: { tenantId, customerId },
        select: { id: true },
      });
      const convIds = conversations.map((c) => c.id);

      if (convIds.length > 0) {
        await tx.conversation.updateMany({
          where: { id: { in: convIds } },
          data: {
            aiSummary: '[REDACTED UNDER DPDP ACT 2023]',
            sentiment: null,
            resolution: '[DPDP_ERASED]',
          },
        });

        await tx.message.updateMany({
          where: { tenantId, conversationId: { in: convIds } },
          data: {
            content: '[MESSAGE CONTENT ERASED UNDER DPDP SECTION 12]',
            mediaUrl: null,
            metadata: { dpdpErased: true },
          },
        });
      }

      // 4. Redact patient Activity records
      await tx.activity.updateMany({
        where: { tenantId, customerId },
        data: {
          content: '[ACTIVITY LOG REDACTED UNDER DPDP ACT 2023]',
          metadata: { dpdpErased: true },
        },
      });

      // 5. Redact clinical appointment notes
      if (tx.appointment?.updateMany) {
        await tx.appointment.updateMany({
          where: { tenantId, customerId },
          data: {
            notes: '[CLINICAL NOTES ERASED UNDER DPDP SECTION 12]',
          },
        });
      }

      // 6. Redact LLM prompt/completion traces
      if (tx.llmTrace?.updateMany) {
        const traceWhere: any = { tenantId };
        if (convIds.length > 0) {
          traceWhere.OR = [
            { conversationId: { in: convIds } },
            { userQuery: { contains: customerId } },
          ];
        } else {
          traceWhere.userQuery = { contains: customerId };
        }
        await tx.llmTrace.updateMany({
          where: traceWhere,
          data: {
            userQuery: '[QUERY REDACTED UNDER DPDP SECTION 12]',
            rawResponse: '[RESPONSE REDACTED UNDER DPDP SECTION 12]',
            sanitizedQuery: '[REDACTED]',
          },
        });
      }

      // 7. Create Audit Log for compliance proof
      await tx.auditLog.create({
        data: {
          tenantId,
          action: 'DPDP_RIGHT_TO_ERASURE_EXECUTED',
          resourceType: 'CUSTOMER',
          resourceId: customerId,
          details: {
            reason: reason || 'Patient Request',
            anonymizedAt: new Date().toISOString(),
          },
        },
      });

      return anonymized;
    });

    this.logger.log(`DPDP erasure completed for customer ${customerId} in tenant ${tenantId}`);
    return {
      success: true,
      message: 'Patient personal data erased and anonymized under DPDP Act 2023 statutory guidelines',
      customerId: updated.id,
      anonymizedAt: updated.anonymizedAt,
    };
  }
}
