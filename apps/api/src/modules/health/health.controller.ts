import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
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
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
