import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getPlatformStats() {
    const [tenantCount, subscriptions, ragChunksCount] = await Promise.all([
      this.prisma.tenant.count(),
      this.prisma.subscription.findMany(),
      this.prisma.knowledgeChunk.count(),
    ]);

    const totalMrr = subscriptions.reduce((acc, sub) => acc + Number(sub.mrr || 0), 0);
    const totalVoiceMinutesUsed = subscriptions.reduce((acc, sub) => acc + (sub.voiceMinutesUsed || 0), 0);
    const totalLlmTokensUsed = subscriptions.reduce((acc, sub) => acc + (sub.llmTokensUsed || 0), 0);

    return {
      totalTenants: tenantCount,
      totalMrr,
      totalVoiceMinutesUsed,
      totalLlmTokensUsed,
      totalRagChunks: ragChunksCount,
    };
  }

  async getAllTenants() {
    return this.prisma.tenant.findMany({
      include: {
        subscription: true,
        voiceConfig: true,
        assignedLlm: true,
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

  async updateTenantLimits(
    tenantId: string,
    data: {
      plan?: string;
      status?: string;
      assignedLlmId?: string;
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
