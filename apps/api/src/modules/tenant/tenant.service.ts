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
    return this.prisma.tenant.update({
      where: { id },
      data,
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
