# ZEROdesk — Complete Company-Grade Forensic Audit Report

**Audit Date:** 2026-09-07
**Audit Type:** READ-ONLY FORENSIC
**Repository:** `C:\Users\Pc\Downloads\zerodesk` (Origin: github.com/thedailyfit/Zerodesk)
**Repository State:** UNCHANGED — Zero modifications performed

---

## TABLE OF CONTENTS

1. Executive Verdict
2. Project Architecture Map
3. Feature Reality Matrix
4. Top 25 Critical Findings
5. Major Mistakes
6. What Is Fake / Mock / Simulated / Disconnected
7. Security Findings
8. Multi-Tenancy Findings
9. AI / Voice / WhatsApp Findings
10. Data / Database Findings
11. Testing Gaps
12. Scalability Analysis
13. Cost / Unit Economics
14. Competitive Gaps
15. Product Gaps
16. GTM / Sales Readiness
17. Operational Readiness
18. Launch Blockers
19. Post-Launch Risks
20. Prioritized Action Plan
21. What Not to Build Yet
22. Top 10 Decisions for the Founder
23. Final Scorecard
24. Final CTO Verdict
25. Final Executive Summary

---

# SECTION 1 — EXECUTIVE VERDICT

## Is ZEROdesk production ready? **NO.**

It is a sophisticated, well-architected **internal alpha** — strong backend foundations, weak frontend integration, several critical security risks, and significant amounts of UI chrome built on mock data.

## Can it safely serve paying customers today? **NO.**

**Critical risks make this unsafe today:**
- Production API keys committed to git (OpenAI, LiveKit, Sarvam, ElevenLabs, R2)
- SIP dispatch fallback to first tenant in DB → cross-tenant data contamination
- LLM token usage never metered → unbounded customer AI costs
- `public-book` and `service/search` endpoints have no auth
- Invoice print window has stored XSS via `document.write`

## Can it be sold as self-serve SaaS? **NO.**

Cannot be self-serve because:
- 60+ dashboard routes, ~50 are mock/hardcoded
- No onboarding flow exists (`/onboarding` route is in middleware but no page implemented)
- Knowledge base "training" is a `setTimeout` simulation
- Voice/WhatsApp configuration UIs are completely decoupled from backend
- Real configuration requires engineering intervention

## Can it be sold as managed/concierge service? **MAYBE, WITH HEAVY WORK.**

A concierge model (where ZEROdesk team manually configures each customer) could work IF the critical P0s are addressed. Current backend has the bones; the missing piece is wiring and ops.

## Biggest Risk
**Tenant data isolation bypass via SIP fallback** — Unknown calls route to the first tenant in the DB, contaminating conversations, recordings, and customer records across tenants. This is an active data integrity bug, not a theoretical risk.

## Biggest Strength
**Comprehensive NestJS backend with strong tenant isolation patterns** — Guards, decorators, Prisma composite keys, request-scoped `tenantId` propagation. The architecture is sound in the design layer.

## Biggest Hidden Problem
**LLM tokens are never metered** — A single misbehaving customer can drive costs to $0 revenue ceiling since `llmTokensUsed` is never incremented. There is no cost protection in production.

## Most Important Decision
**Stop selling the current state. Decide whether to:**
1. Invest 60-90 days fixing the foundation (security + wiring) before any new sales
2. Pivot the product to a single-vertical internal alpha and validate with 1-3 hand-picked customers
3. Build a focused, hard-scoped MVP that ships in 30 days

---

# SECTION 2 — PROJECT ARCHITECTURE MAP

## Repository Structure
```
zerodesk/
├── apps/
│   ├── api/                  # NestJS 11 backend (25 modules)
│   ├── web/                  # Next.js 15 frontend (60+ dashboard routes)
│   ├── voice-agent/          # Python LiveKit voice agent (Fly.io)
│   └── desktop/              # Tauri desktop app (Tauri 1.0, largely empty)
├── packages/
│   └── shared/               # Shared TypeScript types
├── infra/
│   └── docker/               # docker-compose for local dev
├── scripts/                  # apply-production-migration, preflight-check, check-db-status
├── .env                      # ⚠️ Real API keys committed
├── apps/api/.env             # ⚠️ Real API keys committed
├── apps/voice-agent/.env     # ⚠️ Real API keys committed
├── apps/web/.env             # Same as root
├── Dockerfile                # API deployment
├── railway.json              # Railway config
├── turbo.json
├── pnpm-workspace.yaml
└── .github/workflows/ci.yml  # CI only (no deploy)
```

## Backend Module Map (apps/api/src)

| Module | Purpose | Real Backend? |
|---|---|---|
| `admin` | Super-admin control plane (tenants, voices, LLMs) | ✅ Real |
| `ai` | LLM orchestration | ✅ Real |
| `analytics` | KPI/rollup service | ✅ Real |
| `appointment` | Booking service | ✅ Real |
| `auth` | Clerk webhook handler | ✅ Real |
| `automation` | n8n workflow trigger | ✅ Real (basic) |
| `chat` | Socket.io WebSocket gateway | ✅ Real |
| `conversation` | Conversation/Message threads | ✅ Real |
| `crm` | Leads, pipeline, activities | ✅ Real |
| `customer` | Customer management | ✅ Real |
| `health` | Health check (DB+Redis) | ✅ Real |
| `invoice` | Invoicing | ✅ Real (no Stripe) |
| `knowledge-base` | RAG + embeddings | ✅ Real |
| `redis` | Redis service | ✅ Real |
| `service` | Service catalog | ✅ Real |
| `staff` | Staff management | ✅ Real |
| `storage` | Cloudflare R2 | ✅ Real |
| `tenant` | Tenant CRUD | ✅ Real |
| `voice` | Vapi + Retell + LiveKit + SIP | ✅ Real (with gaps) |
| `whatsapp` | Meta WhatsApp Cloud API | ✅ Real |
| `common/guards` | Auth, Tenant, Roles, Idempotency, InternalVoice | ✅ Real |

## Frontend Route Inventory

**60+ routes** in dashboard layout:
- **5 routes** actually call backend: `/book-appointment`, `/book/[slug]`, `/conversations`, `/unified-inbox`, `/appointments`
- **~50 routes** are mock/localStorage/hardcoded
- **Super-admin routes** (5): All from `useSuperAdminStore` (Zustand + localStorage)
- **`/onboarding`**: Middleware allows it but NO page exists

## Database
- PostgreSQL + pgvector (vector(1536))
- 21 models, all with `tenantId` on multi-tenant models
- Composite unique constraints `@@unique([id, tenantId])` on most
- RLS policies in separate `rls_policies.sql` (not in Prisma migration lifecycle)

## Deployment
- **API**: Railway (Dockerfile, no Railway secrets integration)
- **Voice Agent**: Fly.io (Mumbai, 1 shared CPU, 1GB RAM)
- **Web**: ❌ No deployment config found
- **CI**: GitHub Actions — typecheck + jest, no E2E, no deploy

---

# SECTION 3 — FEATURE REALITY MATRIX

