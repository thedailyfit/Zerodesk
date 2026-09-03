import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

@Controller()
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  @Get()
  getRoot() {
    return {
      name: 'ZeroDesk AI API',
      status: 'online',
      version: '1.0.0',
      health: '/v1/health',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('health')
  async check() {
    let dbStatus = 'down';
    let redisStatus = 'down';

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      dbStatus = 'up';
    } catch (e: any) {
      dbStatus = `down: ${e.message}`;
    }

    try {
      await this.redis.ping();
      redisStatus = 'up';
    } catch (e: any) {
      redisStatus = `down: ${e.message}`;
    }

    const memory = process.memoryUsage();
    const isHealthy = dbStatus === 'up';

    const healthData = {
      status: isHealthy ? 'ok' : 'degraded',
      services: {
        database: dbStatus,
        redis: redisStatus,
      },
      system: {
        uptimeSeconds: Math.floor(process.uptime()),
        memoryHeapUsedMB: Math.round(memory.heapUsed / 1024 / 1024),
      },
      timestamp: new Date().toISOString(),
    };

    if (!isHealthy && process.env.NODE_ENV === 'production') {
      throw new ServiceUnavailableException(healthData);
    }

    return healthData;
  }

  @Get('sentry-debug')
  getError() {
    throw new Error('Sentry Backend Test Error!');
  }
}
