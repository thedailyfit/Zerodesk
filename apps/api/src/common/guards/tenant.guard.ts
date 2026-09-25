import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    if (request.tenantId && request.tenant) {
      return true;
    }

    const impersonatedTenantId = request.headers?.['x-tenant-id'];
    if (impersonatedTenantId && (request.user?.role === 'SUPER_ADMIN' || request.user?.publicMetadata?.role === 'super_admin' || process.env.NODE_ENV !== 'production')) {
      const targetTenant = await this.prisma.tenant.findUnique({
        where: { id: String(impersonatedTenantId) },
      });
      if (targetTenant) {
        request.tenantId = targetTenant.id;
        request.tenant = targetTenant;
        return true;
      }
    }

    const clerkOrgId = request.user?.orgId;

    if (!clerkOrgId) {
      if (request.tenantId) return true;

      const clerkUserId = request.user?.clerkUserId || request.user?.id;
      if (clerkUserId) {
        // 1. Look up user by clerkUserId
        let user = await this.prisma.user.findUnique({
          where: { clerkUserId },
          include: { tenant: true },
        });

        // 2. If user already exists, bind their tenant context
        if (user && user.tenant) {
          request.tenantId = user.tenant.id;
          request.tenant = user.tenant;
          request.user = {
            ...request.user,
            ...user,
            id: user.id,
            role: user.role || 'OWNER',
          };
          return true;
        }

        // 3. Auto-provision solo practice tenant for first-time solo practitioner login
        const email = request.user?.email || `doctor_${clerkUserId.slice(-6)}@zerodesk.ai`;
        const name = request.user?.name || request.user?.firstName || 'Practitioner';
        const cleanSlug = `practice-${clerkUserId.replace(/[^a-zA-Z0-9]/g, '').slice(-8).toLowerCase()}`;

        const newTenant = await this.prisma.tenant.create({
          data: {
            clerkOrgId: `solo_${clerkUserId}`,
            name: `${name}'s Practice`,
            slug: cleanSlug,
            industry: 'healthcare',
            planTier: 'starter',
            subscriptionTier: 'starter',
            users: {
              create: {
                clerkUserId,
                email,
                name: typeof name === 'string' ? name : 'Clinic Owner',
                role: 'OWNER',
              },
            },
          },
          include: { users: true },
        });

        const createdUser = newTenant.users[0];
        request.tenantId = newTenant.id;
        request.tenant = newTenant;
        request.user = {
          ...request.user,
          ...createdUser,
          id: createdUser?.id,
          role: 'OWNER',
        };
        return true;
      }

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

    if (!user || user.tenantId !== tenant.id) {
      throw new UnauthorizedException('User does not belong to this organization');
    }

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
