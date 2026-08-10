import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(() => {
    controller = new HealthController();
  });

  it('should return API root metadata', () => {
    const res = controller.getRoot();
    expect(res.name).toBe('ZeroDesk AI API');
    expect(res.status).toBe('online');
    expect(res.version).toBe('1.0.0');
    expect(res.health).toBe('/v1/health');
    expect(res.timestamp).toBeDefined();
  });

  it('should return ok health status', () => {
    const res = controller.check();
    expect(res.status).toBe('ok');
    expect(res.timestamp).toBeDefined();
  });
});
