import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import * as crypto from 'crypto';

@Injectable()
export class InternalVoiceGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const voiceKey = typeof request.headers['x-internal-voice-key'] === 'string' ? request.headers['x-internal-voice-key'].trim() : '';
    const expectedKey = (this.configService.get<string>('INTERNAL_VOICE_SECRET') || '').trim();

    if (!expectedKey || !voiceKey) {
      throw new UnauthorizedException('Missing or invalid internal voice worker credentials');
    }

    const keyBuf = Buffer.from(voiceKey);
    const expBuf = Buffer.from(expectedKey);
    if (keyBuf.length !== expBuf.length || !crypto.timingSafeEqual(keyBuf, expBuf)) {
      throw new UnauthorizedException('Missing or invalid internal voice worker credentials');
    }

    const supplied = [request.headers['x-tenant-id'], request.body?.tenantId, request.query?.tenantId].filter(value => value !== undefined);
    if (!supplied.length || supplied.some(value => typeof value !== 'string' || !value.trim() || ['default', 'default_business'].includes(value.trim()))) {
      throw new UnauthorizedException('Missing x-tenant-id header or tenantId parameter for voice operation');
    }
    const tenantId = supplied[0].trim();
    if (supplied.some(value => value.trim() !== tenantId)) {
      throw new UnauthorizedException('Conflicting tenant identifiers');
    }

    request.tenantId = tenantId;
    return true;
  }
}
