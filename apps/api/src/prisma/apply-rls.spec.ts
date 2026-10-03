import { applyRls } from './apply-rls';

it('refuses legacy partial RLS application and directs operators to reviewed migrations', async () => {
  await expect(applyRls()).rejects.toThrow('scripts/apply-production-migration.js');
});
