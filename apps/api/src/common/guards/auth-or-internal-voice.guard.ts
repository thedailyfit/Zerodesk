import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';
import { AuthGuard } from './auth.guard';
import { TenantGuard } from './tenant.guard';

@Injectable()
export class AuthOrInternalVoiceGuard implements CanActivate {
  private authGuard: AuthGuard;
  private tenantGuard: TenantGuard;

  constructor(
    private configService: ConfigService,
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {
    this.authGuard = new AuthGuard(configService, reflector, prisma);
    this.tenantGuard = new TenantGuard(prisma);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const voiceKey = request.headers['x-internal-voice-key'];
    const expectedKey = this.configService.get<string>('INTERNAL_VOICE_SECRET');

    if (voiceKey && expectedKey) {
      const keyBuf = Buffer.from(String(voiceKey));
      const expBuf = Buffer.from(String(expectedKey));
      if (keyBuf.length === expBuf.length && crypto.timingSafeEqual(keyBuf, expBuf)) {
        const tenantId = request.headers['x-tenant-id'] || request.query?.tenantId || request.body?.tenantId;
        if (!tenantId) {
          throw new UnauthorizedException('Missing x-tenant-id for voice operation');
        }
        request.tenantId = tenantId;
        return true;
      }
    }

    // In development mode, allow public/demo requests for testing if no auth header is provided
    if (process.env.NODE_ENV !== 'production' && !request.headers['authorization'] && !voiceKey) {
      request.tenantId = request.headers['x-tenant-id'] || request.query?.tenantId || '08f1fadd-59eb-4d07-9ee3-65a2d9a321e3';
      return true;
    }

    // Otherwise require normal Clerk user authentication and tenant context
    const authOk = await this.authGuard.canActivate(context);
    if (!authOk) return false;
    return this.tenantGuard.canActivate(context);
  }
}
