import { UnauthorizedException } from '@nestjs/common';
import { TenantGuard } from './tenant.guard';

describe('TenantGuard', () => {
  let guard: TenantGuard;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      tenant: {
        findUnique: jest.fn().mockResolvedValue({ id: 'tenant-123', clerkOrgId: 'org_123' }),
      },
      user: {
        findUnique: jest.fn().mockResolvedValue({ id: 'user-123', tenantId: 'tenant-123', role: 'ADMIN' }),
      },
    };
    guard = new TenantGuard(mockPrisma);
  });

  it('should allow request when tenantId and tenant are already resolved', async () => {
    const req: any = {
      tenantId: 'tenant-123',
      tenant: { id: 'tenant-123' },
    };
    const context: any = {
      switchToHttp: () => ({
        getRequest: () => req,
      }),
    };

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should resolve tenant from Clerk orgId and user context', async () => {
    const req: any = {
      user: {
        orgId: 'org_123',
        clerkUserId: 'user_clerk_123',
      },
    };
    const context: any = {
      switchToHttp: () => ({
        getRequest: () => req,
      }),
    };

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
    expect(req.tenantId).toBe('tenant-123');
  });

  it('should throw UnauthorizedException when no org or tenant context is present', async () => {
    const req: any = {};
    const context: any = {
      switchToHttp: () => ({
        getRequest: () => req,
      }),
    };

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });
});
