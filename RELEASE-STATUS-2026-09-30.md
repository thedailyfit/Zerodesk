# ZEROdesk engineering release status

Updated 3 October 2026. Pro and Starter; release branch `codex/production-readiness-2026-09-30`.

## Decision and scope

The requested code improvements are implemented and the local engineering checks pass. This is a staging release candidate, not 100% production launch approval. The global database privilege boundary, live telephony acceptance and incomplete product features below remain launch gates. No production database migration, customer call or production deployment was performed.

Dashboard route names and existing style classes were retained. Handlers, types, error/status text and data sources changed. The existing Pro billing form gained a cash receipt field using its existing field styling. Authenticated visual parity has not been independently established.

## Verified scorecard

| Gate | Result | Evidence / qualification |
|---|---|---|
| Starter lint | PASS | `npm run lint -- --max-warnings 0`: zero errors and warnings |
| API, Pro web, Starter TypeScript | PASS | `npx tsc --noEmit` in all three workspaces |
| API tests | PASS | 173 tests, 39 suites; 3 October local JSON result |
| Python runtime | PASS | 18 pytest tests; installed dependency compatibility passes |
| Production builds | PASS | API build; Pro 81 routes; Starter 47 routes |
| Pro web lint | PASS WITH WARNINGS | Zero errors; 27 pre-existing hook/image warnings remain |
| Starter peer compatibility | PASS | Strict peer installation passed after tailwind-merge 3.4.0; HeroUI 3 uses styles, not the old theme package |
| Production dependency audit | PASS | No known vulnerabilities reported in either repository on 3 October |
| Remote CI | PASS | Pro, Python voice and Starter workflows all completed successfully at the source checkpoints below |
| Clean PostgreSQL migration chain | PASS IN CI | Deploy twice against isolated pgvector PostgreSQL 16 |
| Database policy/constraint tests | PASS IN CI | 35 tenant tables covered; non-owner cross-tenant read/write/delete denied; context reset; payment evidence and duplicate receipt checks |
| Application-wide RLS adoption | BLOCKED | Numerous global Prisma paths do not establish tenant-local context |
| Live Plivo / LiveKit acceptance | NOT RUN | Credentials exist per owner; real callback transport, SIP routing and controlled call still require verification |
| Launch decision | NO-GO | Passing builds and tests do not remove the hard gates below |

This is a gate-based scorecard. A percentage would obscure the unresolved security and operational requirements.

## Changes delivered

### 1. Starter typing, lint and persistence

Replaced explicit any in the targeted stores/API client with defined contracts and narrowing; escaped JSX text; removed unused imports and fixed hook dependencies. Fixed the Tailwind merge peer mismatch without downgrading HeroUI or changing styling. Removed npm configuration warnings. CI enforces zero-warning lint.

Customer, appointment, contact, invoice, service and team store mutations now await server results instead of presenting local success after failed requests. Unsupported service mutations report unavailable. Invoices begin unpaid unless verified payment evidence is recorded. Removed fabricated super-admin fallback totals and invented caller, duration, sentiment and pricing values in the touched flows. This does not certify every legacy dashboard as free of placeholders.

### 2. Durable follow-ups and Plivo

Added tenant-owned follow-up records with PENDING, DISPATCHED, COMPLETED, FAILED and UNREACHABLE states. Dispatch claims persist before external I/O. Duplicate request IDs do not place duplicate calls. Real Plivo request/call identifiers are stored; no invented UUID or fake LiveKit success is returned.

Signed V3 status and answer callbacks update persisted state, using canonicalization checked against the official Plivo SDK. Terminal statuses survive late ringing callbacks and callbacks arriving before the REST response. Missing configuration fails honestly. Ambiguous network delivery stays claimed for reconciliation; blindly retrying could call the customer twice. Starter polls server records across sessions and clears stale data on failed refresh.

Removed invented transfer/caller numbers from the reviewed voice paths. Anonymous calls are metered without merging them into a fabricated customer identity. Unit tests do not prove provider delivery or conversation quality.

### 3. Migrations, RLS and payment evidence

RLS is versioned in a deployable migration with explicit read and write tenant checks. The legacy SQL splitter that swallowed errors is disabled. The scoped Prisma service establishes transaction-local tenant context before model queries and prevents changing tenant ownership. A reproducible CI PostgreSQL harness deploys the full chain twice and exercises actual policies and constraints.

Historical PAID claims are preserved in legacy_paid_amount, moved to PAYMENT_REVIEW and excluded from verified paid balances. Positive payments require a manager-attested cash receipt with server-recorded verifier/time and a unique tenant-scoped receipt ID. Browser-supplied Stripe/Razorpay identifiers are not accepted as proof. The Pro cash billing flow now supplies receipt evidence. A production backup and reconciliation review are required before applying this migration.

### 4. Python voice runtime

Pinned the used LiveKit packages to 1.7.1 and test dependencies. The agent fetches tenant voice/model configuration and validates credentials before joining the room. Explicit bounded fallback settings prevent silent provider guessing. Added installed-SDK constructor and startup contract tests and a dedicated Python CI workflow.

### 5. Logging and release verification