| Feature | Status | Evidence | Production Ready |
|---|---|---|---|
| **Authentication (Clerk)** | A | `apps/api/src/common/guards/auth.guard.ts` | ✅ |
| **Multi-tenant DB schema** | A | `apps/api/prisma/schema.prisma` | ✅ |
| **TenantGuard enforcement** | A | `apps/api/src/common/guards/tenant.guard.ts` | ✅ |
| **Voice - Vapi webhooks** | B | `voice.service.ts:71-311` | ⚠️ Quota check works; function calls are stubs |
| **Voice - Retell webhooks** | F | `voice.service.ts:317-376` | ❌ No `retellPhoneNumber` field |
| **Voice - LiveKit integration** | B | `voice.service.ts:381-477` | ⚠️ Works; ignores tenant-assigned LLMs |
| **Voice - SIP dispatch** | F | `voice.service.ts:725-757` | ❌ **CRITICAL**: Falls back to first tenant |
| **Voice - Human transfer** | F | `voice.service.ts:262-264` | ❌ Returns "connecting you" message, no actual transfer |
| **Voice - STT proxy** | F | `voice.service.ts:228-233` | ❌ Configured but endpoint doesn't exist |
| **WhatsApp - Webhooks** | B | `whatsapp.service.ts:50-158` | ⚠️ Works in prod; sig check skipped in dev |
| **WhatsApp - Send message** | A | `whatsapp.service.ts:163-234` | ✅ |
| **WhatsApp - Quota metering** | A | `whatsapp.service.ts:225-228` | ✅ |
| **AI - Multi-provider LLM** | B | `llm.service.ts` | ⚠️ Voice uses it; others hardcode OpenAI |
| **AI - RAG knowledge base** | B | `rag.service.ts`, `embedding.service.ts` | ⚠️ Backend works; frontend uses localStorage |
| **AI - Token metering** | F | `subscription.llmTokensUsed` | ❌ **Never incremented anywhere** |
| **AI - Industry prompts** | F | `prompt.service.ts:86-102` | ❌ `getIndustryTemplate()` exists but is never called |
| **AI - Prompt guard** | B | `prompt-guard.service.ts` | ⚠️ Only applied to voice; bypassable via Unicode |
| **AI - Action validation** | F | `ai.service.ts:172-174` | ❌ `action.params` accepted unvalidated |
| **Bookings - public-book** | C | `appointment.controller.ts:40-50` | ⚠️ Works, but **no auth guard** |
| **Bookings - bookFromVoice** | B | `appointment.service.ts:61-178` | ⚠️ Tested partially |
| **CRM - Lead pipeline** | C | `lead.service.ts` | ⚠️ Backend works; frontend shows mock data |
| **Analytics - KPI dashboard** | F | `analytics.service.ts` | ❌ Returns **hardcoded** values |
| **Billing - Stripe** | F | `.env.example` lines 83-88 | ❌ **No Stripe webhook handler exists** |
| **Billing - Voice minutes** | A | `voice.service.ts:280-291` | ✅ |
| **Billing - WhatsApp messages** | A | `whatsapp.service.ts:225-228` | ✅ |
| **Storage - R2** | B | `storage.service.ts` | ⚠️ Path prefix check works, untested |
| **Inbox - Unified inbox** | B | `chat.gateway.ts`, `inbox-store.ts` | ⚠️ WebSocket works; errors silently swallowed |
| **Knowledge Base - RAG Test** | F | `apps/web/.../test-knowledge-base/page.tsx` | ❌ Shows hardcoded "98% Vector Similarity" |
| **Knowledge Base - Learn button** | F | `apps/web/.../knowledge-base/page.tsx` | ❌ `setTimeout(1800ms)` then success toast |
| **Voice UI - Live testing** | F | `apps/web/.../voice/page.tsx` | ❌ Orb animates; no microphone access |
| **WhatsApp UI - Connection status** | F | `apps/web/.../whatsapp/page.tsx` | ❌ Hardcoded "Connected" status |
| **Analytics UI** | F | `apps/web/.../analytics/page.tsx` | ❌ `Math.random()` on every render |
| **CRM UI** | F | `apps/web/.../crm/page.tsx` | ❌ `getDefaultLeads()` with random phone numbers |
| **Invoices UI** | B | `apps/web/.../invoices/page.tsx` | ⚠️ localStorage + XSS in print |
| **Appointments UI** | C | `apps/web/.../appointments/page.tsx` | ⚠️ Hardcoded defaults per niche |
| **Super-Admin UI** | F | `apps/web/.../super-admin/*` | ❌ Entirely from `useSuperAdminStore` |
| **Onboarding flow** | F | `middleware.ts` | ❌ No `/onboarding` page exists |
| **Public booking page** | B | `apps/web/.../book/[slug]/page.tsx` | ⚠️ Real API call; calendar hardcoded |

**Classification Summary:**
- **A (Production ready)**: ~8 features
- **B (Functional but risky)**: ~12 features
- **C (Partially implemented)**: ~10 features
- **D (Mock/simulation)**: ~25 features
- **E (Placeholder)**: ~5 features
- **F (Broken)**: ~15 features
- **G (Dead/unreachable)**: `salon` niche type
- **H (Unknown)**: Stripe billing

---

# SECTION 4 — TOP 25 CRITICAL FINDINGS

| # | Pri | Cat | Finding | Evidence | Impact | Recommendation |
|---|---|---|---|---|---|---|
| 1 | P0 | Security | **Real API keys in git-tracked `.env` files** | `apps/api/.env`, `apps/voice-agent/.env` | Anyone with repo access can rack up costs | Rotate ALL keys immediately |
| 2 | P0 | Multi-Tenancy | **SIP dispatch falls back to first tenant in DB** | `voice.service.ts:740` | Cross-tenant data contamination | Reject unknown callers; never use `findFirst()` as fallback |
| 3 | P0 | Security | **`public-book` endpoint has no auth** | `appointment.controller.ts:40-50` | Anyone can book on behalf of any tenant | Add auth or signed-token validation |
| 4 | P0 | Security | **`service/search` endpoint has no auth** | `service.controller.ts:17-25` | Tenant enumeration + data leak | Add `AuthGuard + TenantGuard` |
| 5 | P0 | Billing | **LLM tokens never metered** | `llmTokensUsed` schema field exists, never incremented | Unbounded customer costs | Implement token counting + `subscription.updateMany` |
| 6 | P0 | Security | **Stored XSS in invoice print** | `apps/web/src/app/(dashboard)/invoices/page.tsx:168-189` | Customer names + clinic info via `document.write` | Use `textContent` or DOM API, escape all user data |
| 7 | P0 | Security | **WhatsApp access tokens stored plaintext in DB** | `whatsappConfig.accessToken` in schema | DB compromise = all tenant WhatsApp accounts | Encrypt at rest using `CryptoService` |
| 8 | P0 | Voice | **Retell tenant resolution broken** | `voice.service.ts:593-599` only searches `vapiPhoneNumber` | Retell calls fail; metering broken | Add `retellPhoneNumber` field; query both fields |
| 9 | P0 | Voice | **Human transfer is theater** | `voice.service.ts:262-264` | Customer hears "connecting" but nothing happens | Implement actual Vapi/Retell transfer API call |
| 10 | P0 | Architecture | **`TenantPrismaService.forTenant()` exposes raw `prisma`** | `tenant-prisma.service.ts:46` | Future code can bypass tenant isolation | Remove raw `prisma` from return |
| 11 | P0 | AI | **Industry-specific prompts non-functional** | `prompt.service.ts:86-102` | All tenants get generic prompt; medical-safety rules missing | Wire `getIndustryTemplate()` based on `tenant.industry` |
| 12 | P1 | Security | **Tenant impersonation via `x-tenant-id` header trusted** | `apps/web/src/lib/api-client.ts:21-22` | localStorage manipulation → cross-tenant access | Add backend validation |
| 13 | P1 | Security | **Fallback encryption key** | `crypto.service.ts:22` falls back to `'zerodesk-dev-only-secret-key-32b'` | Production data encrypted with known key | Throw in production if secret missing |
| 14 | P1 | Security | **LiveKit token uses `'devkey'`/`'secret'` fallback** | `voice.service.ts:385-388` | Anyone can generate tokens, join any room | Throw on missing credentials |
| 15 | P1 | AI | **AI action params not validated** | `ai.service.ts:172-174` | Malformed actions flow to event handlers | Add Zod schema validation |
| 16 | P1 | Voice | **LiveKit metering regex fails** | `voice.service.ts:452` expects `tenant_<id>` prefix but dispatch generates `call_<phone>_<ts>` | Inbound SIP calls not metered | Use room metadata instead of name regex |
| 17 | P1 | AI | **Prompt injection via customer data** | `prompt.service.ts:14-29` | Attacker controls AI via customer record fields | Sanitize customer context with `PromptGuardService` |
| 18 | P1 | AI | **Guardrails only on voice** | `ai.service.ts` does not call `wrapSystemPromptWithGuardrails()` | WhatsApp + Web Chat AI unguarded | Apply guardrails to all AI channels |
| 19 | P1 | Frontend | **localStorage is primary database for ~50 routes** | Multiple `lib/*-store.ts` and `page.tsx` files | No multi-user sync, no real persistence | Wire all to backend |
| 20 | P1 | Testing | **Critical paths have ZERO test coverage** | `auth.service.ts`, `whatsapp.service.ts`, `ai.service.ts`, `voice.service.ts`, `rag.service.ts` all untested | Regressions invisible | Add minimum: webhook handlers, tenant guard denial, prompt guard, RAG isolation |
| 21 | P1 | DevOps | **Sentry `tracesSampleRate: 1.0`** | `instrument.ts`, `sentry.client.config.ts`, etc. | Massive tracing data volume + cost at scale | Set to 0.1 in production |
| 22 | P1 | Voice | **STT proxy endpoint doesn't exist** | `voice.service.ts:228-233` configures Vapi to call `/v1/voice/sarvam-stt-proxy` | Vapi STT fails in production | Implement endpoint or remove from Vapi config |
| 23 | P1 | UX | **No onboarding flow** | `middleware.ts:9` allows `/onboarding(.*)` but no page exists | New users land on dashboard with no setup guidance | Build guided setup wizard |
| 24 | P1 | UX | **Knowledge base "Learn" is fake** | `apps/web/.../knowledge-base/page.tsx` uses `setTimeout(1800)` | User thinks KB is training; nothing happens | Wire to `embedding.processor` or remove button |
| 25 | P1 | Billing | **No Stripe webhook handler** | `.env.example` has Stripe vars; no controller for webhook events | Subscription status never updates from Stripe | Implement `billing.controller.ts` with webhook handler |

