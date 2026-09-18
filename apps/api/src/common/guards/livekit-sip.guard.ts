import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LiveKitSipGuard implements CanActivate {
  private readonly logger = new Logger(LiveKitSipGuard.name);

  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const headers = request.headers || {};
    
    // Optional secret check if configured
    const expectedSecret = this.configService.get<string>('LIVEKIT_SIP_WEBHOOK_SECRET') || 
                           this.configService.get<string>('INTERNAL_VOICE_SECRET');
    const providedSecret = headers['x-livekit-secret'] || 
                           headers['x-internal-voice-key'] || 
                           headers['authorization']?.replace(/^Bearer\s+/i, '');

    // If a dedicated SIP webhook secret is set in environment, enforce it
    const enforceSecret = this.configService.get<boolean>('ENFORCE_SIP_WEBHOOK_SECRET', true);
    if (expectedSecret && (enforceSecret || process.env.NODE_ENV === 'production')) {
      if (!providedSecret || typeof providedSecret !== 'string') {
        this.logger.warn('LiveKit SIP dispatch webhook rejected: Missing authorization secret');
        throw new UnauthorizedException('Invalid LiveKit SIP webhook credentials');
      }
      const crypto = require('crypto');
      const provBuf = Buffer.from(providedSecret);
      const expBuf = Buffer.from(expectedSecret);
      if (provBuf.length !== expBuf.length || !crypto.timingSafeEqual(provBuf, expBuf)) {
        this.logger.warn('LiveKit SIP dispatch webhook rejected: Invalid authorization secret');
        throw new UnauthorizedException('Invalid LiveKit SIP webhook credentials');
      }
    }

    // Validate payload has basic telephony structure
    const body = request.body || {};
    const calledNumber = body.calledNumber || body.called_number || body.to;
    const sipCallId = body.sip_call_id || body.sipCallId;
    if (!calledNumber && !sipCallId) {
      this.logger.warn('LiveKit SIP dispatch webhook rejected: Missing called number or sip call id');
      throw new UnauthorizedException('Invalid SIP dispatch payload structure');
    }

    return true;
  }
}
