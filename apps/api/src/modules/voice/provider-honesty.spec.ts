import { PlivoService } from './plivo.service';
import { InternalVoiceGuard } from '../../common/guards/internal-voice.guard';
import { AppointmentService } from '../appointment/appointment.service';

describe('provider and booking honesty', () => {
  it('does not invent inventory or purchases without credentials', async () => {
    const service = new PlivoService({ get: (_: string, fallback: string) => fallback } as any);
    await expect(service.searchNumbers()).rejects.toThrow('not configured');
    await expect(service.purchaseNumber('+919123456789')).rejects.toThrow('not configured');
    expect(service.generateInboundXml('+919123456789', 'tenant', 'https://api.example.com')).toContain('&amp;tenantId=');
  });
  it('rejects placeholder and conflicting internal tenant contexts', () => {
    const guard = new InternalVoiceGuard({ get: () => 'secret' } as any);
    for (const tenant of ['default', 'default_business', ['tenant']]) {
      expect(() => guard.canActivate({ switchToHttp: () => ({ getRequest: () => ({ headers: { 'x-internal-voice-key': 'secret', 'x-tenant-id': tenant } }) }) } as any)).toThrow();
    }
    expect(() => guard.canActivate({ switchToHttp: () => ({ getRequest: () => ({ headers: { 'x-internal-voice-key': 'secret', 'x-tenant-id': 'a' }, body: { tenantId: 'b' } }) }) } as any)).toThrow('Conflicting');
  });
});
