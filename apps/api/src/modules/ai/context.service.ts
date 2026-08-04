import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface CustomerContext {
  customer: {
    id: string;
    name: string | null;
    phone: string | null;
    email: string | null;
    language: string;
    leadScore: number;
    sentiment: string | null;
    lifetimeValue: number;
    tags: string[];
    aiSummary: string | null;
    firstSeenAt: Date;
    lastSeenAt: Date;
  } | null;
  recentInteractions: {
    channel: string;
    summary: string | null;
    sentiment: string | null;
    createdAt: Date;
  }[];
  appointments: {
    id: string;
    serviceName: string | null;
    staffName: string | null;
    scheduledAt: Date;
    status: string;
  }[];
  leads: {
    title: string | null;
    stageName: string;
    value: number;
  }[];
  knowledgeContext: string;
}

@Injectable()
export class ContextService {
  private readonly logger = new Logger(ContextService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Assemble full customer context for AI response generation.
   * Pulls customer memory, recent conversations, appointments, leads, and tenant KB.
   */
  async assembleContext(tenantId: string, customerId: string): Promise<CustomerContext> {
    try {
      // Fetch customer with all related data in parallel
      const [customer, conversations, appointments, leads] = await Promise.all([
        this.prisma.customer.findFirst({
          where: { id: customerId, tenantId },
        }),
        this.prisma.conversation.findMany({
          where: { customerId, tenantId },
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            channel: true,
            aiSummary: true,
            sentiment: true,
            createdAt: true,
          },
        }),
        this.prisma.appointment.findMany({
          where: { customerId, tenantId },
          orderBy: { scheduledAt: 'desc' },
          take: 5,
          include: {
            service: { select: { name: true } },
            staff: { select: { name: true } },
          },
        }),
        this.prisma.lead.findMany({
          where: { customer: { id: customerId }, tenantId },
          orderBy: { createdAt: 'desc' },
          take: 3,
          include: {
            stage: { select: { name: true } },
          },
        }),
      ]);

      return {
        customer: customer
          ? {
              id: customer.id,
              name: customer.name,
              phone: customer.phone,
              email: customer.email,
              language: customer.language,
              leadScore: customer.leadScore,
              sentiment: customer.sentiment,
              lifetimeValue: customer.lifetimeValue.toNumber(),
              tags: customer.tags,
              aiSummary: customer.aiSummary,
              firstSeenAt: customer.firstSeenAt,
              lastSeenAt: customer.lastSeenAt,
            }
          : null,
        recentInteractions: conversations.map((c: any) => ({
          channel: c.channel,
          summary: c.aiSummary,
          sentiment: c.sentiment,
          createdAt: c.createdAt,
        })),
        appointments: appointments.map((a: any) => ({
          id: a.id,
          serviceName: a.service?.name || null,
          staffName: a.staff?.name || null,
          scheduledAt: a.scheduledAt,
          status: a.status,
        })),
        leads: leads.map((l: any) => ({
          title: l.title,
          stageName: l.stage.name,
          value: l.value?.toNumber() || 0,
        })),
        knowledgeContext: '', // Populated by RAG service at call time
      };
    } catch (error) {
      this.logger.error(`Failed to assemble context: ${error}`);
      return {
        customer: null,
        recentInteractions: [],
        appointments: [],
        leads: [],
        knowledgeContext: '',
      };
    }
  }
}
