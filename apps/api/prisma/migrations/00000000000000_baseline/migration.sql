-- Historical schema at f8fe9f46251f0ea0d1ed38935479d50eb7021fc2. Existing databases must verify equivalence before marking this baseline applied.
-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CreateTable
CREATE TABLE "tenants" (
    "id" UUID NOT NULL,
    "clerk_org_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "logo_url" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "settings" JSONB NOT NULL DEFAULT '{}',
    "subscription_tier" TEXT NOT NULL DEFAULT 'trial',
    "subscription_status" TEXT NOT NULL DEFAULT 'active',
    "plan_tier" TEXT NOT NULL DEFAULT 'starter',
    "onboarding_completed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,
    "assigned_llm_id" UUID,
    "assigned_fallback_llm_id" UUID,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_kyc" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "business_name" TEXT NOT NULL,
    "trade_name" TEXT,
    "gstin" TEXT,
    "pan_number" TEXT,
    "address_proof_url" TEXT,
    "id_proof_url" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "rejection_reason" TEXT,
    "verified_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "tenant_kyc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "clerk_user_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatar_url" TEXT,
    "role" TEXT NOT NULL DEFAULT 'STAFF',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "name" TEXT,
    "language" TEXT NOT NULL DEFAULT 'en',
    "lead_score" INTEGER NOT NULL DEFAULT 0,
    "sentiment" TEXT,
    "lifetime_value" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "ai_summary" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "first_seen_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_seen_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,
    "dnd_status" BOOLEAN NOT NULL DEFAULT false,
    "opted_out_at" TIMESTAMPTZ,
    "anonymized_at" TIMESTAMPTZ,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "channel" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "ai_summary" TEXT,
    "sentiment" TEXT,
    "resolution" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "started_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "conversation_id" UUID NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT,
    "media_url" TEXT,
    "media_type" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_documents" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "source_type" TEXT NOT NULL DEFAULT 'MANUAL',
    "file_key" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "error_message" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "knowledge_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_chunks" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "document_id" UUID NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "chunk_text" TEXT NOT NULL,
    "chunk_index" INTEGER NOT NULL,
    "embedding" vector(1536),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "knowledge_chunks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pipeline_stages" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "color" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pipeline_stages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "customer_id" UUID,
    "stage_id" UUID NOT NULL,
    "owner_id" UUID,
    "title" TEXT,
    "value" DECIMAL(12,2),
    "score" INTEGER NOT NULL DEFAULT 0,
    "source" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT,
    "won_at" TIMESTAMPTZ,
    "lost_at" TIMESTAMPTZ,
    "lost_reason" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activities" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "lead_id" UUID,
    "customer_id" UUID,
    "user_id" UUID,
    "type" TEXT NOT NULL,
    "content" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "lead_id" UUID,
    "assigned_to" UUID,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "due_date" TIMESTAMPTZ,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "duration_mins" INTEGER NOT NULL DEFAULT 30,
    "price" DECIMAL(10,2),
    "category" TEXT,
    "schedule_preset" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_members" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "user_id" UUID,
    "name" TEXT NOT NULL,
    "role_title" TEXT,
    "specialization" TEXT,
    "availability" JSONB NOT NULL DEFAULT '{}',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "staff_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointments" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "service_id" UUID,
    "staff_id" UUID,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "scheduled_at" TIMESTAMPTZ NOT NULL,
    "duration_mins" INTEGER NOT NULL DEFAULT 30,
    "notes" TEXT,
    "source" TEXT,
    "reminder_sent" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "voice_configs" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "plivo_phone_number" TEXT,
    "plivo_auth_id" TEXT,
    "plivo_auth_token" TEXT,
    "plivo_app_id" TEXT,
    "livekit_trunk_id" TEXT,
    "retell_phone_number" TEXT,
    "retell_agent_id" TEXT,
    "voice_personality" TEXT NOT NULL DEFAULT 'professional',
    "greeting" TEXT,
    "languages" TEXT[] DEFAULT ARRAY['en']::TEXT[],
    "transfer_number" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "settings" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "voice_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whatsapp_configs" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "waba_id" TEXT,
    "phone_number_id" TEXT,
    "display_phone" TEXT,
    "access_token" TEXT,
    "verify_token" TEXT,
    "greeting" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "settings" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "whatsapp_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_events" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "event_type" TEXT NOT NULL,
    "channel" TEXT,
    "customer_id" UUID,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_rollups" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "metric" TEXT NOT NULL,
    "dimension" TEXT,
    "dimension_value" TEXT,
    "value" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "daily_rollups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "plan" TEXT NOT NULL,
    "stripe_sub_id" TEXT,
    "stripe_cust_id" TEXT,
    "mrr" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "voice_minutes_limit" INTEGER NOT NULL DEFAULT 100,
    "voice_minutes_used" INTEGER NOT NULL DEFAULT 0,
    "whatsapp_messages_limit" INTEGER NOT NULL DEFAULT 500,
    "whatsapp_messages_used" INTEGER NOT NULL DEFAULT 0,
    "llm_tokens_limit" INTEGER NOT NULL DEFAULT 1000000,
    "llm_tokens_used" INTEGER NOT NULL DEFAULT 0,
    "storage_limit_mb" INTEGER NOT NULL DEFAULT 1000,
    "storage_used_mb" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "current_period_start" TIMESTAMPTZ,
    "current_period_end" TIMESTAMPTZ,
    "paused_until" TIMESTAMPTZ,
    "retention_discount_active" BOOLEAN NOT NULL DEFAULT false,
    "churn_reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "tenant_id" UUID,
    "user_id" UUID,
    "action" TEXT NOT NULL,
    "resource_type" TEXT NOT NULL,
    "resource_id" UUID,
    "details" JSONB NOT NULL DEFAULT '{}',
    "ip_address" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "global_voice_registries" (
    "id" UUID NOT NULL,
    "provider" TEXT NOT NULL,
    "voice_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "accent" TEXT,
    "preview_url" TEXT,
    "sample_text" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "global_voice_registries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "global_llm_registries" (
    "id" UUID NOT NULL,
    "provider" TEXT NOT NULL,
    "model_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "context_window" INTEGER NOT NULL DEFAULT 128000,
    "cost_per_1k_input" DECIMAL(10,5) NOT NULL DEFAULT 0.0025,
    "cost_per_1k_output" DECIMAL(10,5) NOT NULL DEFAULT 0.0100,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_fallback" BOOLEAN NOT NULL DEFAULT false,
    "category" TEXT NOT NULL DEFAULT 'flagship',
    "description" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "global_llm_registries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "customer_id" UUID,
    "invoice_number" TEXT NOT NULL,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "tax_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total_amount" DECIMAL(12,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PAID',
    "payment_method" TEXT,
    "notes" TEXT,
    "due_date" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_items" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "invoice_id" UUID NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unit_price" DECIMAL(12,2) NOT NULL,
    "total_price" DECIMAL(12,2) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoice_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automation_workflows" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'GENERAL',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "trigger_type" TEXT NOT NULL,
    "definition" JSONB NOT NULL DEFAULT '{}',
    "run_count" INTEGER NOT NULL DEFAULT 0,
    "last_run_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "automation_workflows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_consents" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "consent_type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'GRANTED',
    "granted_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMPTZ,
    "ip_address" TEXT,
    "channel" TEXT NOT NULL DEFAULT 'VOICE',

    CONSTRAINT "patient_consents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usage_ledgers" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "session_id" TEXT NOT NULL,
    "resource_type" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usage_ledgers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "llm_traces" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "conversation_id" UUID,
    "channel" TEXT NOT NULL,
    "user_query" TEXT NOT NULL,
    "raw_response" TEXT NOT NULL,
    "sanitized_query" TEXT,
    "provider" TEXT NOT NULL,
    "model_id" TEXT NOT NULL,
    "prompt_version" TEXT NOT NULL DEFAULT 'v1.0.0',
    "temperature" DOUBLE PRECISION NOT NULL DEFAULT 0.7,
    "latency_ms" INTEGER NOT NULL,
    "ttft_ms" INTEGER,
    "input_tokens" INTEGER NOT NULL DEFAULT 0,
    "output_tokens" INTEGER NOT NULL DEFAULT 0,
    "cost_usd" DECIMAL(10,6) NOT NULL DEFAULT 0,
    "retrieved_chunk_ids" TEXT[],
    "frozen_context" JSONB NOT NULL DEFAULT '[]',
    "top_similarity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "user_feedback_rating" INTEGER,
    "user_feedback_text" TEXT,
    "human_handoff_triggered" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "llm_traces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluation_scores" (
    "id" UUID NOT NULL,
    "trace_id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "context_relevance" DOUBLE PRECISION NOT NULL,
    "faithfulness" DOUBLE PRECISION NOT NULL,
    "answer_relevance" DOUBLE PRECISION NOT NULL,
    "hallucination_score" DOUBLE PRECISION NOT NULL,
    "claim_count" INTEGER NOT NULL DEFAULT 0,
    "supported_claim_count" INTEGER NOT NULL DEFAULT 0,
    "judge_model" TEXT NOT NULL,
    "judge_latency_ms" INTEGER NOT NULL,
    "claims_analysis" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evaluation_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bad_answer_flags" (
    "id" UUID NOT NULL,
    "trace_id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "flag_type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reason" TEXT NOT NULL,
    "suggested_fix" TEXT,
    "resolved_by_user_id" UUID,
    "resolved_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bad_answer_flags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "golden_test_cases" (
    "id" UUID NOT NULL,
    "tenant_id" UUID,
    "category" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'WEB_WIDGET',
    "expected_context_ids" TEXT[],
    "expected_entities" TEXT[],
    "forbidden_keywords" TEXT[],
    "expected_intent" TEXT NOT NULL,
    "expected_actions" JSONB NOT NULL DEFAULT '[]',
    "reference_answer" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "golden_test_cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_estates" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "agent_key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "human_owner_name" TEXT NOT NULL,
    "human_owner_role" TEXT NOT NULL,
    "allowed_tools" TEXT[],
    "touched_systems" TEXT[],
    "hard_limits" JSONB NOT NULL DEFAULT '{}',
    "goal_integrity_owner" TEXT,
    "authority_owner" TEXT,
    "supply_chain_owner" TEXT,
    "blast_radius_owner" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "agent_estates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "action_traces" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "agent_estate_id" UUID,
    "trace_id" UUID,
    "channel" TEXT NOT NULL,
    "action_name" TEXT NOT NULL,
    "target_resource" TEXT NOT NULL,
    "parameters" JSONB NOT NULL DEFAULT '{}',
    "policy_decision" TEXT NOT NULL DEFAULT 'ALLOWED',
    "policy_rule_id" TEXT,
    "execution_status" TEXT NOT NULL,
    "entity_id" TEXT,
    "error_message" TEXT,
    "latency_ms" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "action_traces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_tickets" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "category" TEXT NOT NULL DEFAULT 'GENERAL',
    "contact_email" TEXT,
    "contact_phone" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_TenantAllowedVoices" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_TenantAllowedVoices_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_clerk_org_id_key" ON "tenants"("clerk_org_id");

-- CreateIndex
CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_kyc_tenant_id_key" ON "tenant_kyc"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_clerk_user_id_key" ON "users"("clerk_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "customers_id_tenant_id_key" ON "customers"("id", "tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "customers_tenant_id_phone_key" ON "customers"("tenant_id", "phone");

-- CreateIndex
CREATE UNIQUE INDEX "customers_tenant_id_email_key" ON "customers"("tenant_id", "email");

-- CreateIndex
CREATE INDEX "conversations_tenant_id_customer_id_idx" ON "conversations"("tenant_id", "customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "conversations_id_tenant_id_key" ON "conversations"("id", "tenant_id");

-- CreateIndex
CREATE INDEX "messages_tenant_id_conversation_id_created_at_idx" ON "messages"("tenant_id", "conversation_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "messages_id_tenant_id_key" ON "messages"("id", "tenant_id");

-- CreateIndex
CREATE INDEX "knowledge_documents_tenant_id_status_idx" ON "knowledge_documents"("tenant_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "knowledge_documents_id_tenant_id_key" ON "knowledge_documents"("id", "tenant_id");

-- CreateIndex
CREATE INDEX "knowledge_chunks_tenant_id_document_id_version_idx" ON "knowledge_chunks"("tenant_id", "document_id", "version");

-- CreateIndex
CREATE UNIQUE INDEX "pipeline_stages_tenant_id_slug_key" ON "pipeline_stages"("tenant_id", "slug");

-- CreateIndex
CREATE INDEX "leads_tenant_id_stage_id_idx" ON "leads"("tenant_id", "stage_id");

-- CreateIndex
CREATE INDEX "leads_tenant_id_customer_id_idx" ON "leads"("tenant_id", "customer_id");

-- CreateIndex
CREATE INDEX "leads_tenant_id_owner_id_idx" ON "leads"("tenant_id", "owner_id");

-- CreateIndex
CREATE UNIQUE INDEX "leads_id_tenant_id_key" ON "leads"("id", "tenant_id");

-- CreateIndex
CREATE INDEX "activities_tenant_id_customer_id_idx" ON "activities"("tenant_id", "customer_id");

-- CreateIndex
CREATE INDEX "activities_tenant_id_lead_id_idx" ON "activities"("tenant_id", "lead_id");

-- CreateIndex
CREATE INDEX "activities_tenant_id_user_id_idx" ON "activities"("tenant_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "activities_id_tenant_id_key" ON "activities"("id", "tenant_id");

-- CreateIndex
CREATE INDEX "tasks_tenant_id_assigned_to_idx" ON "tasks"("tenant_id", "assigned_to");

-- CreateIndex
CREATE INDEX "tasks_tenant_id_lead_id_idx" ON "tasks"("tenant_id", "lead_id");

-- CreateIndex
CREATE UNIQUE INDEX "tasks_id_tenant_id_key" ON "tasks"("id", "tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "services_id_tenant_id_key" ON "services"("id", "tenant_id");

-- CreateIndex
CREATE INDEX "staff_members_tenant_id_user_id_idx" ON "staff_members"("tenant_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "staff_members_id_tenant_id_key" ON "staff_members"("id", "tenant_id");

-- CreateIndex
CREATE INDEX "idx_tenant_slot_staff" ON "appointments"("tenant_id", "scheduled_at", "staff_id");

-- CreateIndex
CREATE INDEX "appointments_tenant_id_scheduled_at_status_idx" ON "appointments"("tenant_id", "scheduled_at", "status");

-- CreateIndex
CREATE INDEX "appointments_tenant_id_customer_id_idx" ON "appointments"("tenant_id", "customer_id");

-- CreateIndex
CREATE INDEX "appointments_tenant_id_service_id_idx" ON "appointments"("tenant_id", "service_id");

-- CreateIndex
CREATE INDEX "appointments_tenant_id_staff_id_idx" ON "appointments"("tenant_id", "staff_id");

-- CreateIndex
CREATE UNIQUE INDEX "appointments_id_tenant_id_key" ON "appointments"("id", "tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "voice_configs_tenant_id_key" ON "voice_configs"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "voice_configs_plivo_phone_number_key" ON "voice_configs"("plivo_phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "voice_configs_retell_phone_number_key" ON "voice_configs"("retell_phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "whatsapp_configs_tenant_id_key" ON "whatsapp_configs"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "whatsapp_configs_phone_number_id_key" ON "whatsapp_configs"("phone_number_id");

-- CreateIndex
CREATE INDEX "analytics_events_tenant_id_event_type_created_at_idx" ON "analytics_events"("tenant_id", "event_type", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "daily_rollups_tenant_id_date_metric_dimension_dimension_val_key" ON "daily_rollups"("tenant_id", "date", "metric", "dimension", "dimension_value");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_tenant_id_key" ON "subscriptions"("tenant_id");

-- CreateIndex
CREATE INDEX "audit_logs_tenant_id_created_at_idx" ON "audit_logs"("tenant_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "global_voice_registries_voice_id_key" ON "global_voice_registries"("voice_id");

-- CreateIndex
CREATE UNIQUE INDEX "global_llm_registries_model_id_key" ON "global_llm_registries"("model_id");

-- CreateIndex
CREATE INDEX "invoices_tenant_id_customer_id_idx" ON "invoices"("tenant_id", "customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_id_tenant_id_key" ON "invoices"("id", "tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_tenant_id_invoice_number_key" ON "invoices"("tenant_id", "invoice_number");

-- CreateIndex
CREATE INDEX "invoice_items_tenant_id_idx" ON "invoice_items"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "invoice_items_id_tenant_id_key" ON "invoice_items"("id", "tenant_id");

-- CreateIndex
CREATE INDEX "automation_workflows_tenant_id_trigger_type_idx" ON "automation_workflows"("tenant_id", "trigger_type");

-- CreateIndex
CREATE UNIQUE INDEX "automation_workflows_id_tenant_id_key" ON "automation_workflows"("id", "tenant_id");

-- CreateIndex
CREATE INDEX "patient_consents_tenant_id_customer_id_consent_type_idx" ON "patient_consents"("tenant_id", "customer_id", "consent_type");

-- CreateIndex
CREATE INDEX "usage_ledgers_tenant_id_resource_type_idx" ON "usage_ledgers"("tenant_id", "resource_type");

-- CreateIndex
CREATE UNIQUE INDEX "usage_ledgers_tenant_id_session_id_resource_type_key" ON "usage_ledgers"("tenant_id", "session_id", "resource_type");

-- CreateIndex
CREATE INDEX "llm_traces_tenant_id_created_at_idx" ON "llm_traces"("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX "llm_traces_tenant_id_channel_created_at_idx" ON "llm_traces"("tenant_id", "channel", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "evaluation_scores_trace_id_key" ON "evaluation_scores"("trace_id");

-- CreateIndex
CREATE INDEX "evaluation_scores_tenant_id_created_at_idx" ON "evaluation_scores"("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX "bad_answer_flags_tenant_id_status_severity_idx" ON "bad_answer_flags"("tenant_id", "status", "severity");

-- CreateIndex
CREATE UNIQUE INDEX "agent_estates_tenant_id_agent_key_key" ON "agent_estates"("tenant_id", "agent_key");

-- CreateIndex
CREATE INDEX "action_traces_tenant_id_action_name_created_at_idx" ON "action_traces"("tenant_id", "action_name", "created_at");

-- CreateIndex
CREATE INDEX "action_traces_tenant_id_execution_status_idx" ON "action_traces"("tenant_id", "execution_status");

-- CreateIndex
CREATE INDEX "support_tickets_tenant_id_idx" ON "support_tickets"("tenant_id");

-- CreateIndex
CREATE INDEX "support_tickets_status_idx" ON "support_tickets"("status");

-- CreateIndex
CREATE INDEX "_TenantAllowedVoices_B_index" ON "_TenantAllowedVoices"("B");

-- AddForeignKey
ALTER TABLE "tenants" ADD CONSTRAINT "tenants_assigned_llm_id_fkey" FOREIGN KEY ("assigned_llm_id") REFERENCES "global_llm_registries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenants" ADD CONSTRAINT "tenants_assigned_fallback_llm_id_fkey" FOREIGN KEY ("assigned_fallback_llm_id") REFERENCES "global_llm_registries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_kyc" ADD CONSTRAINT "tenant_kyc_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_documents" ADD CONSTRAINT "knowledge_documents_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_chunks" ADD CONSTRAINT "knowledge_chunks_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_chunks" ADD CONSTRAINT "knowledge_chunks_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "knowledge_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pipeline_stages" ADD CONSTRAINT "pipeline_stages_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_stage_id_fkey" FOREIGN KEY ("stage_id") REFERENCES "pipeline_stages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_members" ADD CONSTRAINT "staff_members_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voice_configs" ADD CONSTRAINT "voice_configs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whatsapp_configs" ADD CONSTRAINT "whatsapp_configs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_rollups" ADD CONSTRAINT "daily_rollups_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automation_workflows" ADD CONSTRAINT "automation_workflows_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_consents" ADD CONSTRAINT "patient_consents_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_consents" ADD CONSTRAINT "patient_consents_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage_ledgers" ADD CONSTRAINT "usage_ledgers_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "llm_traces" ADD CONSTRAINT "llm_traces_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluation_scores" ADD CONSTRAINT "evaluation_scores_trace_id_fkey" FOREIGN KEY ("trace_id") REFERENCES "llm_traces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bad_answer_flags" ADD CONSTRAINT "bad_answer_flags_trace_id_fkey" FOREIGN KEY ("trace_id") REFERENCES "llm_traces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_estates" ADD CONSTRAINT "agent_estates_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "action_traces" ADD CONSTRAINT "action_traces_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "action_traces" ADD CONSTRAINT "action_traces_agent_estate_id_fkey" FOREIGN KEY ("agent_estate_id") REFERENCES "agent_estates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TenantAllowedVoices" ADD CONSTRAINT "_TenantAllowedVoices_A_fkey" FOREIGN KEY ("A") REFERENCES "global_voice_registries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TenantAllowedVoices" ADD CONSTRAINT "_TenantAllowedVoices_B_fkey" FOREIGN KEY ("B") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
