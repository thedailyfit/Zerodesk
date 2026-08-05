import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { RedisService } from '../../modules/redis/redis.service';

@Injectable()
export class IdempotencyGuard implements CanActivate {
  private readonly logger = new Logger(IdempotencyGuard.name);

  constructor(private readonly redisService: RedisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Extract unique message/event ID from common webhook patterns
    const messageId =
      request.headers['x-whatsapp-message-id'] ||
      request.headers['x-vapi-message-id'] ||
      request.headers['x-request-id'] ||
      request.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.id ||
      request.body?.message?.id ||
      request.body?.id ||
      request.body?.call?.id;

    if (!messageId) {
      // If no unique ID is found, allow request to proceed without locking
      return true;
    }

    const lockKey = `idempotency:${messageId}`;
    const ttlSeconds = 600; // Lock for 10 minutes

    // Attempt to set key only if it doesn't already exist (NX)
    const acquiredLock = await this.redisService.setNx(lockKey, 'processing', ttlSeconds);

    if (!acquiredLock) {
      this.logger.warn(`Duplicate webhook blocked by IdempotencyGuard: Key=${messageId}`);
      // Returning false drops duplicate webhook requests from Meta/Vapi retries
      return false;
    }

    return true;
  }
}
