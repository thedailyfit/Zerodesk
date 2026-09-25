import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PlivoService } from '../voice/plivo.service';
import { PLANS_REGISTRY } from '@zerodesk/shared';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private plivoService: PlivoService,
  ) {}

  async getPlatformStats() {
    const [
      tenantCount,
      activeTenantsCount,
      subAggregates,
      ragChunksCount,
      appointmentCount,
      customerCount,
      traceCount,
      badAnswersCount,
      usageAggregates,
    ] = await Promise.all([
      this.prisma.tenant.count(),
      this.prisma.tenant.count({ where: { deletedAt: null } }),
      this.prisma.subscription.aggregate({
        _sum: {
          mrr: true,
          voiceMinutesUsed: true,
          llmTokensUsed: true,
        },
      }),
      this.prisma.knowledgeChunk.count(),
      this.prisma.appointment.count(),
      this.prisma.customer.count(),
      this.prisma.llmTrace.count(),
      this.prisma.badAnswerFlag.count(),
      this.prisma.usageLedger.aggregate({
        _sum: { amount: true },
      }),
    ]);

    const totalMrr = Number(subAggregates._sum.mrr || 0);
    const totalVoiceMinutesUsed = Number(subAggregates._sum.voiceMinutesUsed || 0);
    const totalLlmTokensUsed = Number(subAggregates._sum.llmTokensUsed || 0);

    return {
      totalTenants: tenantCount,
      activeTenants: activeTenantsCount,
      totalMrr,
      totalVoiceMinutesUsed,
      totalLlmTokensUsed,
      totalRagChunks: ragChunksCount,
      totalAppointments: appointmentCount,
      totalCustomers: customerCount,
      totalTraces: traceCount,
      totalBadAnswers: badAnswersCount,
      totalUnitsDeducted: Number(usageAggregates._sum?.amount || 0),
    };
  }

  async getAllTenants() {
    return this.prisma.tenant.findMany({
      include: {
        subscription: true,
        voiceConfig: true,
        kyc: true,
        assignedLlm: true,
        assignedFallbackLlm: true,
        allowedVoices: true,
        _count: {
          select: {
            users: true,
            knowledgeChunks: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPendingKyc() {
    return this.prisma.tenantKyc.findMany({
      where: { status: 'PENDING' },
      include: {
        tenant: {
          include: {
            subscription: true,
            voiceConfig: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllKyc(status?: string) {
    const where: any = {};
    if (status) where.status = status;
    return this.prisma.tenantKyc.findMany({
      where,
      include: {
        tenant: {
          include: {
            subscription: true,
            voiceConfig: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async searchAvailableNumbers(country = 'IN', type = 'local') {
    return this.plivoService.searchNumbers(country, type);
  }

  async approveKyc(tenantId: string) {
    const kyc = await this.prisma.tenantKyc.findUnique({ where: { tenantId } });
    if (!kyc) throw new NotFoundException('KYC record not found');

    return this.prisma.tenantKyc.update({
      where: { tenantId },
      data: {
        status: 'VERIFIED',
        rejectionReason: null,
        verifiedAt: new Date(),
      },
    });
  }

  async rejectKyc(tenantId: string, rejectionReason: string) {
    const kyc = await this.prisma.tenantKyc.findUnique({ where: { tenantId } });
    if (!kyc) throw new NotFoundException('KYC record not found');

    return this.prisma.tenantKyc.update({
      where: { tenantId },
      data: {
        status: 'REJECTED',
        rejectionReason: rejectionReason || 'KYC documentation could not be verified with Indian regulatory records',
      },
    });
  }

  async provisionTenantNumber(tenantId: string, phoneNumber?: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { voiceConfig: true, kyc: true },
    });
    if (!tenant) throw new NotFoundException('Tenant not found');

    let assignedNumber = phoneNumber;
    if (!assignedNumber) {
      const available = await this.plivoService.searchNumbers('IN', 'local');
      if (available.length === 0) {
        throw new NotFoundException('No available Plivo numbers in stock for India');
      }
      assignedNumber = available[0].phoneNumber;
    }

    // Purchase via Plivo API
    await this.plivoService.purchaseNumber(assignedNumber);

    // Bind to VoiceConfig
    const config = await this.prisma.voiceConfig.upsert({
      where: { tenantId },
      update: {
        plivoPhoneNumber: assignedNumber,
        isActive: true,
      },
      create: {
        tenantId,
        plivoPhoneNumber: assignedNumber,
        isActive: true,
        voicePersonality: 'professional',
        languages: ['en', 'hi'],
      },
    });

    return {
      success: true,
      phoneNumber: assignedNumber,
      carrier: 'Plivo India',
      mappedToTrunk: 'LiveKit Cloud SIP',
      config,
    };
  }

  async updateTenantPlan(tenantId: string, planTier: string) {
    const upperTier = (planTier || 'STARTER').toUpperCase() as 'STARTER' | 'PRO';
    const planDef = PLANS_REGISTRY[upperTier] || PLANS_REGISTRY.STARTER;
    const normalizedPlan = planDef.tier;

    const limits = {
      voiceMinutesLimit: planDef.voiceMinutesIncluded,
      whatsappMessagesLimit: planDef.whatsappMessagesIncluded,
      llmTokensLimit: planDef.llmTokensIncluded,
      mrr: planDef.monthlyPriceINR,
    };

    await this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        planTier: normalizedPlan,
        subscriptionTier: normalizedPlan,
      },
    });

    const subscription = await this.prisma.subscription.upsert({
      where: { tenantId },
      update: {
        plan: normalizedPlan,
        mrr: limits.mrr,
        voiceMinutesLimit: limits.voiceMinutesLimit,
        whatsappMessagesLimit: limits.whatsappMessagesLimit,
        llmTokensLimit: limits.llmTokensLimit,
      },
      create: {
        tenantId,
        plan: normalizedPlan,
        mrr: limits.mrr,
        voiceMinutesLimit: limits.voiceMinutesLimit,
        whatsappMessagesLimit: limits.whatsappMessagesLimit,
        llmTokensLimit: limits.llmTokensLimit,
        status: 'active',
      },
    });

    return { success: true, planTier: normalizedPlan, limits, subscription };
  }

  async updateTenantLimits(
    tenantId: string,
    data: {
      plan?: string;
      status?: string;
      assignedLlmId?: string;
      assignedFallbackLlmId?: string;
      allowedVoiceIds?: string[];
      voiceMinutesLimit?: number;
      whatsappMessagesLimit?: number;
      llmTokensLimit?: number;
    },
  ) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { subscription: true },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant ${tenantId} not found`);
    }

    // Update subscription limits if provided
    if (tenant.subscription) {
      await this.prisma.subscription.update({
        where: { id: tenant.subscription.id },
        data: {
          plan: data.plan ?? tenant.subscription.plan,
          status: data.status ?? tenant.subscription.status,
          voiceMinutesLimit: data.voiceMinutesLimit ?? tenant.subscription.voiceMinutesLimit,
          whatsappMessagesLimit: data.whatsappMessagesLimit ?? tenant.subscription.whatsappMessagesLimit,
          llmTokensLimit: data.llmTokensLimit ?? tenant.subscription.llmTokensLimit,
        },
      });
    }

    // Update assigned LLM & allowed voices
    const updateData: any = {};
    if (data.assignedLlmId !== undefined) {
      updateData.assignedLlmId = data.assignedLlmId;
    }
    if (data.assignedFallbackLlmId !== undefined) {
      updateData.assignedFallbackLlmId = data.assignedFallbackLlmId;
    }
    if (data.allowedVoiceIds !== undefined) {
      updateData.allowedVoices = {
        set: data.allowedVoiceIds.map((id) => ({ id })),
      };
    }

    if (Object.keys(updateData).length > 0) {
      await this.prisma.tenant.update({
        where: { id: tenantId },
        data: updateData,
      });
    }

    return this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        subscription: true,
        assignedLlm: true,
        assignedFallbackLlm: true,
        allowedVoices: true,
      },
    });
  }

  // Voice Registry
  async getAllVoices() {
    return this.prisma.globalVoiceRegistry.findMany({
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
    });
  }

  async createVoice(data: {
    provider: string;
    voiceId: string;
    name: string;
    gender: string;
    language: string;
    accent?: string;
    sampleText?: string;
    previewUrl?: string;
    isDefault?: boolean;
    isActive?: boolean;
    tags?: string[];
  }) {
    return this.prisma.globalVoiceRegistry.create({
      data: {
        provider: data.provider,
        voiceId: data.voiceId,
        name: data.name,
        gender: data.gender,
        language: data.language,
        accent: data.accent,
        sampleText: data.sampleText,
        previewUrl: data.previewUrl,
        isDefault: data.isDefault ?? false,
        isActive: data.isActive ?? true,
        tags: data.tags ?? [],
      },
    });
  }

  async updateVoice(id: string, data: any) {
    return this.prisma.globalVoiceRegistry.update({
      where: { id },
      data,
    });
  }

  async deleteVoice(id: string) {
    return this.prisma.globalVoiceRegistry.delete({
      where: { id },
    });
  }

  // LLM Registry
  async getAllLlms() {
    return this.prisma.globalLlmRegistry.findMany({
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
    });
  }

  async createLlm(data: {
    provider: string;
    modelId: string;
    name: string;
    contextWindow?: number;
    costPer1kInput?: number;
    costPer1kOutput?: number;
    isDefault?: boolean;
    isActive?: boolean;
    isFallback?: boolean;
    category?: string;
    description?: string;
  }) {
    return this.prisma.globalLlmRegistry.create({
      data: {
        provider: data.provider,
        modelId: data.modelId,
        name: data.name,
        contextWindow: data.contextWindow ?? 128000,
        costPer1kInput: data.costPer1kInput ?? 0.0025,
        costPer1kOutput: data.costPer1kOutput ?? 0.01,
        isDefault: data.isDefault ?? false,
        isActive: data.isActive ?? true,
        isFallback: data.isFallback ?? false,
        category: data.category ?? 'flagship',
        description: data.description,
      },
    });
  }

  async updateLlm(id: string, data: any) {
    return this.prisma.globalLlmRegistry.update({
      where: { id },
      data,
    });
  }

  async deleteLlm(id: string) {
    return this.prisma.globalLlmRegistry.delete({
      where: { id },
    });
  }
}
