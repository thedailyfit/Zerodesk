import { ForbiddenException } from '@nestjs/common';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let mockReflector: any;

  beforeEach(() => {
    mockReflector = {
      getAllAndOverride: jest.fn(),
    };
    guard = new RolesGuard(mockReflector);
  });

  it('should allow access if no roles are required', () => {
    mockReflector.getAllAndOverride.mockReturnValue(undefined);
    const context: any = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ user: {} }),
      }),
    };

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should throw ForbiddenException if user has no role', () => {
    mockReflector.getAllAndOverride.mockReturnValue(['STAFF']);
    const context: any = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ user: {} }),
      }),
    };

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should allow OWNER to access MANAGER and STAFF endpoints', () => {
    mockReflector.getAllAndOverride.mockReturnValue(['MANAGER']);
    const context: any = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ user: { role: 'OWNER' } }),
      }),
    };

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should normalize Clerk org:owner to OWNER and grant access', () => {
    mockReflector.getAllAndOverride.mockReturnValue(['ADMIN']);
    const context: any = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ user: { orgRole: 'org:owner' } }),
      }),
    };

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should deny STAFF from accessing ADMIN endpoint', () => {
    mockReflector.getAllAndOverride.mockReturnValue(['ADMIN']);
    const context: any = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ user: { role: 'STAFF' } }),
      }),
    };

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
