-- ==============================================================================
-- ZEROdesk Row-Level Security (RLS) Policies Migration
-- Ensures database-level multi-tenant isolation without locking out backend ORM
-- ==============================================================================

-- 1. Enable RLS on Tenant-Scoped Tables
ALTER TABLE "customers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "conversations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "messages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "appointments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "services" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "staff_members" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "leads" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tasks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "activities" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "invoices" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "knowledge_documents" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "knowledge_chunks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "automation_workflows" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "invoice_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "invoice_items" NO FORCE ROW LEVEL SECURITY;

-- 2. Ensure table owner (postgres / service_role) is NOT locked out by un-forcing RLS
ALTER TABLE "customers" NO FORCE ROW LEVEL SECURITY;
ALTER TABLE "conversations" NO FORCE ROW LEVEL SECURITY;
ALTER TABLE "messages" NO FORCE ROW LEVEL SECURITY;
ALTER TABLE "appointments" NO FORCE ROW LEVEL SECURITY;
ALTER TABLE "services" NO FORCE ROW LEVEL SECURITY;
ALTER TABLE "staff_members" NO FORCE ROW LEVEL SECURITY;
ALTER TABLE "leads" NO FORCE ROW LEVEL SECURITY;
ALTER TABLE "tasks" NO FORCE ROW LEVEL SECURITY;
ALTER TABLE "activities" NO FORCE ROW LEVEL SECURITY;
ALTER TABLE "invoices" NO FORCE ROW LEVEL SECURITY;
ALTER TABLE "knowledge_documents" NO FORCE ROW LEVEL SECURITY;
ALTER TABLE "knowledge_chunks" NO FORCE ROW LEVEL SECURITY;
ALTER TABLE "automation_workflows" NO FORCE ROW LEVEL SECURITY;

-- 3. Drop existing policies if any
DROP POLICY IF EXISTS tenant_isolation_customers ON "customers";
DROP POLICY IF EXISTS tenant_isolation_conversations ON "conversations";
DROP POLICY IF EXISTS tenant_isolation_messages ON "messages";
DROP POLICY IF EXISTS tenant_isolation_appointments ON "appointments";
DROP POLICY IF EXISTS tenant_isolation_services ON "services";
DROP POLICY IF EXISTS tenant_isolation_staff_members ON "staff_members";
DROP POLICY IF EXISTS tenant_isolation_leads ON "leads";
DROP POLICY IF EXISTS tenant_isolation_tasks ON "tasks";
DROP POLICY IF EXISTS tenant_isolation_activities ON "activities";
DROP POLICY IF EXISTS tenant_isolation_invoices ON "invoices";
DROP POLICY IF EXISTS tenant_isolation_knowledge_documents ON "knowledge_documents";
DROP POLICY IF EXISTS tenant_isolation_knowledge_chunks ON "knowledge_chunks";
DROP POLICY IF EXISTS tenant_isolation_automation_workflows ON "automation_workflows";

-- 4. Define resilient RLS isolation policies
-- Grants full access to administrative backend roles (postgres, service_role, supabase_admin)
-- and isolates client/anon/authenticated roles strictly by 'app.current_tenant_id'
CREATE POLICY tenant_isolation_customers ON "customers"
    FOR ALL
    USING (
      session_user IN ('postgres', 'service_role', 'supabase_admin')
      OR "tenant_id" = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
    );

CREATE POLICY tenant_isolation_conversations ON "conversations"
    FOR ALL
    USING (
      session_user IN ('postgres', 'service_role', 'supabase_admin')
      OR "tenant_id" = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
    );

CREATE POLICY tenant_isolation_messages ON "messages"
    FOR ALL
    USING (
      session_user IN ('postgres', 'service_role', 'supabase_admin')
      OR "tenant_id" = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
    );

CREATE POLICY tenant_isolation_appointments ON "appointments"
    FOR ALL
    USING (
      session_user IN ('postgres', 'service_role', 'supabase_admin')
      OR "tenant_id" = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
    );

CREATE POLICY tenant_isolation_services ON "services"
    FOR ALL
    USING (
      session_user IN ('postgres', 'service_role', 'supabase_admin')
      OR "tenant_id" = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
    );

CREATE POLICY tenant_isolation_staff_members ON "staff_members"
    FOR ALL
    USING (
      session_user IN ('postgres', 'service_role', 'supabase_admin')
      OR "tenant_id" = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
    );

CREATE POLICY tenant_isolation_leads ON "leads"
    FOR ALL
    USING (
      session_user IN ('postgres', 'service_role', 'supabase_admin')
      OR "tenant_id" = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
    );

CREATE POLICY tenant_isolation_tasks ON "tasks"
    FOR ALL
    USING (
      session_user IN ('postgres', 'service_role', 'supabase_admin')
      OR "tenant_id" = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
    );

CREATE POLICY tenant_isolation_activities ON "activities"
    FOR ALL
    USING (
      session_user IN ('postgres', 'service_role', 'supabase_admin')
      OR "tenant_id" = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
    );

CREATE POLICY tenant_isolation_invoices ON "invoices"
    FOR ALL
    USING (
      session_user IN ('postgres', 'service_role', 'supabase_admin')
      OR "tenant_id" = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
    );

CREATE POLICY tenant_isolation_invoice_items ON "invoice_items"
    FOR ALL
    USING (
      session_user IN ('postgres', 'service_role', 'supabase_admin')
      OR "tenant_id" = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
    );

CREATE POLICY tenant_isolation_knowledge_documents ON "knowledge_documents"
    FOR ALL
    USING (
      session_user IN ('postgres', 'service_role', 'supabase_admin')
      OR "tenant_id" = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
    );

CREATE POLICY tenant_isolation_knowledge_chunks ON "knowledge_chunks"
    FOR ALL
    USING (
      session_user IN ('postgres', 'service_role', 'supabase_admin')
      OR "tenant_id" = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
    );

CREATE POLICY tenant_isolation_automation_workflows ON "automation_workflows"
    FOR ALL
    USING (
      session_user IN ('postgres', 'service_role', 'supabase_admin')
      OR "tenant_id" = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
    );

-- 5. High-Performance HNSW Vector Index on pgvector embeddings
CREATE INDEX IF NOT EXISTS knowledge_chunks_embedding_hnsw_idx 
ON "knowledge_chunks" USING hnsw (embedding vector_cosine_ops);
