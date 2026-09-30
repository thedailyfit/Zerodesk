import { Injectable, OnModuleInit, OnModuleDestroy, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client!: Redis;
  private isConnected = false;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const redisUrl = this.configService.get<string>('REDIS_URL') || 'redis://localhost:6379';
    this.client = new Redis(redisUrl, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      retryStrategy: (times) => {
        if (times > 3) {
          this.logger.warn('Redis offline: Operating in graceful fallback mode.');
          return null; // Stop retrying
        }
        return Math.min(times * 200, 1000);
      },
    });

    this.client.on('error', (err) => {
      this.isConnected = false;
      this.logger.warn(`Redis connection unavailable (${err.message}). Fallback active.`);
    });

    this.client.on('connect', () => {
      this.isConnected = true;
      this.logger.log('Redis Client Connected');
    });

    // Attempt non-blocking initial connection
    this.client.connect().catch((err) => {
      this.logger.warn(`Redis initial connect failed: ${err.message}. Operating in fallback mode.`);
    });
  }

  onModuleDestroy() {
    if (this.client) {
      this.client.disconnect();
    }
  }

  async get(key: string): Promise<string | null> {
    if (!this.isConnected) return null;
    try {
      return await this.client.get(key);
    } catch {
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<'OK' | null> {
    if (!this.isConnected) return null;
    try {
      if (ttlSeconds) {
        return await this.client.set(key, value, 'EX', ttlSeconds);
      }
      return await this.client.set(key, value);
    } catch {
      return null;
    }
  }

  async setNx(key: string, value: string, ttlSeconds: number): Promise<boolean> {
    if (!this.isConnected) throw new ServiceUnavailableException('Coordination storage unavailable');
    try {
      const res = await this.client.set(key, value, 'EX', ttlSeconds, 'NX');
      return res === 'OK';
    } catch {
      throw new ServiceUnavailableException('Coordination storage unavailable');
    }
  }

  async del(key: string): Promise<number> {
    if (!this.isConnected) return 0;
    try {
      return await this.client.del(key);
    } catch {
      return 0;
    }
  }

  async ping(): Promise<string> {
    if (!this.isConnected) return 'offline';
    try {
      return await this.client.ping();
    } catch {
      return 'error';
    }
  }

  async consumeOtp(key: string, candidateHash: string): Promise<boolean> {
    if (!this.isConnected) return false;
    try {
      return await this.client.eval(`
        local value = redis.call('GET', KEYS[1])
        if not value then return 0 end
        local attempts = redis.call('INCR', KEYS[2])
        if attempts == 1 then redis.call('EXPIRE', KEYS[2], 300) end
        if attempts > 5 then redis.call('DEL', KEYS[1]); return 0 end
        if value ~= ARGV[1] then return 0 end
        redis.call('DEL', KEYS[1], KEYS[2])
        return 1
      `, 2, key, key + ':attempts', candidateHash) === 1;
    } catch { return false; }
  }
}
