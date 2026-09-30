import { sanitizeTelemetry } from '@zerodesk/shared';
it('removes canary secrets and customer payloads from telemetry', () => {
  const event = { request: { token: 'CANARY' }, extra: { phone: 'CANARY' }, message: 'CANARY', exception: { values: [{ value: 'CANARY', stacktrace: { frames: [{ filename: '/user/app.ts?token=CANARY', vars: { key: 'CANARY' } }] } }] } };
  expect(JSON.stringify(sanitizeTelemetry(event))).not.toContain('CANARY');
});