---

# SECTION 5 — MAJOR MISTAKES

### MISTAKE #1: Mock Data as Foundation
**WHY WRONG:** The frontend uses hardcoded `MOCK_DATA` arrays, `Math.random()` generators, and `setTimeout()` simulations as the default behavior, not as a fallback.
**BUSINESS IMPACT:** When a paying customer signs up, they see beautiful UI with fake numbers. They believe AI is responding but it's not. Support tickets explode. They churn.
**TECHNICAL IMPACT:** Massive refactor needed to wire 50+ components to real API.
**SEVERITY:** P0 (Business-critical)
**EVIDENCE:** `crm/page.tsx`, `analytics/page.tsx`, `voice/page.tsx`, `inbound-calls/page.tsx`, `unified-inbox/page.tsx`, `human-handoff-requests/page.tsx`, `appointments/page.tsx`, `whatsapp/page.tsx`, `super-admin/tenants/page.tsx`
**RECOMMENDATION:** Either reposition as "design demo" and gate behind a flag, or spend 30 days wiring top 10 routes.

### MISTAKE #2: Critical Security Control in Production Code: `findFirst()` Fallback
**WHY WRONG:** `voice.service.ts:740` uses `(await this.prisma.tenant.findFirst())?.id` as a fallback when SIP called number doesn't match any voice config. This is a "let's not crash" defensive pattern that silently enables cross-tenant data corruption.
**BUSINESS IMPACT:** A misrouted call creates conversation + customer records in the wrong tenant. Customer A's phone number appears in Tenant B's CRM. GDPR/compliance violation.
**TECHNICAL IMPACT:** All downstream reports are wrong. Metering is incorrect. AI training is contaminated.
**SEVERITY:** P0
**EVIDENCE:** `voice.service.ts:740`: `const tenantId = config?.tenantId || (await this.prisma.tenant.findFirst())?.id || 'default';`
**RECOMMENDATION:** Replace with `throw new BadRequestException('Unknown SIP caller')` and have a separate "default" tenant for orphan calls.

### MISTAKE #3: Token Metering Inconsistency (Voice ✅, LLM ❌)
**WHY WRONG:** Voice minutes are correctly metered. LLM tokens are not metered at all. The schema has the field but no code increments it.
**BUSINESS IMPACT:** A single customer can run infinite GPT-4o conversations. ZEROdesk pays the bill. Gross margin goes negative at scale.
**TECHNICAL IMPACT:** No way to detect abusive customers. No way to enforce plan limits. No way to forecast AI costs.
**SEVERITY:** P0
**EVIDENCE:** `subscription.llmTokensUsed` (schema line 462), `ai.service.ts:149-159` (ignores `completion.usage`)
**RECOMMENDATION:** Wire token counting immediately. Add pre-call quota check.

### MISTAKE #4: Architecture vs. Implementation Mismatch (ForTenant footgun)
**WHY WRONG:** `TenantPrismaService.forTenant()` is marketed as a "safe" API that auto-injects `tenantId`. But it also exposes `prisma: this.prisma` (the raw service). Future developers will use `.prisma` for convenience and accidentally bypass tenant isolation.
**BUSINESS IMPACT:** A single new feature added with `.prisma` instead of `.client` can leak all data across tenants.
**SEVERITY:** P0 (latent)
**EVIDENCE:** `tenant-prisma.service.ts:46`
**RECOMMENDATION:** Remove `prisma` from the return type. Add ESLint rule to forbid `prismaService` injection in modules that have tenant-scoped operations.

### MISTAKE #5: Production Secrets Committed to Git
**WHY WRONG:** The .env files contain real API keys. The .gitignore has `**/.env` patterns, but the files were committed before the rule was added.
**BUSINESS IMPACT:** Anyone with repo access can rack up bills, exfiltrate customer data, hijack accounts.
**TECHNICAL IMPACT:** Git history contains the keys. Even after rotation, anyone can `git log -p .env` to find them.
**SEVERITY:** P0
**EVIDENCE:** `apps/api/.env`, `apps/voice-agent/.env`, `apps/web/.env`
**RECOMMENDATION:** Rotate ALL keys. Add pre-commit hook to block .env files. Use BFG Repo-Cleaner to remove from history.

### MISTAKE #6: Industry-Specific AI Templates Written But Never Used
**WHY WRONG:** `prompt.service.ts:107-132` contains carefully written industry-specific prompts (hospital, skin_hair_clinic, spa_wellness, hotel_resort, real_estate). But `getIndustryPrompt()` returns a hardcoded generic prompt ignoring `tenant.industry`.
**BUSINESS IMPACT:** A hospital customer gets the same generic prompt as a real estate agent. Medical safety rules for hospitals are absent. Indian emergency triage is not applied.
**SEVERITY:** P0
**EVIDENCE:** `prompt.service.ts:86-132`
**RECOMMENDATION:** Wire `getIndustryTemplate(tenant.industry)` into `getSystemPrompt()`.

### MISTAKE #7: Mock UI as "Production Feature"
**WHY WRONG:** "Live voice testing" in the voice page animates an orb for 3 seconds. "Learn Knowledge Base" waits 1.8 seconds. "Test RAG Query" returns hardcoded "98% similarity". All of these are UX theater that misleads users.
**BUSINESS IMPACT:** Users believe features work when they don't. Demo to investors works. Demo to real customers fails. They demand refunds.
**SEVERITY:** P0
**EVIDENCE:** `voice/page.tsx`, `knowledge-base/page.tsx`, `test-knowledge-base/page.tsx`
**RECOMMENDATION:** Either wire to real backend or add a clear "DEMO MODE" banner.

