import { ForbiddenException } from '@nestjs/common';
import { PlanTierGuard } from './plan-tier.guard';

describe('PlanTierGuard', () => {
  let guard: PlanTierGuard;
  let mockReflector: any;
  let mockPrisma: any;

  beforeEach(() => {
    mockReflector = {
      getAllAndOverride: jest.fn(),
    };
    mockPrisma = {
      tenant: {
        findUnique: jest.fn(),
      },
    };
    guard = new PlanTierGuard(mockReflector, mockPrisma);
  });

  it('should allow access if route has no plan restriction', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(undefined);
    const context: any = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ headers: {} }),
      }),
    };

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should throw ForbiddenException if route requires PRO and tenant is on STARTER', async () => {
    mockReflector.getAllAndOverride.mockReturnValue('PRO');
    const context: any = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({
          tenantId: 'tenant-123',
          tenant: { planTier: 'starter' },
          headers: {},
        }),
      }),
    };

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });

  it('should allow access if route requires PRO and tenant is on PRO', async () => {
    mockReflector.getAllAndOverride.mockReturnValue('PRO');
    const context: any = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({
          tenantId: 'tenant-pro',
          tenant: { planTier: 'pro' },
          headers: {},
        }),
      }),
    };

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should query prisma if tenant planTier is not cached in request object', async () => {
    mockReflector.getAllAndOverride.mockReturnValue('PRO');
    mockPrisma.tenant.findUnique.mockResolvedValue({ planTier: 'pro' });

    const context: any = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({
          tenantId: 'tenant-pro',
          headers: {},
        }),
      }),
    };

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
    expect(mockPrisma.tenant.findUnique).toHaveBeenCalledWith({
      where: { id: 'tenant-pro' },
      select: { planTier: true, subscriptionTier: true },
    });
  });
});
