import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;
  let mockPrisma: any;
  let mockRedis: any;

  beforeEach(() => {
    mockPrisma = {
      $queryRaw: jest.fn().mockResolvedValue([{ 1: 1 }]),
    };
    mockRedis = {
      ping: jest.fn().mockResolvedValue('PONG'),
    };
    controller = new HealthController(mockPrisma, mockRedis);
  });

  it('should return API root metadata', () => {
    const res = controller.getRoot();
    expect(res.name).toBe('ZeroDesk AI API');
    expect(res.status).toBe('online');
    expect(res.version).toBe('1.0.0');
    expect(res.health).toBe('/v1/health');
    expect(res.timestamp).toBeDefined();
  });

  it('should return ok health status when database and redis are up', async () => {
    const res = await controller.check();
    expect(res.status).toBe('ok');
    expect(res.services.database).toBe('up');
    expect(res.services.redis).toBe('up');
    expect(res.system.uptimeSeconds).toBeGreaterThanOrEqual(0);
    expect(res.timestamp).toBeDefined();
  });

  it('should report degraded status when database is down', async () => {
    mockPrisma.$queryRaw = jest.fn().mockRejectedValue(new Error('Connection failed'));
    const res = await controller.check();
    expect(res.status).toBe('degraded');
    expect(res.services.database).toContain('Connection failed');
  });
});
