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

  async update(id: string, data: any) {
    const safeData: any = {};
    if (typeof data.name === 'string') safeData.name = data.name;
    if (typeof data.timezone === 'string') safeData.timezone = data.timezone;
    if (typeof data.logoUrl === 'string') safeData.logoUrl = data.logoUrl;
    if (typeof data.industry === 'string') safeData.industry = data.industry;
    if (data.settings && typeof data.settings === 'object') {
      const existing = await this.prisma.tenant.findUnique({ where: { id } });
      safeData.settings = {
        ...(typeof existing?.settings === 'object' ? existing.settings : {}),
        ...data.settings,
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
}
