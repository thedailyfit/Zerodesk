import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getPlatformStats() {
    const tenantCount = await this.prisma.tenant.count();
    return {
      totalTenants: tenantCount,
    };
  }
}
