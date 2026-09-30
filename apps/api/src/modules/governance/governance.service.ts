import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface ActionTraceInput {
  tenantId: string;
  agentKey?: string;
  traceId?: string;
  channel: 'VOICE' | 'WHATSAPP' | 'WEB';
  actionName: string;
  targetResource: string;
  parameters: Record<string, any>;
  policyDecision?: 'ALLOWED' | 'DENIED';
  policyRuleId?: string;
  executionStatus: 'COMMITTED' | 'FAILED' | 'REJECTED';
  entityId?: string;
  errorMessage?: string;
  latencyMs?: number;
}

@Injectable()
export class GovernanceService {
  private readonly logger = new Logger(GovernanceService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retrieves the complete Agent Estate Board & Failure Register for the tenant.
   * Reading the board never creates owners, policies or operational history.
   */
  async getEstate(tenantId: string) {
    let estates = await this.prisma.agentEstate.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'asc' },
    });

    return estates;
  }

  async updateEstateAgent(tenantId: string, agentKey: string, data: any) {
    const estate = await this.prisma.agentEstate.findUnique({
      where: { tenantId_agentKey: { tenantId, agentKey } },
    });

    if (!estate) {
      throw new NotFoundException(`Agent estate for key ${agentKey} not found`);
    }

    return this.prisma.agentEstate.update({
      where: { id: estate.id },
      data: {
        humanOwnerName: data.humanOwnerName !== undefined ? data.humanOwnerName : estate.humanOwnerName,
        humanOwnerRole: data.humanOwnerRole !== undefined ? data.humanOwnerRole : estate.humanOwnerRole,
        allowedTools: data.allowedTools !== undefined ? data.allowedTools : estate.allowedTools,
        hardLimits: data.hardLimits !== undefined ? data.hardLimits : estate.hardLimits,
        goalIntegrityOwner: data.goalIntegrityOwner !== undefined ? data.goalIntegrityOwner : estate.goalIntegrityOwner,
        authorityOwner: data.authorityOwner !== undefined ? data.authorityOwner : estate.authorityOwner,
        supplyChainOwner: data.supplyChainOwner !== undefined ? data.supplyChainOwner : estate.supplyChainOwner,
        blastRadiusOwner: data.blastRadiusOwner !== undefined ? data.blastRadiusOwner : estate.blastRadiusOwner,
        isActive: data.isActive !== undefined ? data.isActive : estate.isActive,
      },
    });
  }

  /**
   * Records an immutable Action Trace (Action vs Prompt logs) with exact execution outcome.
   */
  async recordActionTrace(input: ActionTraceInput) {
    let agentEstateId: string | undefined = undefined;

    if (input.agentKey) {
      const estate = await this.prisma.agentEstate.findUnique({
        where: { tenantId_agentKey: { tenantId: input.tenantId, agentKey: input.agentKey } },
        select: { id: true },
      });
      if (estate) agentEstateId = estate.id;
    }

    return this.prisma.actionTrace.create({
      data: {
        tenantId: input.tenantId,
        agentEstateId,
        traceId: input.traceId || null,
        channel: input.channel,
        actionName: input.actionName,
        targetResource: input.targetResource,
        parameters: input.parameters || {},
        policyDecision: input.policyDecision || 'ALLOWED',
        policyRuleId: input.policyRuleId || 'PERMIT_CLINIC_STANDARD_POLICY',
        executionStatus: input.executionStatus,
        entityId: input.entityId || null,
        errorMessage: input.errorMessage || null,
        latencyMs: input.latencyMs || 0,
      },
    });
  }

  /**
   * Retrieves searchable, filtered Action Traces for compliance & disputes.
   */
  async getActionTraces(
    tenantId: string,
    page = 1,
    limit = 20,
    channel?: string,
    actionName?: string,
    executionStatus?: string,
  ) {
    const skip = (page - 1) * limit;
    const where: any = { tenantId };

    if (channel) where.channel = channel;
    if (actionName) where.actionName = actionName;
    if (executionStatus) where.executionStatus = executionStatus;

    const [data, total] = await Promise.all([
      this.prisma.actionTrace.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          agentEstate: {
            select: { name: true, humanOwnerName: true, agentKey: true },
          },
        },
      }),
      this.prisma.actionTrace.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  /**
   * Aggregates real-time health across the Healthcare Frontier Agent Trilogy.
   */
  async getFrontierHealth(tenantId: string) {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const where = { tenantId, createdAt: { gte: since } };
    const [subscription, totalActions, failedActions, committedActions, activeAgents] = await Promise.all([
      this.prisma.subscription.findUnique({ where: { tenantId } }),
      this.prisma.actionTrace.count({ where }),
      this.prisma.actionTrace.count({ where: { ...where, executionStatus: 'FAILED' } }),
      this.prisma.actionTrace.count({ where: { ...where, executionStatus: 'COMMITTED' } }),
      this.prisma.agentEstate.count({ where: { tenantId, isActive: true } }),
    ]);
    const voiceUsed = subscription?.voiceMinutesUsed ?? null;
    const voiceLimit = subscription?.voiceMinutesLimit ?? null;
    const waUsed = subscription?.whatsappMessagesUsed ?? null;
    const waLimit = subscription?.whatsappMessagesLimit ?? null;
    return {
      measuredAt: new Date().toISOString(),
      trilogy: {
        devops: { status: 'UNKNOWN', telephonyCarrier: 'Not measured', livekitCluster: 'Not measured', queuesActive: [], queueLagMs: null },
        finops: {
          status: voiceUsed === null || !voiceLimit ? 'UNKNOWN' : voiceUsed > voiceLimit * 0.9 ? 'WARNING' : 'WITHIN_LIMIT',
          voiceMinutesUsed: voiceUsed, voiceMinutesLimit: voiceLimit,
          voiceMinutesPercent: voiceUsed !== null && voiceLimit && voiceLimit > 0 ? Number((voiceUsed / voiceLimit * 100).toFixed(1)) : null,
          whatsappMessagesUsed: waUsed, whatsappMessagesLimit: waLimit,
          whatsappMessagesPercent: waUsed !== null && waLimit && waLimit > 0 ? Number((waUsed / waLimit * 100).toFixed(1)) : null,
          projectedOverage: null,
        },
        appsec: { status: 'UNKNOWN', piiRedactionActive: null, dpdpConsentEnforced: null, audioRecordingsPresigned: null, unredactedLogLeaks: null },
      },
      metrics24h: { totalActions, failedActions, successRate: totalActions > 0 ? Number((committedActions / totalActions * 100).toFixed(1)) : null, activeAgents },
    };
  }
}
