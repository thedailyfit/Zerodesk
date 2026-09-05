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

    const tenantId = request.headers['x-tenant-id'] || request.body?.tenantId;
    if (!tenantId) {
      throw new UnauthorizedException('Missing x-tenant-id header for voice operation');
    }

    request.tenantId = tenantId;
    return true;
  }
}
