import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

import { defaultLlmSettings, validateLlmSettings, supportedProviders } from '../ai/runtime-settings';
import { validateTenantUpdate } from './settings-validation';

@Injectable()
export class TenantService {
  constructor(private prisma: PrismaService) {}

  async findByClerkOrgId(clerkOrgId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { clerkOrgId },
    });
    if (!tenant) throw new NotFoundException('Tenant not found');
    return tenant;
  }

  async findBySlug(slug: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        industry: true,
        logoUrl: true,
        timezone: true,
        settings: true,
      },
    });
    if (!tenant) throw new NotFoundException(`Tenant with slug "${slug}" not found`);
    const settings = tenant.settings && typeof tenant.settings === 'object' ? tenant.settings as Record<string, unknown> : {};
    return { ...tenant, settings: Object.fromEntries(['branding', 'workingHours', 'offerings', 'phone', 'city', 'address'].filter(key => settings[key] !== undefined).map(key => [key, settings[key]])) };
  }

  async update(id: string, data: any) {
    validateTenantUpdate(data);
    const safeData: any = {};
    if (typeof data.name === 'string') safeData.name = data.name;
    if (typeof data.timezone === 'string') safeData.timezone = data.timezone;
    if (typeof data.logoUrl === 'string') safeData.logoUrl = data.logoUrl;
    if (typeof data.industry === 'string') safeData.industry = data.industry;
    if (typeof data.onboardingCompleted === 'boolean') safeData.onboardingCompleted = data.onboardingCompleted;

    const extraSettingFields = ['phone', 'city', 'workingHours', 'offerings', 'profile', 'address'];
    const extraSettings: Record<string, any> = {};
    for (const field of extraSettingFields) {
      if (data[field] !== undefined) {
        extraSettings[field] = data[field];
      }
    }

    return this.mergeSettings(id, { ...(data.settings || {}), ...extraSettings }, safeData);
  }

  private async mergeSettings(id: string, patch: any, fields: any = {}) {
    return this.prisma.$transaction(async tx => {
      await tx.$queryRaw`SELECT id FROM tenants WHERE id = ${id}::uuid FOR UPDATE`;
      const tenant = await tx.tenant.findUnique({ where: { id } });
      if (!tenant) throw new NotFoundException('Tenant not found');
      return tx.tenant.update({ where: { id }, data: { ...fields, settings: { ...(tenant.settings as any || {}), ...patch } } });
    });
  }

  async updateBranding(id: string, data: any) {
    validateTenantUpdate({ settings: { branding: data } });
    return this.mergeSettings(id, { branding: data });
  }

  async getLlmSettings(id: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id } });
    if (!tenant) throw new NotFoundException('Tenant not found');
    const settings = (typeof tenant.settings === 'object' && tenant.settings ? tenant.settings : {}) as any;
    return { ...defaultLlmSettings, ...(settings.llmSettings || {}) };
  }

  async getLlmModels() {
    return this.prisma.globalLlmRegistry.findMany({ where: { isActive: true, provider: { in: supportedProviders } }, select: { modelId: true, name: true, provider: true, description: true } });
  }

  async updateLlmSettings(id: string, llmSettings: any) {
    const clean = validateLlmSettings(llmSettings);
    for (const key of ['primaryModel', 'fallbackModel']) {
      if (clean[key]) {
        const model = await this.prisma.globalLlmRegistry.findFirst({ where: { modelId: clean[key], isActive: true, provider: { in: supportedProviders } } });
        if (!model) throw new BadRequestException('Choose an active supported model from the registry');
        if (clean.voiceAiEnabled && model.provider === 'sarvam') throw new BadRequestException('Voice LLM routing supports OpenAI, Groq and Gemini');
      }
    }
    if ((clean.voiceAiEnabled || clean.whatsappAiEnabled || clean.websiteAiEnabled) && !clean.primaryModel) throw new BadRequestException('An active primary model is required to enable AI');
    const result = await this.mergeSettings(id, { llmSettings: { ...defaultLlmSettings, ...clean } });
    return (result.settings as any).llmSettings;
  }
}
