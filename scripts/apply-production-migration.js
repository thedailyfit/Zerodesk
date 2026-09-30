const { spawnSync } = require('node:child_process');
const path = require('node:path');

// Existing db-push installations require a reviewed baseline first.
function migrate(env = process.env, run = spawnSync) {
  if (!env.DATABASE_URL || !env.DIRECT_URL) throw new Error('DATABASE_URL and DIRECT_URL are required');
  if (env.MIGRATION_BASELINE_VERIFIED !== 'true') {
    throw new Error('Review the existing database baseline and backup, then set MIGRATION_BASELINE_VERIFIED=true');
  }
  const cli = require.resolve('prisma/build/index.js', { paths: [path.resolve(__dirname, '../apps/api')] });
  const result = run(process.execPath, [cli, 'migrate', 'deploy', '--schema', path.resolve(__dirname, '../apps/api/prisma/schema.prisma')], { env, stdio: 'inherit' });
  if (result.error || result.status !== 0) throw new Error('Migration failed; release must stop');
  console.log('Reviewed migrations applied. Verify schema, policies and readiness before routing traffic.');
}
if (require.main === module) {
  try { migrate(); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
module.exports = { migrate };
