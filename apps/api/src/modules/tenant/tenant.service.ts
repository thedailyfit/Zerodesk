import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

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
    return tenant;
  }

  async update(id: string, data: any) {
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

    if (Object.keys(extraSettings).length > 0 || (data.settings && typeof data.settings === 'object')) {
      const existing = await this.prisma.tenant.findUnique({ where: { id } });
      safeData.settings = {
        ...(typeof existing?.settings === 'object' ? (existing.settings as any) : {}),
        ...(typeof data.settings === 'object' ? data.settings : {}),
        ...extraSettings,
      };
    }

    return this.prisma.tenant.update({
      where: { id },
      data: safeData,
    });
  }

  async updateBranding(id: string, data: any) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id } });
    if (!tenant) throw new NotFoundException('Tenant not found');
    
    return this.prisma.tenant.update({
      where: { id },
      data: {
        settings: {
          ...(typeof tenant.settings === 'object' ? tenant.settings : {}),
          branding: data,
        },
      },
    });
  }

  async getLlmSettings(id: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id } });
    if (!tenant) throw new NotFoundException('Tenant not found');
    const settings = (typeof tenant.settings === 'object' && tenant.settings ? tenant.settings : {}) as any;
    return settings.llmSettings || {
      primaryModel: 'gpt-4o',
      fallbackModel: 'llama-3.3-70b-versatile',
      voiceAiEnabled: true,
      whatsappAiEnabled: true,
      websiteAiEnabled: true,
      fallbackThresholdMs: 800,
      temperature: 0.3,
    };
  }

  async updateLlmSettings(id: string, llmSettings: any) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id } });
    if (!tenant) throw new NotFoundException('Tenant not found');
    const existingSettings = (typeof tenant.settings === 'object' && tenant.settings ? tenant.settings : {}) as any;
    return this.prisma.tenant.update({
      where: { id },
      data: {
        settings: {
          ...existingSettings,
          llmSettings,
        },
      },
    });
  }
}
