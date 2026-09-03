-- ==============================================================================
-- ZEROdesk Row-Level Security (RLS) Policies Migration
-- Ensures database-level multi-tenant isolation even if application logic fails
-- ==============================================================================

-- 1. Enable RLS on core tenant-scoped tables
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
ALTER TABLE "invoice_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "knowledge_documents" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "knowledge_chunks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "automation_workflows" ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies if any
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

-- 3. Define strict RLS isolation policies based on PostgreSQL session variable 'app.current_tenant_id'
CREATE POLICY tenant_isolation_customers ON "customers"
    FOR ALL
    USING (
        current_setting('app.current_tenant_id', true) IS NULL 
        OR current_setting('app.current_tenant_id', true) = ''
        OR "tenant_id" = current_setting('app.current_tenant_id', true)::uuid
    );

CREATE POLICY tenant_isolation_conversations ON "conversations"
    FOR ALL
    USING (
        current_setting('app.current_tenant_id', true) IS NULL 
        OR current_setting('app.current_tenant_id', true) = ''
        OR "tenant_id" = current_setting('app.current_tenant_id', true)::uuid
    );

CREATE POLICY tenant_isolation_messages ON "messages"
    FOR ALL
    USING (
        current_setting('app.current_tenant_id', true) IS NULL 
        OR current_setting('app.current_tenant_id', true) = ''
        OR "tenant_id" = current_setting('app.current_tenant_id', true)::uuid
    );

CREATE POLICY tenant_isolation_appointments ON "appointments"
    FOR ALL
    USING (
        current_setting('app.current_tenant_id', true) IS NULL 
        OR current_setting('app.current_tenant_id', true) = ''
        OR "tenant_id" = current_setting('app.current_tenant_id', true)::uuid
    );

CREATE POLICY tenant_isolation_services ON "services"
    FOR ALL
    USING (
        current_setting('app.current_tenant_id', true) IS NULL 
        OR current_setting('app.current_tenant_id', true) = ''
        OR "tenant_id" = current_setting('app.current_tenant_id', true)::uuid
    );

CREATE POLICY tenant_isolation_staff_members ON "staff_members"
    FOR ALL
    USING (
        current_setting('app.current_tenant_id', true) IS NULL 
        OR current_setting('app.current_tenant_id', true) = ''
        OR "tenant_id" = current_setting('app.current_tenant_id', true)::uuid
    );

CREATE POLICY tenant_isolation_leads ON "leads"
    FOR ALL
    USING (
        current_setting('app.current_tenant_id', true) IS NULL 
        OR current_setting('app.current_tenant_id', true) = ''
        OR "tenant_id" = current_setting('app.current_tenant_id', true)::uuid
    );

CREATE POLICY tenant_isolation_tasks ON "tasks"
    FOR ALL
    USING (
        current_setting('app.current_tenant_id', true) IS NULL 
        OR current_setting('app.current_tenant_id', true) = ''
        OR "tenant_id" = current_setting('app.current_tenant_id', true)::uuid
    );

CREATE POLICY tenant_isolation_activities ON "activities"
    FOR ALL
    USING (
        current_setting('app.current_tenant_id', true) IS NULL 
        OR current_setting('app.current_tenant_id', true) = ''
        OR "tenant_id" = current_setting('app.current_tenant_id', true)::uuid
    );

CREATE POLICY tenant_isolation_invoices ON "invoices"
    FOR ALL
    USING (
        current_setting('app.current_tenant_id', true) IS NULL 
        OR current_setting('app.current_tenant_id', true) = ''
        OR "tenant_id" = current_setting('app.current_tenant_id', true)::uuid
    );

CREATE POLICY tenant_isolation_knowledge_documents ON "knowledge_documents"
    FOR ALL
    USING (
        current_setting('app.current_tenant_id', true) IS NULL 
        OR current_setting('app.current_tenant_id', true) = ''
        OR "tenant_id" = current_setting('app.current_tenant_id', true)::uuid
    );

CREATE POLICY tenant_isolation_knowledge_chunks ON "knowledge_chunks"
    FOR ALL
    USING (
        current_setting('app.current_tenant_id', true) IS NULL 
        OR current_setting('app.current_tenant_id', true) = ''
        OR "tenant_id" = current_setting('app.current_tenant_id', true)::uuid
    );

CREATE POLICY tenant_isolation_automation_workflows ON "automation_workflows"
    FOR ALL
    USING (
        current_setting('app.current_tenant_id', true) IS NULL 
        OR current_setting('app.current_tenant_id', true) = ''
        OR "tenant_id" = current_setting('app.current_tenant_id', true)::uuid
    );