Removed runtime customer/provider/error payloads from application Logger/console arguments, retaining static event descriptions. Disabled Prisma raw error stdout and guarded API startup errors. Added a source regression test preventing dynamic payload logging through the audited logging calls. Existing Sentry sanitation remains. Third-party infrastructure and live provider logs require separate operational review.

Updated production dependency pins, including DOMPurify 3.4.16, and removed tracked generated TypeScript build caches. Added migration, call-history, multipart and persistence regression gates to CI. Existing Pro hook/image and Sentry integration warnings remain visible; they were not silenced.

## Remaining implementation plan

### P0 - complete runtime database privilege separation

Owner: engineering and database operator. Approximately 28 module service files directly inject global PrismaService. Customer flows use TenantPrismaService; invoices, appointments, voice, conversations, knowledge, staff, support and automation still include global paths. A table owner bypasses RLS; a restricted role cannot run those tenant queries without context. Do not switch production DATABASE_URL to a restricted role and assume the whole application will work.

Inventory each tenant request, background job and administrative query. Move tenant work into scoped transactions; give global administration an explicit separately restricted connection and authorization boundary. Preserve existing transactions and idempotency. Test all five tenant CRUD operations, joins, jobs, websockets and cross-tenant IDs under the actual non-owner application role. Acceptance: no tenant path needs owner/BYPASSRLS privileges and two-tenant end-to-end tests pass. This is engineering work, not merely an owner credential task.

### P0 - verify provider lifecycle on staging

Owner: engineering with controlled test recipients. Set the correct public HTTPS API_URL, active tenant voice configuration, Plivo caller ID, LiveKit SIP/dispatch settings and model credentials. Place one explicitly controlled call; verify request ID, answer callback, actual call UUID, terminal status, recording/usage, handoff and missed-call behavior. Replay signed callbacks and simulate timeout without creating duplicate calls. Document manual reconciliation for a claimed PENDING dispatch. Existing Plivo accounts do not establish these runtime outcomes.

### P0 - safely roll out financial/schema changes

Owner: database operator and finance owner. Back up and restore an isolated copy, compare any db-push-era schema with the historical baseline, rehearse the additive migration and reconcile every PAYMENT_REVIEW invoice against real receipts. Do not remove migration history, run db push, blindly mark migrations applied or fabricate receipt IDs. Retain legacy claims for audit. Online invoice payments require provider-verified capture/webhook integration before exposing paid status for Stripe/Razorpay.

### P1 - close or explicitly gate incomplete capabilities

Owner: engineering/product. Implement supported service update/delete/status endpoints or clearly retain those controls as unavailable. Complete native campaign/workflow scheduling and action-completion reconciliation, provider-dependent Starter billing/security/API-key/notification controls, production webchat lifecycle and remaining placeholder metrics. Re-audit the exact niche/plan features promised to the first clients; the five workstreams do not prove all dashboard capabilities are finished.

### P1 - finish operational acceptance

Owner: engineering/operations. Run authenticated Starter/Pro/super-admin browser checks with two organizations and all roles; invitation/revocation, RAG isolation, automation retries and billing replay. Verify backup restore, load/soak for the expected 20-30 clients, alerts and support escalation. Address Pro's 27 lint warnings and Sentry setup warnings with regression checks. Review actual stdout, infrastructure logs and stored data for PII/mock artifacts.

## Owner actions

1. Provide staging accounts/access through the hosting secret store, not chat; designate controlled call recipients.
2. Approve backup/restore and historical invoice reconciliation before production migration.
3. Confirm active tenant models, voice routing, escalation destinations, Redis/TypeSafe configuration and operational alert recipients.
4. Configure Meta approved templates later as planned. Until then, do not promise WhatsApp business-initiated or OTP-template delivery; provider restrictions still apply.
5. Approve niche content, consent/retention, service prices/taxes and the exact capabilities offered at launch.
6. Approve public launch only after the P0 engineering and live acceptance gates pass. No 100% launch certificate is issued by this report.

## Evidence

Pro source checkpoint: 5885bcf3f09c083c2850acbd2d2478b967e29903.
Starter source checkpoint: 21bccacb9b12d4ccd7b84c0506e16a4929ac4d6b.
Pro CI: https://github.com/thedailyfit/Zerodesk/actions/runs/37121334362
Voice CI: https://github.com/thedailyfit/Zerodesk/actions/runs/37121334401
Starter CI: https://github.com/thedailyfit/0desk-starter/actions/runs/37121402164

Local test evidence: ZEROdesk-Audit-Report/final-audit/release-oct3-tests.json. Source entrypoints: apps/api/prisma/MIGRATION-ROLLOUT.md; scripts/verify-migration-database.cjs; apps/api/src/prisma/tenant-prisma.service.ts; apps/api/src/modules/voice/plivo-callback.spec.ts; apps/voice-agent/tests/test_runtime_contract.py; Starter scripts/verify-store-persistence.cjs.

Reference: PostgreSQL row security https://www.postgresql.org/docs/current/ddl-rowsecurity.html ; Plivo V3 https://www.plivo.com/docs/voice/concepts/signature-validation ; official signature implementation https://raw.githubusercontent.com/plivo/plivo-node/master/lib/utils/v3Security.js .
