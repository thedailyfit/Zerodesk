import { UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let mockReflector: any;
  let mockConfigService: any;
  let mockPrisma: any;

  beforeEach(() => {
    mockConfigService = {
      get: jest.fn().mockReturnValue('whsec_test_secret_12345'),
    };
    mockReflector = {
      getAllAndOverride: jest.fn().mockReturnValue(false),
    };
    mockPrisma = {
      user: {
        findUnique: jest.fn(),
      },
    };
    guard = new AuthGuard(mockConfigService, mockReflector, mockPrisma);
  });

  it('should allow access if route is marked public', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(true);
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

  it('should throw UnauthorizedException if no authorization header is present', async () => {
    const context: any = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ headers: {} }),
      }),
    };

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException if token is invalid or malformed', async () => {
    const context: any = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ headers: { authorization: 'Bearer invalid-token' } }),
      }),
    };

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });
});
