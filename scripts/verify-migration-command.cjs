const assert = require('node:assert/strict');
const { migrate } = require('./apply-production-migration');
let calls = 0;
assert.throws(() => migrate({}, () => { calls++; }), /required/);
assert.throws(() => migrate({ DATABASE_URL: 'test', DIRECT_URL: 'test' }, () => { calls++; }), /baseline/);
assert.equal(calls, 0);
const env = { DATABASE_URL: 'test', DIRECT_URL: 'test', MIGRATION_BASELINE_VERIFIED: 'true' };
assert.throws(() => migrate(env, () => ({ status: 1 })), /release must stop/);
migrate(env, (_, args) => {
  assert.deepEqual(args.slice(1, 3), ['migrate', 'deploy']);
  assert.ok(!args.includes('push'));
  return { status: 0 };
});
console.log('PASS: baseline gate, reviewed deployment, failure propagation; no database contacted');