### MISTAKE #8: No Stripe Webhook Handler Despite Stripe Config
**WHY WRONG:** `.env.example` defines `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and three price IDs. But there's no `billing.controller.ts` or webhook endpoint.
**BUSINESS IMPACT:** Subscriptions never update. Failed payments don't notify. No MRR tracking. No way to charge customers.
**SEVERITY:** P0
**EVIDENCE:** `.env.example` lines 83-88, no `apps/api/src/modules/billing` module exists
**RECOMMENDATION:** Implement Stripe webhook handler at `/v1/billing/stripe-webhook`.

### MISTAKE #9: `x-tenant-id` Header Trust Without Backend Verification
**WHY WRONG:** The frontend sends `x-tenant-id` header from localStorage/Clerk. Backend's `TenantGuard` uses JWT's `org_id` claim primarily, but the header is also read in some endpoints.
**BUSINESS IMPACT:** Tenant enumeration. IDOR attacks possible on endpoints that read header.
**SEVERITY:** P1
**EVIDENCE:** `apps/web/src/lib/api-client.ts:62-65`, `appointment.controller.ts:40-50`, `service.controller.ts:17-25`
**RECOMMENDATION:** Remove header trust entirely. Use only JWT-derived tenant.

### MISTAKE #10: Two Different Voice Provider Stacks, One Incomplete
**WHY WRONG:** Code references Vapi AND Retell AND LiveKit. Vapi integration is complete. Retell integration lacks the `retellPhoneNumber` field in schema. LiveKit has Python agent that hardcodes OpenAI.
**BUSINESS IMPACT:** Customers can't choose their preferred provider. Single point of failure. Hidden complexity.
**SEVERITY:** P1
**EVIDENCE:** `voice.service.ts:71-477`
**RECOMMENDATION:** Pick one provider per region. Vapi for India + LiveKit as fallback.

---

# SECTION 6 — WHAT IS FAKE / MOCK / SIMULATED / DISCONNECTED

| Feature | Type | Evidence |
|---|---|---|
| **Dashboard home (/)** | Hardcoded | `chartData`, `pieData`, activity feed all hardcoded |
| **WhatsApp connection status** | Fake | "Connected" status without API check |
| **WhatsApp stats** | Hardcoded | `128 messages`, `92% resolved`, `0.8s response` |
| **WhatsApp recent messages** | Hardcoded | 4 static conversations |
| **Voice library** | Hardcoded | `VOICES_LIBRARY` constant |
| **Voice live testing** | Simulated | 3-second orb animation, no microphone access |
| **Inbound calls log** | Hardcoded | `INBOUND_CALL_LOGS` array |
| **Human handoff requests** | Hardcoded | `MOCK_DATA` 8-entry array |
| **Human handoff timer** | Simulated | `setInterval` updates `timeNow` every 60s |
| **Unified inbox contacts** | Fallback to mock | Falls back to `MOCK_CONTACTS` if store empty |
| **Unified inbox quick actions** | Simulated | `alert()` instead of real action |
| **Analytics KPIs** | Hardcoded multipliers | `averageDurationSecs: 142, resolutionRate: 94.2` |
| **Analytics hourly chart** | `Math.random()` | Regenerates on every render |
| **CRM leads** | Hardcoded | `getDefaultLeads()` with random phone numbers |
| **Appointments (per niche)** | Hardcoded | `DEFAULT_APPOINTMENTS_BY_NICHE` for skin/dental/spa |
| **Tone check** | `Math.random()` | Random sentiment scores on each analysis |
| **Knowledge base retrain** | Simulated | `setTimeout(1800)` then success toast |
| **RAG test playground** | Hardcoded | "98% Vector Similarity" always |
| **Ask AI chat** | Mock | Local state, no real AI call |
| **Super admin tenants** | localStorage | 8 hardcoded tenants |
| **Super admin voices** | localStorage | 6 hardcoded voices |
| **Super admin LLMs** | localStorage | 5 hardcoded LLM models |
| **Billing parked bills** | localStorage | 2 hardcoded bills |
| **Meta ads campaigns** | Hardcoded | `DEFAULT_CAMPAIGNS_BY_NICHE` |
| **Patient files** | Empty state | No implementation |
| **Manager dashboard** | Empty | No implementation |
| **Staff dashboard** | Empty | No implementation |
| **Hotel: room rack** | Empty | No implementation |
| **Hotel: housekeeping** | Empty | No implementation |
| **Onboarding wizard** | Route only | Middleware allows, no page |
| **Voice AI prompts config** | localStorage | No backend write |
| **WhatsApp AI prompts config** | localStorage | No backend write |
| **Webchat AI prompts config** | localStorage | No backend write |
| **Booking link config** | localStorage | No backend write |
| **Build sequence** | Local React state | No backend persistence |
| **Manage team** | Local state | No backend persistence |
| **Outbound campaigns** | Local state | No backend persistence |
| **Templates editor** | Local state | No backend persistence |
| **Sentiment analysis** | Hardcoded | Returns canned results |
| **Customer value / LTV** | Client-side engine | `ltv-engine.ts` is real but no persistence |
| **Operational delays** | Mock | No implementation |
| **Monthly sales** | Mock | No implementation |
| **Waiting room** | Kanban UI | Mock data |
| **Inbound calls KPI** | Hardcoded | "42 Calls", "92.8%", "3 Clinical" |
| **Invoices print window** | XSS risk | `document.write` with unsanitized template data |
| **API call silent failures** | Silent | `.catch(() => null)` patterns swallow errors |

**Total fake/mock features: 45+**

---

# SECTION 7 — SECURITY FINDINGS (Ranked)

| # | Sev | Finding | File |
|---|---|---|---|
| 1 | P0 | Real API keys in git | `apps/api/.env`, `apps/voice-agent/.env`, `apps/web/.env` |
| 2 | P0 | Stored XSS in invoice print | `invoices/page.tsx:168-189` |
| 3 | P0 | `public-book` no auth | `appointment.controller.ts:40-50` |
| 4 | P0 | `service/search` no auth | `service.controller.ts:17-25` |
| 5 | P0 | Plaintext WhatsApp access tokens | `schema.prisma:393-410` |
| 6 | P0 | Fallback encryption key | `crypto.service.ts:22` |
| 7 | P0 | Fallback LiveKit keys | `voice.service.ts:385-388` |
| 8 | P1 | Tenant impersonation via header | `api-client.ts:21-22` |
| 9 | P1 | WhatsApp sig check skipped in non-prod | `whatsapp.controller.ts:22-35` |
| 10 | P1 | Customer data injected into prompts unsanitized | `prompt.service.ts:14-29` |
| 11 | P1 | RAG content injected unsanitized | `rag.service.ts:126-131` |
| 12 | P1 | n8n webhook unauthenticated | `automation.controller.ts:23-26` |
| 13 | P1 | OpenAI client dummy fallback | `ai.service.ts:36-38` |
| 14 | P2 | WebSocket CORS `*` | `chat.gateway.ts:18` |
| 15 | P2 | Webhook rate limiting | `main.ts:38-43` |
| 16 | P2 | CSP contains `unsafe-eval` | `main.ts:25-26` |
| 17 | P2 | No CSRF protection | Global |
| 18 | P2 | Predictable invoice numbers | `invoice.service.ts:31-35` |
| 19 | P2 | CORS bypass in non-prod | `main.ts:42-48` |
| 20 | P2 | `/sentry-debug` exposed | `health.controller.ts` |
| 21 | P3 | Idempotency allows no-ID requests | `idempotency.guard.ts:23-26` |
| 22 | P3 | Health endpoint leaks memory | `health.controller.ts` |
| 23 | P3 | Real Sentry DSN hardcoded | `instrument.ts` |
| 24 | P3 | Internal secret hardcoded | `voice.service.ts:46`, `agent.py:46` |
| 25 | P3 | `body any` in admin controller | `admin.controller.ts` |

---

# SECTION 8 — MULTI-TENANCY FINDINGS

| # | Sev | Finding | Status |
|---|---|---|---|
| 1 | P0 | SIP fallback to first tenant | ❌ Active data contamination vector |
| 2 | P0 | `TenantPrismaService` exposes raw `prisma` | ⚠️ Latent bypass |
| 3 | P0 | `customers.update` wrapper doesn't inject `tenantId` | ⚠️ Trusts caller |
| 4 | P1 | `voice/retell` finds no tenant (no field) | ❌ All Retell calls misrouted |
| 5 | P1 | LiveKit room regex fails for `call_*` prefix | ❌ No metering for SIP calls |
| 6 | P1 | `executeInTenantContext` defined but unused | 🟡 Dead code |
| 7 | P1 | `findTenantByPhone` only checks Vapi phone | ❌ Provider-specific bug |
| 8 | P2 | `findFirst` patterns rely on tenantId in args | ⚠️ Easy to forget |
| 9 | P2 | RLS policies in separate SQL not in migrations | ⚠️ May not be applied |
| 10 | P2 | Webhook payloads include tenantId from provider trust | ⚠️ Vapi webhook |
| 11 | P2 | `customers.update` direct prisma path | ⚠️ Latent risk |
| 12 | P2 | Subscription updateMany for metering | ✅ Safe (tenantId required) |

**Multi-Tenancy Score: 70/100** — Strong in services, weak in voice webhooks and SIP.

---

# SECTION 9 — AI / VOICE / WHATSAPP FINDINGS

## AI
- Multi-provider LLM abstraction exists but only Voice uses it; WhatsApp/Web Chat hardcode OpenAI
- `LlmService` is instantiated but `AiService` uses its own OpenAI client directly — dead architecture
- `getIndustryTemplate()` writes 5 industry prompts but `getIndustryPrompt()` ignores them
- Prompt injection guard exists but not applied to non-voice channels
- RAG content not sanitized before prompt injection
- Customer data not sanitized before prompt injection
- Action params not validated (could pass `{customerId: 'malicious'}`)
- Token counting returns from SDK but never persisted to `llmTokensUsed`
- Conversation memory hardcoded to 20 messages (no token budgeting)
- No schema validation on AI JSON response (basic try/catch only)

## Voice
- Vapi integration: Mostly complete, good
- Retell integration: **Broken** (no `retellPhoneNumber` field)
- LiveKit: Python agent hardcodes OpenAI, ignores tenant LLM assignment
- SIP dispatch: **Cross-tenant data contamination bug**
- Human transfer: Theater, no actual transfer
- STT proxy: Endpoint doesn't exist
- Function calls: `checkAvailability`, `getPricing` are hardcoded stubs
- Recording: Vapi and Retell OK, LiveKit not configured
- Transcript: Real-time streaming works, but only summary stored
- Metering: Voice ✅, Retell ❌, LiveKit SIP ❌

## WhatsApp
- Webhook handling: Good with idempotency
- Signature verification: Production-only (skipped in dev)
- Status events: Emitted but no listener exists
- Quota metering: ✅
- Customer lookup/creation: ✅ with race condition handling
- Frontend integration: ❌ Not connected

---

# SECTION 10 — DATA / DATABASE FINDINGS

| Finding | Status |
|---|---|
| 21 models, all with proper `tenantId` | ✅ Good |
| Composite unique constraints `@@unique([id, tenantId])` | ✅ Good |
| Cascade deletes on all tenant-owned models | ✅ Good |
| Indexes on common query patterns | ✅ Good |
| `voiceConfigs.vapiPhoneNumber @unique` | ✅ Good |
| `whatsappConfigs.phoneNumberId @unique` | ✅ Good |
| `whatsappConfigs.accessToken` plaintext | ❌ Should encrypt |
| No `retellPhoneNumber` field | ❌ Missing |
| `Subscription.llmTokensUsed` never incremented | ❌ |
| No `Lead.customerId` cascade rules | ⚠️ |
| `Activity` not cascade from `Customer` | ⚠️ |
| `Appointment` references `StaffMember` with no cascade | ⚠️ |
| No soft deletes anywhere | ⚠️ Hard delete only |
| No audit trail on Patient/Lead changes | ⚠️ |
| No backup strategy documented | ❌ |
| RLS policies in `rls_policies.sql`, not in Prisma migrations | ⚠️ May not be applied |
| `db:push` used in production, not `migrate` | ⚠️ Loses migration history |
| `prisma db push --accept-data-loss` | ❌ DANGEROUS in production |
| No rollback scripts | ❌ |
| `executInTenantContext` defined, never used | 🟡 Dead code |
| `tsconfig.tsbuildinfo` committed in git | ⚠️ |
| `next/cache` and `dist/` directories committed | ⚠️ |

---

# SECTION 11 — TESTING GAPS

**Total spec files: 7** (out of hundreds of service methods)

| Tested | Coverage Quality | Critical? |
|---|---|---|
| `auth.guard.spec.ts` | Weak — mocks Clerk SDK entirely | ⚠️ |
| `idempotency.guard.spec.ts` | Adequate | ✅ |
| `internal-voice.guard.spec.ts` | Adequate | ✅ |
| `tenant.guard.spec.ts` | Weak — no cross-tenant denial test | ⚠️ |
| `appointment.service.spec.ts` | Partial — WhatsApp never injected | ⚠️ |
| `customer.service.spec.ts` | Partial — `where.tenantId` not asserted | ⚠️ |
| `health.controller.spec.ts` | Static version check | 🟡 |

### Critical Paths with ZERO Test Coverage
1. **Clerk webhook → tenant/user provisioning** (P0 — security-critical)
2. **Voice webhook processing** (P0 — billing)
3. **WhatsApp auto-reply pipeline** (P0)
4. **AI/LLM provider fallback chains** (P1)
5. **TCPA compliance** in outbound calls (P1 — legal)
6. **Subscription quota enforcement** (P1 — billing)
7. **Invoice number generation** (P3 — non-deterministic)
8. **StorageService tenant path validation** (P0 — file access)
9. **PromptGuardService regex patterns** (P0 — security)
10. **RAGService cross-tenant isolation** (P0 — data leak)
11. **`public-book` endpoint** (P0 — open access)
12. **LiveKit token generation** (P1)
13. **Multi-provider LLM routing** (P1)
14. **All admin operations** (P1)

### False-Confidence Tests
- `auth.guard.spec.ts`: never invokes real `verifyToken()` — only checks guard logic
- `appointment.service.spec.ts`: `WhatsappService` is `@Optional()` and never injected
- `customer.service.spec.ts`: Pagination verified but `where.tenantId` not asserted
- `health.controller.spec.ts`: Hardcoded version string check

### E2E Tests
- `test/jest-e2e.json` config exists
- **0 E2E test files** in repository
- No Playwright, Cypress, or browser tests

---

# SECTION 12 — SCALABILITY ANALYSIS

### 1 Customer
- ✅ Should work for basic features
- ⚠️ Mock data will be exposed immediately
- ⚠️ Onboarding flow missing — manual setup required

### 10 Customers
- ⚠️ First real conflict in scheduling
- ⚠️ First multi-tenant data verification needed
- ⚠️ LLM token cost will start to bite
- ⚠️ Voice minute quota enforcement tested in real conditions

### 50 Customers
- ❌ Analytics dashboard will show skewed data (mock + real mixed)
- ❌ Onboarding bottleneck — needs manual engineering for each customer
- ❌ Super-admin control plane needed (currently localStorage)
- ❌ First CSV export / data portability request

### 100 Customers
- ❌ First customer support escalation
- ❌ First multi-user collaboration request (localStorage is per-device)
- ❌ First regulatory inquiry (call recordings, transcript retention)
- ❌ First billing dispute (overage from unmetered LLM)
- ❌ First request for SLA guarantees

### 500 Customers
- ❌ Database connection pool exhaustion
- ❌ Redis memory pressure
- ❌ LLM cost ratio
- ❌ Voice minutes fraud risk
- ❌ Concurrent booking conflicts at scale

### 1000 Customers
- ❌ Multi-region deployment needed
- ❌ Read replicas needed
- ❌ Background queue scaling
- ❌ Per-tenant rate limiting
- ❌ Distributed rate limiting (currently in-memory only)
- ❌ Observability stack (only Sentry 100% sampling)

### First Bottleneck (Probably)
**In-memory throttler at 120 req/min/IP** — A single customer's 10 staff members all hitting from same office IP will be rate-limited.

### Second Bottleneck
**No distributed rate limiting or quota enforcement** — A single runaway customer can exhaust shared resources.

---

# SECTION 13 — COST / UNIT ECONOMICS

## Code-Verified Cost Inputs
- **LLM tokens**: Schema has `llmTokensLimit: 1000000` (1M tokens default), `llmTokensUsed: 0` (never incremented)
- **Voice minutes**: Schema has `voiceMinutesLimit: 100` (100 min default), `voiceMinutesUsed` properly incremented
- **WhatsApp messages**: Schema has `whatsappMessagesLimit: 500`, `whatsappMessagesUsed` properly incremented
- **Storage**: Schema has `storageLimitMB: 1000`

## Verified Inputs
- **OpenAI API key**: Present (sk-proj-...)
- **LiveKit API**: APIaWHjMKXEDowH
- **ElevenLabs API**: sk_591ff870...
- **Sarvam API**: sk_ly8wjt11...
- **Cloudflare R2**: ffc82a5fa92c...

## Estimated Per-Customer Cost (INFERRED — not from code)
- 1M GPT-4o-mini tokens: ~$0.15-0.60/month per customer (assuming moderate use)
- 100 voice minutes Vapi: ~$5-10/month
- 500 WhatsApp messages Meta: ~$5-10/month
- Storage 1GB R2: $0.02/month

## Estimated Revenue per Customer (NEED PRICING STRATEGY)
- Pricing tiers: starter/growth/enterprise (defined in `.env.example`)
- No public pricing in repo

## Gross Margin Risk
**HIGH** because LLM tokens are unmetered. A single customer can generate $100s of API costs against a $99/month plan. This is an **unbounded liability**.

## Hidden Costs
- Sentry at 100% sampling will balloon at scale
- Voice agent on Fly.io 1GB RAM (~$5-7/month always-on, doesn't auto-scale)
- Redis not configured for persistence (data loss risk)
- No CDN visible (all traffic to Next.js)

## External Market Research (NOT VERIFIED)
- Average SMB SaaS gross margin: 70-80%
- Average AI voice SaaS gross margin: 40-60% (high inference costs)

## RECOMMENDATION
Implement LLM token metering **before** any new customer. At current state, **gross margin is undefined** because there's no way to bill for AI usage.

---

# SECTION 14 — COMPETITIVE GAPS

| Capability | ZEROdesk | Modern Competitor | Gap |
|---|---|---|---|
| Inbound voice AI | ✅ Vapi | ✅ | None |
| Outbound voice | ✅ BullMQ | ✅ | None |
| WhatsApp | ✅ Meta API | ✅ | None |
| Webchat widget | ✅ (`/widget`) | ✅ | None |
| CRM pipeline | ⚠️ Backend works, UI is mock | ✅ | Frontend integration |
| RAG knowledge base | ✅ Real backend, fake UI | ✅ | Frontend integration |
| Calendar integration | ❌ None | ✅ Google/Outlook | **Missing** |
| Native iOS/Android | ❌ Desktop Tauri only | ✅ | **Missing** |
| Multi-language UI | ⚠️ 5 langs in prompts | ✅ 30+ | **Partial** |
| White-label | ❌ | ✅ | **Missing** |
| No-code workflow builder | ⚠️ UI exists, no real engine | ✅ n8n-style | **Partial** |
| Stripe billing | ❌ | ✅ | **Missing** |
| Voice clone per tenant | ✅ ElevenLabs | ✅ | None |
| Sub-200ms latency | ⚠️ Depends on provider | ✅ | Provider-dependent |
| Voice agent for marketplace | ❌ | ✅ | **Missing** |
| Zapier/Make integrations | ❌ | ✅ | **Missing** |
| SOC 2 / HIPAA | ❌ | ✅ (some) | **Missing** |
| Audit log | ⚠️ AuditLog model exists, not used | ✅ | **Missing wire-up** |
| Tenant self-serve onboarding | ❌ | ✅ | **Missing** |
| Public API for developers | ⚠️ Swagger exists | ✅ | **Missing docs/marketing** |
| Webhooks out | ❌ (only in) | ✅ | **Missing** |

**Verdict:** ZEROdesk has strong technical foundations but is behind modern competitors on:
- Calendar integrations
- Mobile clients
- White-label/marketplace
- Stripe billing
- SOC 2 / HIPAA compliance
- Webhooks out
- No-code workflow builder (real)

**Where ZEROdesk wins:**
- Multi-vertical niche support (5 niches pre-configured)
- Indian market focus (Sarvam AI STT, Indian English voice, GST-aware invoicing)
- Combined voice + WhatsApp + Webchat in one platform
- Deep Clerk integration

---

# SECTION 15 — PRODUCT GAPS

### What Real Customers Will Expect
1. **Onboarding wizard** — Currently no `/onboarding` page
2. **Calendar sync** (Google/Outlook) — None
3. **Email integration** (SMTP/SendGrid) — None
4. **Real WhatsApp Business setup flow** — Currently just config form
5. **Voice setup with actual test call** — Currently fake orb
6. **Custom AI training feedback** ("thumbs up/down" on responses) — None
7. **Multi-user real-time collaboration** — localStorage per device
8. **Push notifications** (mobile/web push) — None
9. **Customer-facing status page** — None
10. **Two-factor authentication** — None
11. **API keys for customers** — None
12. **Data export (CSV/JSON)** — None
13. **Audit log UI** — None (model exists)
14. **Custom fields on customers** — None
15. **Tagging with hierarchy** — Just flat string array
16. **Saved views / filters** — None
17. **Bulk operations** — None
18. **Mobile-responsive sidebar** — 80px squished icons
19. **Dark/light theme toggle for all pages** — Some pages broken on light mode
20. **Internationalization (UI labels)** — Niche-specific terms only

### What Will Get Asked in First 30 Days
- "Where do I see my call recordings?"
- "Can my manager get notified when a VIP calls?"
- "How do I add a new doctor/staff?"
- "Where are my invoices?"
- "Can I customize the AI greeting?"
- "How do I pause AI for the weekend?"
- "Can my customer rate the call?"
- "Where do I see which KB the AI used?"

---

# SECTION 16 — GTM / SALES READINESS

### Target Market
- SMB service businesses in India
- 5 verticals: Skin clinic, Dental, Spa, Real Estate, Hotel
- Indian English + Hindi + Telugu language support

### ICP (Ideal Customer Profile)
- 1-10 staff
- Currently using phone + WhatsApp Business (manual)
- Pain point: missed calls after hours, slow WhatsApp replies
- Has 50+ calls/day

### Value Proposition (Current State)
"AI receptionist that answers calls, replies on WhatsApp, books appointments, and remembers every customer."

### Reality Check
- ✅ AI answering calls works (Vapi)
- ⚠️ WhatsApp replies work backend, no customer setup flow
- ✅ Bookings work (with gaps)
- ⚠️ Customer memory: works for conversation, not cross-channel

### Can ZEROdesk be sold as:
| Model | Verdict |
|---|---|
| **A) Self-serve SaaS** | ❌ Onboarding is broken. Customer can't set it up alone. |
| **B) Managed SaaS** | ⚠️ Maybe. Engineering needs to wire each customer. |
| **C) Concierge implementation** | ✅ Yes, if dedicated CSM team exists. |
| **D) Hybrid SaaS** | ⚠️ The realistic model: 80% manual setup, 20% self-serve. |

### Honest Assessment
**Current GTM reality:** This is a founder-led sales + manual onboarding product. The founder or a CSM must configure each customer. It cannot scale beyond 20-50 customers without significant engineering investment.

### Pricing Strategy (Missing)
- No pricing page in repo
- No Stripe integration
- 3 tiers defined in `.env.example` (starter/growth/enterprise) but no logic
- Indian market: ₹2,999 / ₹9,999 / ₹24,999 monthly is typical

### Sales Bottleneck
- No demo environment (everything is local)
- No trial sign-up (requires Clerk + DB + configuration)
- No self-serve evaluation

---

# SECTION 17 — OPERATIONAL READINESS

### What Requires Manual Work Per Customer (TODAY)
1. Configure Clerk organization + sync webhook
2. Verify tenant created in DB
3. Manually configure voice (Vapi assistant)
4. Manually configure WhatsApp (Meta Business approval)
5. Manually upload knowledge base documents
6. Manually tune prompts
7. Manually set working hours
8. Manually set staff
9. Manually configure services
10. Manually test booking flow
11. Manually test call routing
12. Manually monitor first 5 calls
13. Manually handle handoff requests

**Estimated onboarding: 8-16 hours of engineering/CSM time per customer**

### What Will Break Without Manual Work
- Customer A will get Customer B's calls (SIP fallback)
- AI will not know about the customer's business (industry prompts not wired)
- Calls won't transfer to humans (no real transfer)
- WhatsApp won't be connected (frontend fake)
- Knowledge base won't be searchable (frontend fake)

### Monitoring Gaps
- No alert when tenant approaches quota
- No alert when webhook delivery fails
- No alert when LLM token usage spikes
- No alert when call quality degrades
- Sentry at 100% sampling (too noisy)
- No business metrics dashboard (SuperAdmin is fake)

### Support Burden Estimate
**Very High** for first 50 customers. The founder/team will be:
- Manually configuring Vapi for each customer
- Manually uploading KB docs
- Manually handling failed webhooks
- Manually fixing booking conflicts
- Manually pulling logs for support tickets

---

# SECTION 18 — LAUNCH BLOCKERS

### True P0 Blockers (Must Fix Before ANY Customer)
1. **Rotate all exposed API keys** in `.env` files
2. **Remove `public-book` and `service/search` auth gaps** (CRITICAL data leak)
3. **Fix SIP dispatch tenant fallback** (CRITICAL data contamination)
4. **Implement LLM token metering** (CRITICAL billing gap)
5. **Encrypt WhatsApp access tokens at rest** (CRITICAL security)
6. **Fix invoice print XSS** (CRITICAL security)
7. **Add `@Public()` validation properly** (or remove `public-book` for unauthenticated)
8. **Remove hardcoded `devkey`/`secret` LiveKit fallbacks** (CRITICAL security)
9. **Wire `getIndustryTemplate()` into prompt construction** (product truth)
10. **Remove `prisma: this.prisma` from `TenantPrismaService.forTenant()`** (latent bypass)

### P0 Blockers (Before Real Customer #3)
11. Add `retellPhoneNumber` field or remove Retell references
12. Implement actual human transfer (Vapi/Retell API)
13. Fix LiveKit SIP room name regex
14. Build real onboarding wizard
15. Wire at least top 10 dashboard routes to real backend
16. Implement `public-book` with signed token instead of header trust

### P0 Blockers (Before Customer #10)
17. Implement Stripe billing
18. Add proper audit log
19. Add data export
20. Add customer notifications (in-app + email)
21. Add proper error UX (not silent swallowing)
22. Add distributed rate limiting (Redis-backed)

---

# SECTION 19 — POST-LAUNCH RISKS (Can Wait)

- Calendar integration (Google/Outlook)
- Mobile apps (iOS/Android)
- White-label/marketplace features
- Zapier/Make integrations
- Advanced workflow builder (n8n-style)
- SOC 2 / HIPAA certification
- Webhooks out
- Multi-region deployment
- Read replicas
- Advanced analytics (cohort, funnel)
- A/B testing
- Custom fields on entities
- Bulk operations
- Saved views/filters
- Customer-facing status page
- 2FA
- API keys for customers
- Sub-200ms voice latency optimization (provider-dependent)
- Voice marketplace
- Push notifications
- Internationalization of UI labels

---

# SECTION 20 — PRIORITIZED ACTION PLAN (NOT IMPLEMENTING)

## Day 1-3 (Immediate Crisis Response)
1. **Rotate all API keys** (OpenAI, LiveKit, Sarvam, ElevenLabs, R2)
2. **Add `.env` files to .gitignore** retroactively + BFG Repo-Cleaner
3. **Remove `public-book` endpoint** OR add signed-token validation
4. **Remove `service/search` endpoint** OR add auth
5. **Fix SIP dispatch tenant fallback** to reject unknown numbers
6. **Remove `prisma: this.prisma` from TenantPrismaService**
7. **Add token metering** for LLM
8. **Remove hardcoded `devkey`/`secret` from LiveKit**
9. **Fix invoice print XSS**
10. **Encrypt WhatsApp access tokens at rest** with `CryptoService`

## Day 4-7 (Foundation Hardening)
1. Wire `getIndustryTemplate()` based on `tenant.industry`
2. Add `retellPhoneNumber` field to schema + migration
3. Implement actual human transfer (Vapi transfer API)
4. Add `@Public()` properly on public-book + signed token
5. Add `retellPhoneNumber` query in `findTenantByPhone`
6. Add cross-tenant denial tests to `tenant.guard.spec.ts`
7. Add storage tenant path validation test
8. Add RAG cross-tenant isolation test
9. Implement Stripe webhook handler (basic)
10. Fix LiveKit SIP room name regex

## Week 2 (Wire Critical Features)
1. Connect Knowledge Base page to real RAG API
2. Connect Voice page to real voice config
3. Connect WhatsApp page to real WhatsApp config
4. Connect Analytics to real analytics
5. Connect CRM to real CRM API
6. Connect Inbox to real conversations
7. Add onboarding wizard
8. Implement webhook out for customer integrations
9. Add audit log writes
10. Add data export endpoint

## Week 3 (Production Hardening)
1. Implement distributed rate limiting (Redis-backed)
2. Add per-tenant quotas with pre-call checks
3. Implement Sentry sampling (0.1 in production)
4. Add backup script for PostgreSQL
5. Add R2 lifecycle rules
6. Add health check for voice agent
7. Implement quota alerts
8. Add CSRF protection
9. Add prompt injection guard to all AI channels
10. Add AI action parameter validation (Zod)

## Week 4 (Operational Maturity)
1. Build onboarding flow (3-step wizard)
2. Add knowledge base chunking visualization
3. Add KB quality score
4. Add test call feature
5. Add WhatsApp Business setup wizard
6. Add Stripe customer portal
7. Add error UX (toast on all failures)
8. Add empty states for all pages
9. Add mobile hamburger menu
10. Add dark/light theme consistency

## Next 90 Days (Strategic Investments)
1. **Hire/contract** dedicated DevOps (SRE) — current CI is typecheck only
2. **Hire/contract** security engineer for penetration test
3. **Build** real-time collaboration (replace localStorage with API + WebSocket)
4. **Build** mobile-responsive redesign
5. **Add** calendar integrations
6. **Add** Zapier/Make integrations
7. **Build** self-serve trial flow
8. **Add** Stripe billing + invoicing
9. **SOC 2** preparation
10. **HIPAA** preparation (if pursuing US healthcare)

---

# SECTION 21 — WHAT NOT TO BUILD YET

These are distractions that will slow you down:

1. ❌ **Mobile apps** — Web responsive is sufficient for next 6 months
2. ❌ **White-label features** — Not needed for first 10 customers
3. ❌ **Marketplace for voice agents** — Focus on your own agent quality
4. ❌ **Advanced workflow builder** — Customers can use n8n directly
5. ❌ **Multi-region deployment** — India only for first 100 customers
6. ❌ **Custom AI training** — LLM provider fine-tuning is a rabbit hole
7. ❌ **Voice marketplace** — Vendor lock-in concern
8. ❌ **A/B testing framework** — Validate product-market fit first
9. ❌ **Cohort analytics** — Basic metrics first
10. ❌ **Custom fields on entities** — Add only when customers ask
11. ❌ **API keys for customers** — Most won't need it for first 6 months
12. ❌ **Push notifications** — Email is fine for first 100 customers
13. ❌ **2FA** — Add when SOC 2 requires it
14. ❌ **HIPAA / SOC 2** — When US healthcare becomes a target
15. ❌ **Internationalization of UI** — English/Hindi sufficient for India

---

# SECTION 22 — TOP 10 DECISIONS FOR THE FOUNDER

### Decision 1: Vertical Focus
**Pick ONE vertical and go deep.** Don't try to be all 5. Recommended: **Skin/Hair Clinic** — high call volume, easy demo, India market fits.

### Decision 2: Product Truth
**Decide what ZEROdesk actually is TODAY.** Either:
- (A) A demo/prototype to validate with 3-5 design partners (do not charge)
- (B) A managed service where engineering configures each customer (charge premium)
- (C) Self-serve SaaS (not possible today)

The current state of "looks like SaaS, works like demo" is the worst place to be.

### Decision 3: Mock UI Policy
**Either remove or clearly mark the mock UIs.** A "DEMO MODE" banner across voice/WhatsApp/KB/analytics/CRM pages is honest. Shipping them unlabeled is fraud-adjacent.

### Decision 4: First Customer Profile
**Hire a CSM or do it yourself for the first 10 customers.** Budget 16 hours per customer. They will need:
- Voice setup
- WhatsApp setup
- KB upload
- Prompt tuning
- Test calls
- Monitoring

### Decision 5: Stripe vs. Manual Billing
**Start with manual billing for first 3 customers.** Building Stripe integration is 2 weeks. Use UPI/NEFT for India market first.

### Decision 6: Voice Provider
**Pick ONE: Vapi or LiveKit.** Don't try to support both. Vapi is faster to start. LiveKit gives more control.

### Decision 7: WhatsApp Focus
**Get one WhatsApp customer working end-to-end before scaling.** The current code is sound but the customer-facing setup is broken.

### Decision 8: Pricing
**Public pricing must be defined before any sale.** Recommended:
- Starter: ₹2,999/month (100 voice min, 500 WhatsApp msg, 1 user)
- Growth: ₹9,999/month (500 voice min, 5000 WhatsApp msg, 5 users)
- Enterprise: Custom

### Decision 9: Security Posture
**Stop accumulating security debt.** Rotate keys now. Block P0s. Hire a security contractor for a 1-week pen test before public launch.

### Decision 10: Team Composition
**You need: 1 senior full-stack engineer (1 month to fix P0s), 1 DevOps (0.5 month to fix CI/CD), 1 QA (1 month to write critical tests).** Then 1 CSM for first 10 customers.

---

# SECTION 23 — FINAL SCORECARD

| Category | Score | Notes |
|---|---|---|
| Architecture | 78/100 | Strong NestJS design, but TenantPrismaService footgun |
| Code Quality | 65/100 | Mixed — backend solid, frontend has 50+ mock patterns |
| Frontend | 35/100 | Beautiful UI, 50+ routes are mock or localStorage |
| Backend | 75/100 | Solid services, but critical gaps in voice/retell/SIP |
| Database | 80/100 | Strong schema design, missing migrations, no backup |
| Security | 30/100 | **Critical**: real keys in git, XSS, no auth on endpoints |
| Multi-Tenancy | 70/100 | Strong in services, broken in voice webhooks |
| Authentication | 80/100 | Clerk integration good, but no 2FA, no CSRF |
| Voice AI | 55/100 | Vapi good, Retell broken, LiveKit partial |
| Telephony | 45/100 | SIP bug, broken Retell, no voicemail |
| WhatsApp | 75/100 | Backend works, frontend fake |
| AI | 60/100 | Multi-provider design, but unmetered + no validation |
| RAG | 65/100 | Architecture good, no frontend, no sanitization |
| Automation | 40/100 | n8n trigger exists, no real workflow engine |
| CRM | 55/100 | Backend works, frontend all mock |
| Appointments | 70/100 | Public booking works, internal mock |
| Analytics | 30/100 | Hardcoded values, no real aggregation |
| Billing | 20/100 | **No Stripe, manual only** |
| Testing | 15/100 | 7 spec files, 0 E2E, many critical paths untested |
| DevOps | 35/100 | CI exists, no deploy, no backup, no rollback |
| Observability | 50/100 | Sentry at 100% sampling, basic health check |
| Scalability | 55/100 | In-memory rate limiting, no distributed quotas |
| Reliability | 50/100 | Idempotency on webhooks good, no retries, no DLQ |
| UX | 60/100 | Polished design, broken empty states, no mobile nav |
| Product | 55/100 | Comprehensive scope, shallow depth, missing onboarding |
| Customer Success | 30/100 | 16hr per customer manual setup |
| GTM | 40/100 | Strong vision, no pricing, no trial flow |
| Pricing | 20/100 | Not defined in repo |
| Unit Economics | 30/100 | Unmetered LLM = unbounded liability |
| Competitive Position | 55/100 | Niche focus good, lacks key integrations |
| Operational Readiness | 30/100 | Founder-dependent, no monitoring |
| Launch Readiness | 25/100 | Critical security gaps, mock data dominance |

**Weighted Overall Score: 47/100**

**Confidence Level:** HIGH (based on direct code inspection of 100+ files)

**Top 10 Weaknesses:**
1. Production secrets in git
2. SIP tenant fallback bug (cross-tenant data contamination)
3. LLM token unmetered (unbounded cost)
4. No Stripe billing
5. 50+ frontend routes are mock/localStorage
6. Zero E2E tests
7. Stored XSS in invoice print
8. `public-book` endpoint has no auth
9. Retell integration broken (no field)
10. Onboarding flow missing

**Top 10 Strengths:**
1. Comprehensive NestJS architecture
2. Strong multi-tenant Prisma schema design
3. Clerk auth integration solid
4. WhatsApp backend (idempotency, quota) well-built
5. Voice Vapi integration complete
6. Multi-provider LLM abstraction
7. RAG with pgvector
8. Niche system (5 verticals)
9. Beautiful UI design
10. TCPA compliance in outbound calls

---

# SECTION 24 — FINAL CTO VERDICT

## **FIX FOUNDATION**

ZEROdesk is not ready for any form of public launch. The most honest description is **"internal alpha with critical security debt and significant UI mock data"**.

**The backend is 70% there. The frontend is 35% there. The security is 30% there.**

### What Must Happen in the Next 60 Days

**Week 1-2: Security Crisis Response (P0)**
- Rotate all exposed API keys
- Fix `public-book` and `service/search` auth gaps
- Fix SIP dispatch tenant fallback
- Implement LLM token metering
- Encrypt WhatsApp tokens at rest
- Fix invoice print XSS
- Remove hardcoded dev fallbacks

**Week 3-4: Foundation Wiring (P0)**
- Wire `getIndustryTemplate()` into prompts
- Add `retellPhoneNumber` field
- Implement real human transfer
- Build onboarding wizard
- Wire top 10 dashboard routes to real backend
- Implement Stripe billing (or manual billing for now)

**Week 5-8: Production Readiness (P1)**
- Distributed rate limiting
- Cross-tenant tests
- Backup strategy
- Monitoring alerts
- Documentation for customer setup
- Sentry sampling to 0.1
- Add audit log
- Add data export

**After 60 Days:** The product can be sold as **managed/concierge** to 3-5 design partner customers at premium pricing, with founder/CSM doing configuration.

**After 6 Months:** If the foundation work succeeds, ZEROdesk can be sold as **self-serve SaaS** to India SMB market for skin/dental/spa verticals.

### DO NOT launch as self-serve today. DO NOT take Stripe payments today. DO NOT show this to investors as "production ready."

The codebase has real engineering depth. The team understands multi-tenancy, voice AI, and Indian market requirements. With disciplined execution on the P0 list over 60 days, this can become a real product.

But shipping it to paying customers today would be:
- **Dangerous** (security risks)
- **Embarrassing** (mock data will be exposed)
- **Expensive** (unmetered AI costs)
- **Damaging** (to brand and trust)

**The right call is: stop, fix, then launch with confidence.**

---

# SECTION 25 — FINAL EXECUTIVE SUMMARY

```
ZEROdesk CURRENT STATUS (2026-09-07):

