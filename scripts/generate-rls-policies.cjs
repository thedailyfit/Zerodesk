// Keep the reviewed standalone policy and deployable migration identical.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const schema = fs.readFileSync(path.join(root, 'apps/api/prisma/schema.prisma'), 'utf8');
const tables = [...schema.matchAll(/model \w+ \{([\s\S]*?)\n\}/g)]
  .filter(([, body]) => /\btenantId\s+String/.test(body))
  .map(([, body]) => body.match(/@@map\("(\w+)"\)/)[1]);
const sql = '-- Tenant role policies. The migration/administration role remains privileged.\n' +
  '-- Never grant the tenant application role table ownership, SUPERUSER or BYPASSRLS.\n' +
  tables.map(table => `ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY;
${table === 'outbound_follow_ups' ? 'DROP POLICY IF EXISTS tenant_isolation ON "outbound_follow_ups";\n' : ''}DROP POLICY IF EXISTS tenant_isolation_${table} ON "${table}";
CREATE POLICY tenant_isolation_${table} ON "${table}" FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);
`).join('\n');
const migration = path.join(root, 'apps/api/prisma/migrations/20261001000004_tenant_rls');
fs.mkdirSync(migration, { recursive: true });
fs.writeFileSync(path.join(migration, 'migration.sql'), sql);
fs.writeFileSync(path.join(root, 'apps/api/prisma/migrations/rls_policies.sql'), sql);
console.log(`Generated strict policies for ${tables.length} tenant tables`);
