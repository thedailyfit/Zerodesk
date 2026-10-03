# Migration rollout

The historical baseline is generated from `f8fe9f46251f0ea0d1ed38935479d50eb7021fc2`; `baseline.prisma` records that schema. It is not evidence that an existing database matches it.

1. Take a database backup and prove restoration to an isolated database. Install the `vector` and `uuid-ossp` extensions with an administrator where necessary.
2. On a fresh empty staging database, apply the complete migration chain. On an existing database without Prisma migration history, compare its schema with `baseline.prisma` first. Investigate every difference. Only when equivalence has been demonstrated, mark `00000000000000_baseline` applied using `prisma migrate resolve --applied 00000000000000_baseline`. Do not execute the baseline DDL on populated tables.
3. Verify which incremental migrations are already present. Do not mark them applied based only on matching names. Review the invoice historical PAID backfill against payment records.
4. Use `MIGRATION_BASELINE_VERIFIED=true` with `pnpm db:migrate:prod` only after this review. The script requires both database URLs and stops on failure. Never run `db push` as a substitute for production migration history.
5. RLS is applied by `20261001000004_tenant_rls`; `rls_policies.sql` is its identical review copy. Test isolation using the actual application role. It must have NOSUPERUSER/NOBYPASSRLS and must not own tenant tables. Scoped TenantPrismaService calls set the tenant with transaction-local `set_config(..., true)` before queries (the parameterized equivalent of SET LOCAL). PostgreSQL owners and BYPASSRLS roles still bypass policies. Existing global/background Prisma paths require a separately reviewed privileged connection; global RLS enforcement remains a deployment gate until those paths and grants are verified.
6. Rehearse API/worker startup, booking concurrency, workflow run persistence and webhook replay. Deploy additive schema changes before dependent application changes. Retain schema/data during application rollback; restore only under an approved recovery procedure.

Local generation and unit tests do not complete any database-dependent step above.

## Automated clean-database gate

CI starts an isolated pgvector PostgreSQL 16 service and runs `node scripts/verify-migration-database.cjs`. It requires an empty database named `zerodesk_release_check`. It deploys twice, checks policy coverage, exercises cross-tenant reads/writes under a non-owner role, and rejects paid invoices without evidence. Never point this test at production.

## Payment reconciliation

The historical migration is unchanged to preserve checksums. The additive evidence migration preserves prior claims in `legacy_paid_amount`, resets unverified balances to zero, and marks affected invoices `PAYMENT_REVIEW`. A manager must verify a cash receipt and record its unique tenant-scoped ID before restoring a paid amount. Browser-supplied Stripe/Razorpay IDs are not proof and are rejected until provider-verified invoice payments are integrated. Review these records before billing resumes. Rollback must retain the evidence constraint and must not repeat the historical backfill.
