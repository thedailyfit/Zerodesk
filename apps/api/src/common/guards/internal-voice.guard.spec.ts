import { UnauthorizedException } from '@nestjs/common';
import { InternalVoiceGuard } from './internal-voice.guard';

describe('InternalVoiceGuard', () => {
  let guard: InternalVoiceGuard;
  let mockConfigService: any;

  beforeEach(() => {
    mockConfigService = {
      get: jest.fn().mockReturnValue('test-internal-secret'),
    };
    guard = new InternalVoiceGuard(mockConfigService);
  });

  it('should allow request with valid secret and tenant id', () => {
    const req: any = {
      headers: {
        'x-internal-voice-key': 'test-internal-secret',
        'x-tenant-id': 'tenant-uuid-123',
      },
    };
    const context: any = {
      switchToHttp: () => ({
        getRequest: () => req,
      }),
    };

    const result = guard.canActivate(context);
    expect(result).toBe(true);
    expect(req.tenantId).toBe('tenant-uuid-123');
  });

  it('should reject request with missing or incorrect secret', () => {
    const req: any = {
      headers: {
        'x-internal-voice-key': 'wrong-secret',
        'x-tenant-id': 'tenant-uuid-123',
      },
    };
    const context: any = {
      switchToHttp: () => ({
        getRequest: () => req,
      }),
    };

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('should reject request with missing tenant id', () => {
    const req: any = {
      headers: {
        'x-internal-voice-key': 'test-internal-secret',
      },
    };
    const context: any = {
      switchToHttp: () => ({
        getRequest: () => req,
      }),
    };

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });
});
