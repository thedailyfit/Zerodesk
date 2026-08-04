import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const clerkOrgId = request.user?.orgId;

    if (!clerkOrgId) {
      throw new UnauthorizedException('No organization context');
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { clerkOrgId },
    });

    if (!tenant) {
      throw new UnauthorizedException('Tenant not found');
    }

    // Resolve the full user from DB
    const user = await this.prisma.user.findUnique({
      where: { clerkUserId: request.user.clerkUserId },
    });

    request.tenantId = tenant.id;
    request.tenant = tenant;
    request.user = {
      ...request.user,
      ...user,
      id: user?.id,
      role: user?.role || 'VIEWER',
    };

    return true;
  }
}
