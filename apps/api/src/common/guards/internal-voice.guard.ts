import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class InternalVoiceGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const voiceKey = request.headers['x-internal-voice-key'];
    const expectedKey = this.configService.get<string>('INTERNAL_VOICE_SECRET');

    if (!expectedKey || !voiceKey || voiceKey !== expectedKey) {
      throw new UnauthorizedException('Missing or invalid internal voice worker credentials');
    }

    let tenantId = request.headers['x-tenant-id'] || request.body?.tenantId || request.query?.tenantId;
    if (!tenantId) {
      throw new UnauthorizedException('Missing x-tenant-id header or tenantId parameter for voice operation');
    }

    if (tenantId === 'default_business' || tenantId === 'default') {
      tenantId = '08f1fadd-59eb-4d07-9ee3-65a2d9a321e3';
    }

    request.tenantId = tenantId;
    return true;
  }
}
