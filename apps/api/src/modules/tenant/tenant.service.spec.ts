import { TenantService } from './tenant.service';

describe('Public tenant settings', () => {
  it('does not expose private integrations or AI settings through the booking lookup', async () => {
    const service = new TenantService({ tenant: { findUnique: jest.fn().mockResolvedValue({ id: 'tenant-1', settings: { phone: '123', branding: { color: 'blue' }, apiKey: 'private', llmSettings: { secret: 'private' } } }) } } as any);
    const result = await service.findBySlug('public');
    expect(result.settings).toEqual({ phone: '123', branding: { color: 'blue' } });
  });
});
