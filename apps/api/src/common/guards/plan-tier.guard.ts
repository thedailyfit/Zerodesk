import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PLAN_TIER_KEY } from '../decorators/plan-tier.decorator';
import { PlanTierType } from '@zerodesk/shared';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PlanTierGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredTier = this.reflector.getAllAndOverride<PlanTierType>(PLAN_TIER_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredTier) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const tenantId = request.tenantId || request.headers['x-tenant-id'];

    if (!tenantId) {
      return true;
    }

    let tenant = request.tenant;
    if (!tenant || !tenant.planTier) {
      tenant = await this.prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { planTier: true, subscriptionTier: true },
      });
    }

    const activeTier = (tenant?.planTier || tenant?.subscriptionTier || 'starter').toUpperCase();

    if (requiredTier === 'PRO' && activeTier !== 'PRO') {
      throw new ForbiddenException({
        statusCode: 403,
        error: 'Forbidden',
        message: 'This feature is only available on the ZEROdesk Pro Plan (₹9,941/mo). Please upgrade your subscription to access this feature.',
        requiredPlan: 'PRO',
        currentPlan: activeTier,
      });
    }

    return true;
  }
}
