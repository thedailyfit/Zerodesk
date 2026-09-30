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
    await expect(controller.check()).rejects.toMatchObject({ status: 503 });
  });

  it('should report redis down when ping returns offline', async () => {
    mockRedis.ping = jest.fn().mockResolvedValue('offline');
    await expect(controller.check()).rejects.toMatchObject({ status: 503 });
  });

  it('keeps liveness independent of unavailable dependencies', () => {
    expect(controller.live()).toEqual({ status: 'ok' });
    expect(mockPrisma.$queryRaw).not.toHaveBeenCalled();
    expect(mockRedis.ping).not.toHaveBeenCalled();
  });

  it('rejects readiness during startup rather than routing into an unavailable queue', async () => {
    const uptime = jest.spyOn(process, 'uptime').mockReturnValue(1);
    mockRedis.ping.mockResolvedValue('error');
    try {
      await expect(controller.check()).rejects.toMatchObject({ status: 503 });
    } finally {
      uptime.mockRestore();
    }
  });
});
