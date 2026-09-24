import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class WhatsAppSignatureGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    if (process.env.NODE_ENV !== 'production') {
      return true;
    }

    const req = context.switchToHttp().getRequest();
    const signature = req.headers['x-hub-signature-256'];
    if (!signature) {
      throw new UnauthorizedException('Missing WhatsApp Signature');
    }

    const secret = process.env.WHATSAPP_APP_SECRET;
    if (!secret) {
      throw new UnauthorizedException('Server configuration error: WHATSAPP_APP_SECRET missing in production');
    }

    const bodyStr = req.rawBody?.toString() || JSON.stringify(req.body);
    const hash = crypto.createHmac('sha256', secret).update(bodyStr).digest('hex');
    const expected = `sha256=${hash}`;

    const sigBuf = Buffer.from(signature, 'utf8');
    const expBuf = Buffer.from(expected, 'utf8');

    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      throw new UnauthorizedException('Invalid WhatsApp Signature');
    }

    return true;
  }
}
