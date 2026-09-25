import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class RetellSignatureGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const secret = process.env.RETELL_WEBHOOK_SECRET;
    if (process.env.NODE_ENV === 'production' && !secret) {
      throw new UnauthorizedException('Retell webhook secret not configured in production');
    }

    if (!secret) {
      return true;
    }

    const req = context.switchToHttp().getRequest();
    const signature = req.headers['x-retell-signature'];
    if (!signature) {
      throw new UnauthorizedException('Missing Retell Signature');
    }

    const bodyStr = req.rawBody?.toString() || JSON.stringify(req.body);
    const hash = crypto.createHmac('sha256', secret).update(bodyStr).digest('hex');
    const signatureBuf = Buffer.from(signature, 'utf8');
    const hashBuf = Buffer.from(hash, 'utf8');

    if (signatureBuf.length !== hashBuf.length || !crypto.timingSafeEqual(signatureBuf, hashBuf)) {
      throw new UnauthorizedException('Invalid Retell Signature');
    }

    return true;
  }
}
