# ZEROdesk release status - 30 September 2026

## Decision

Engineering remediation is substantially improved, but this is a **review/staging candidate, not a production launch certificate**. The source is pushed on `codex/production-readiness-2026-09-30`. Do not merge/deploy without the acceptance gates below. Dashboard route names and styling were preserved; handlers, data sources, status text and validation changed.

## Implemented in this continuation

- Tenant-timezone booking with DST ambiguity rejection, PostgreSQL serialization, active-slot conflict checks and mandatory public OTP.
- OTP delivery requires a provider receipt; hashed expiring codes use atomic Redis consumption with attempt limits. Coordination outages throw instead of being acknowledged as duplicate success.
- AI channel settings validate against the active model registry and reach chat and new voice calls. Voice fails closed without verified configuration. Provider fallback uses the correct provider-specific model and bounded timeout.
- Shared voice instructions reach the runtime. Fake fixed model latencies and operational status claims were removed.
- Tenant settings use a row-locked merge. Knowledge upload size/type/header and extracted-text limits were added.
- Durable automation dispatch claims retain definition snapshots and suppress duplicate/uncertain retries; request/run status is explicit. Adapter acceptance is not delivery confirmation.
- Production semantic-policy outage rejects actions/unscreened RAG passages. Sentry sanitation drops common customer payload fields and exception text; the Next server/edge initialization is wired.
- Historical database baseline, additive automation-run migration and rollout instructions were added. Queue package compatibility and current production dependency advisories were addressed.
- Earlier audit fixes for invoice integrity, tenant browser isolation, billing receipts, RAG publication, readiness, super-admin and provider truthfulness are included in the same reviewed working-tree release.

## Your required account/environment tasks

1. Supply or identify staging deployment access and controlled test accounts for two organizations, each required role, and both plans. Do not send secrets in chat; configure the hosting secret store.
2. Follow `apps/api/prisma/MIGRATION-ROLLOUT.md`: backup/restore, verify the historical baseline, apply additive migrations on staging, confirm application-role RLS and concurrency. No live database migration was performed here.
3. Register actual supported AI models in super-admin, configure provider credentials, then explicitly enable tenant AI channels and voice configuration. Missing settings now disable execution; this intentional safety change needs tenant rollout preparation.
4. Configure TypeSafe policy credentials and test latency/outage behavior. Production semantic policy is fail-closed. Verify Redis availability and readiness routing.
5. Complete telephony/KYC/provider approvals, WhatsApp credentials and approved authentication templates where required. Current OTP free-text sending is subject to WhatsApp messaging-window rules; it fails honestly when the provider refuses it. Prove OTP and invitation delivery with controlled recipients.
6. Configure trusted n8n routes with tenant/run identifiers and a reconciliation procedure. A native arbitrary graph/campaign scheduler is not completed by the dispatch adapter.
7. Review the credential-shaped literal redacted from the older tracked HTML report. If it was a real credential, rotate it: removing current text does not remove Git history. Starter's tracked environment file was reviewed as containing public API URL/publishable Clerk configuration, not a server secret.
8. Approve niche content, escalation numbers, consent/retention policy, payment/tax assumptions, support addresses and operating coverage.
9. Run signed provider callback replay, billing reconciliation, invitation revocation, cross-tenant browser/socket tests, load/soak and restore drills at the exact proposed release commit.

## Engineering work still incomplete

- Native arbitrary graph semantics and full campaign audience/schedule/action-completion processing; adapter dispatch is a narrower implemented capability.
- Durable cross-device follow-up lifecycle with provider completion reconciliation.
- Starter provider-dependent billing/security/API-key/notification controls and complete production webchat embed lifecycle.
- Full Python dependency lock and installed LiveKit integration suite; only dependency-free runtime configuration tests and syntax validation were run for new Python logic.
- Complete runtime log redaction and production data/old seed cleanup verification; the Sentry policy is not all-sink privacy certification.
- Clean remote CI, real database migration/RLS, authenticated browser parity and live operational acceptance.

These engineering gaps are not tasks that merely adding credentials will solve. No 100% readiness claim is made.