Product maturity:          45/100  — Internal alpha with critical gaps
Technical maturity:        60/100  — Strong backend, weak frontend integration
Security maturity:         30/100  — CRITICAL security debt
Scalability maturity:      55/100  — In-memory limits, no distributed quotas
Commercial readiness:      30/100  — No Stripe, no pricing, no trial flow
Operational readiness:     30/100  — Founder-dependent, no monitoring
Launch readiness:          25/100  — Not safe to launch

BIGGEST STRENGTH:          Comprehensive NestJS backend with proper multi-tenant design patterns
BIGGEST WEAKNESS:          50+ frontend dashboard routes are mock data or localStorage
BIGGEST SECURITY RISK:     Real API keys committed to git + XSS in invoice print
BIGGEST ARCHITECTURAL RISK: TenantPrismaService.forTenant() exposes raw prisma (latent bypass)
BIGGEST BUSINESS RISK:     LLM tokens never metered → unbounded customer costs
BIGGEST COST RISK:         Sentry at 100% sampling + unmetered LLM = cost explosion at scale
BIGGEST PRODUCT GAP:       No onboarding flow, no Stripe billing, no customer setup wizards
BIGGEST COMPETITIVE GAP:   No calendar integrations, no mobile apps, no white-label
BIGGEST HIDDEN PROBLEM:    Industry-specific AI prompts (hospital, hotel, real estate) exist in code but are never called

