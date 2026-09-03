import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
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
    if (!this.isConnected) return true; // Allow operation if Redis offline
    try {
      const res = await this.client.set(key, value, 'EX', ttlSeconds, 'NX');
      return res === 'OK';
    } catch {
      return true;
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
}
