# Migration rollout

The historical baseline is generated from `f8fe9f46251f0ea0d1ed38935479d50eb7021fc2`; `baseline.prisma` records that schema. It is not evidence that an existing database matches it.

1. Take a database backup and prove restoration to an isolated database. Install the `vector` and `uuid-ossp` extensions with an administrator where necessary.
2. On a fresh empty staging database, apply the complete migration chain. On an existing database without Prisma migration history, compare its schema with `baseline.prisma` first. Investigate every difference. Only when equivalence has been demonstrated, mark `00000000000000_baseline` applied using `prisma migrate resolve --applied 00000000000000_baseline`. Do not execute the baseline DDL on populated tables.
3. Verify which incremental migrations are already present. Do not mark them applied based only on matching names. Review the invoice historical PAID backfill against payment records.
4. Use `MIGRATION_BASELINE_VERIFIED=true` with `pnpm db:migrate:prod` only after this review. The script requires both database URLs and stops on failure. Never run `db push` as a substitute for production migration history.
5. Test tenant isolation using the actual application database role. The standalone `rls_policies.sql` file is not automatically applied by Prisma. Review its role/session assumptions before applying; background/global services need an explicitly designed privilege boundary.
6. Rehearse API/worker startup, booking concurrency, workflow run persistence and webhook replay. Deploy additive schema changes before dependent application changes. Retain schema/data during application rollback; restore only under an approved recovery procedure.

Local generation and unit tests do not complete any database-dependent step above.