CAN LAUNCH NOW?            NO
UNDER WHAT MODEL?          NOT RECOMMENDED until P0 list addressed
WHAT MUST BE FIXED FIRST?  10 P0 items (security, metering, SIP bug, auth gaps)
WHAT CAN WAIT?             Calendar integration, mobile apps, white-label, marketplace
WHAT SHOULD NOT BE BUILT?  Custom fields, A/B testing, advanced workflow builder, 2FA

FINAL RECOMMENDATION:

   FIX FOUNDATION for 60 days. Then launch as MANAGED SERVICE with 3-5 
   design partner customers. Do NOT attempt self-serve SaaS for at 
   least 6 months.

   The codebase is well-built but is operating in a "demo state" while 
   pretending to be production. This is the worst possible position: 
   beautiful enough to sell, fragile enough to break. Cut the gap by 
   shipping the P0 list, then decide whether to scale or pivot.

   The team has real skill. The architecture is sound in the right 
   places. The product has real demand potential. The execution gap 
   is the only thing holding ZEROdesk back from being a real 
   business.

   Get the foundation right. Then everything else becomes possible.
```

---

**END OF AUDIT REPORT**

**Audit Type:** READ-ONLY FORENSIC — Zero modifications performed
**Repository State:** UNCHANGED
**Files Inspected:** ~150
**Lines of Evidence Collected:** ~400 distinct findings
**Audit Completion Date:** 2026-09-07
**Auditor:** Claude Code (MiniMax-M3)

---

## HOW TO USE THIS REPORT

This report is provided in **Markdown format** for easy reading on GitHub, in VS Code, or any Markdown viewer. It can be:

- **Saved as PDF:** Open in VS Code → Right-click → "Markdown PDF: Export to PDF"
- **Converted to Word:** Use pandoc: `pandoc ZEROdesk-Forensic-Audit-Report-2026-09-07.md -o audit.docx`
- **Printed:** Open in browser → Ctrl+P → Save as PDF
- **Shared:** Commit to a private GitHub repo or send as email attachment

**Recommended next steps:**
1. Save this report to a secure location
2. Share only with trusted advisors (contains sensitive security findings)
3. Use as a working document for the 60-day foundation fix
4. Do NOT publish publicly — it contains P0 security disclosures
