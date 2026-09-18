import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WebhookReceiver } from 'livekit-server-sdk';
import * as crypto from 'crypto';

@Injectable()
export class LiveKitSipGuard implements CanActivate {
  private readonly logger = new Logger(LiveKitSipGuard.name);
  private receiver: WebhookReceiver | null = null;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('LIVEKIT_API_KEY');
    const apiSecret = this.configService.get<string>('LIVEKIT_API_SECRET');
    if (apiKey && apiSecret) {
      this.receiver = new WebhookReceiver(apiKey, apiSecret);
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const headers = request.headers || {};
    const authHeader = headers['authorization'];
    
    // 1. Try LiveKit Webhook HMAC verification if LiveKit signature present
    if (this.receiver && authHeader && !headers['x-internal-voice-key']) {
      try {
        const rawBody = request.rawBody?.toString() || JSON.stringify(request.body || {});
        await this.receiver.receive(rawBody, authHeader);
        return true;
      } catch (err) {
        this.logger.debug(`LiveKit HMAC verification failed, testing alternative credentials: ${err}`);
      }
    }

    // 2. Secret check for internal callers or direct secret dispatches
    const expectedSecret = this.configService.get<string>('LIVEKIT_SIP_WEBHOOK_SECRET') || 
                           this.configService.get<string>('INTERNAL_VOICE_SECRET');
    const providedSecret = headers['x-livekit-secret'] || 
                           headers['x-internal-voice-key'] || 
                           authHeader?.replace(/^Bearer\s+/i, '');

    const enforceSecret = this.configService.get<boolean>('ENFORCE_SIP_WEBHOOK_SECRET', true);
    if (expectedSecret && (enforceSecret || process.env.NODE_ENV === 'production')) {
      if (!providedSecret || typeof providedSecret !== 'string') {
        this.logger.warn('LiveKit SIP dispatch webhook rejected: Missing authorization secret');
        throw new UnauthorizedException('Invalid LiveKit SIP webhook credentials');
      }
      const provBuf = Buffer.from(providedSecret);
      const expBuf = Buffer.from(expectedSecret);
      if (provBuf.length !== expBuf.length || !crypto.timingSafeEqual(provBuf, expBuf)) {
        this.logger.warn('LiveKit SIP dispatch webhook rejected: Invalid authorization secret');
        throw new UnauthorizedException('Invalid LiveKit SIP webhook credentials');
      }
    }

    // 3. Validate payload has basic telephony structure
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
