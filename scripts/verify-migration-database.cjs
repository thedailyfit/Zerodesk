// Destructive test setup is restricted to a dedicated, empty release-check database.
const assert = require('node:assert/strict');
const path = require('node:path');
const { migrate } = require('./apply-production-migration');
const { PrismaClient } = require(require.resolve('@prisma/client', { paths: [path.resolve(__dirname, '../apps/api')] }));
async function verify() {
  for (const key of ['DATABASE_URL', 'DIRECT_URL']) {
    assert.equal(new URL(process.env[key]).pathname, '/zerodesk_release_check', 'Use an isolated zerodesk_release_check database only');
  }
  const db = new PrismaClient();
  try {
    const existing = await db.$queryRaw`SELECT count(*)::int AS count FROM information_schema.tables WHERE table_schema='public'`;
    assert.equal(existing[0].count, 0, 'Migration verification requires an empty database');
    migrate({ ...process.env, MIGRATION_BASELINE_VERIFIED: 'true' });
    migrate({ ...process.env, MIGRATION_BASELINE_VERIFIED: 'true' });
    const missing = await db.$queryRaw`SELECT c.table_name FROM information_schema.columns c
      JOIN pg_class t ON t.relname=c.table_name JOIN pg_namespace n ON n.oid=t.relnamespace
      WHERE c.table_schema='public' AND n.nspname='public' AND c.column_name='tenant_id'
      AND (NOT t.relrowsecurity OR NOT EXISTS (SELECT 1 FROM pg_policy p WHERE p.polrelid=t.oid AND p.polqual IS NOT NULL AND p.polwithcheck IS NOT NULL))`;
    assert.deepEqual(missing, [], 'Every tenant table requires read and write policies');
    await db.$executeRawUnsafe('CREATE ROLE zerodesk_rls_test NOLOGIN NOSUPERUSER NOBYPASSRLS');
    await db.$executeRawUnsafe('GRANT USAGE ON SCHEMA public TO zerodesk_rls_test');
    await db.$executeRawUnsafe('GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO zerodesk_rls_test');
    const a = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    const b = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
    for (const id of [a, b]) {
      await db.tenant.create({ data: { id, clerkOrgId: id, name: 'RLS test', slug: id, industry: 'test' } });
      await db.customer.create({ data: { tenantId: id, name: 'RLS test' } });
    }
    await db.$transaction(async tx => {
      await tx.$executeRawUnsafe('SET LOCAL ROLE zerodesk_rls_test');
      assert.equal((await tx.customer.findMany()).length, 0, 'Missing tenant must deny reads');
      await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${a}, true)`;
      const rows = await tx.customer.findMany();
      assert.equal(rows.length, 1);
      assert.equal(rows[0].tenantId, a);
      assert.equal((await tx.customer.updateMany({ where: { tenantId: b }, data: { name: 'blocked' } })).count, 0);
      assert.equal((await tx.customer.deleteMany({ where: { tenantId: b } })).count, 0);
    });
    await db.$transaction(async tx => {
      await tx.$executeRawUnsafe('SET LOCAL ROLE zerodesk_rls_test');
      assert.equal((await tx.customer.findMany()).length, 0, 'Tenant context must not leak beyond its transaction');
    });
    await assert.rejects(db.$transaction(async tx => {
      await tx.$executeRawUnsafe('SET LOCAL ROLE zerodesk_rls_test');
      await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${a}, true)`;
      await tx.customer.create({ data: { tenantId: b, name: 'blocked' } });
    }), /row.level security/i);
    await assert.rejects(db.invoice.create({ data: { tenantId: a, invoiceNumber: 'NO-EVIDENCE', subtotal: 10, totalAmount: 10, paidAmount: 10, status: 'PAID' } }), /constraint/i);
    await assert.rejects(db.invoice.create({ data: {
      tenantId: a, invoiceNumber: 'NULL-METHOD', subtotal: 10, totalAmount: 10,
      paidAmount: 10, status: 'PAID', manualCashReceiptId: 'receipt-null-method',
      paymentVerifiedBy: 'test-manager', paymentVerifiedAt: new Date(),
    } }), /constraint/i);
    await db.invoice.create({ data: {
      tenantId: a, invoiceNumber: 'VALID-CASH', subtotal: 10, totalAmount: 10,
      paidAmount: 10, status: 'PAID', paymentMethod: 'CASH', manualCashReceiptId: 'receipt-verified',
      paymentVerifiedBy: 'test-manager', paymentVerifiedAt: new Date(),
    } });
    await assert.rejects(db.invoice.create({ data: {
      tenantId: a, invoiceNumber: 'DUPLICATE-RECEIPT', subtotal: 10, totalAmount: 10,
      paidAmount: 10, status: 'PAID', paymentMethod: 'CASH', manualCashReceiptId: 'receipt-verified',
      paymentVerifiedBy: 'test-manager', paymentVerifiedAt: new Date(),
    } }), /unique constraint/i);
    console.log('PASS: clean migration deployment twice; all tenant policies; cross-tenant read/write denial; payment evidence constraint');
  } finally { await db.$disconnect(); }
}
verify().catch(() => { console.error('Migration/RLS integration verification failed; inspect isolated database locally'); process.exitCode = 1; });
