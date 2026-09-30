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

  @Get('health/live')
  live() {
    return { status: 'ok' };
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
      const pong = await this.redis.ping();
      redisStatus = pong === 'PONG' ? 'up' : `down: ${pong}`;
    } catch (e: any) {
      redisStatus = `down: ${e.message}`;
    }

    const memory = process.memoryUsage();
    const isHealthy = dbStatus === 'up' && redisStatus === 'up';

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

    // Readiness must not admit traffic until both required dependencies are ready.
    if (!isHealthy) {
      throw new ServiceUnavailableException(healthData);
    }

    return healthData;
  }

  @Get('sentry-debug')
  getError() {
    throw new Error('Sentry Backend Test Error!');
  }
}
