-- ============================================================
-- ROW LEVEL SECURITY (RLS) ENGINE POLICIES FOR ZERO DESK
-- Protects tenant isolation directly at the PostgreSQL engine level
-- ============================================================

-- 1. Enable RLS on all Tenant-scoped tables
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "customers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "conversations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "messages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "knowledge_documents" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "knowledge_chunks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "pipeline_stages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "leads" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "activities" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tasks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "services" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "staff_members" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "appointments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "voice_configs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "whatsapp_configs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "analytics_events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "daily_rollups" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "subscriptions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;

-- 2. Define Tenant Session Isolation Function
CREATE OR REPLACE FUNCTION get_current_tenant_id() RETURNS UUID AS $$
BEGIN
  RETURN NULLIF(current_setting('app.current_tenant_id', true), '')::uuid;
END;
$$ LANGUAGE plpgsql STABLE;

-- 3. Apply Strict RLS Security Policies for each Table

-- Users
DROP POLICY IF EXISTS tenant_isolation_users ON "users";
CREATE POLICY tenant_isolation_users ON "users"
  FOR ALL
  USING (tenant_id = get_current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true');

-- Customers
DROP POLICY IF EXISTS tenant_isolation_customers ON "customers";
CREATE POLICY tenant_isolation_customers ON "customers"
  FOR ALL
  USING (tenant_id = get_current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true');

-- Conversations
DROP POLICY IF EXISTS tenant_isolation_conversations ON "conversations";
CREATE POLICY tenant_isolation_conversations ON "conversations"
  FOR ALL
  USING (tenant_id = get_current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true');

-- Messages
DROP POLICY IF EXISTS tenant_isolation_messages ON "messages";
CREATE POLICY tenant_isolation_messages ON "messages"
  FOR ALL
  USING (tenant_id = get_current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true');

-- Knowledge Documents & Chunks
DROP POLICY IF EXISTS tenant_isolation_knowledge_documents ON "knowledge_documents";
CREATE POLICY tenant_isolation_knowledge_documents ON "knowledge_documents"
  FOR ALL
  USING (tenant_id = get_current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true');

DROP POLICY IF EXISTS tenant_isolation_knowledge_chunks ON "knowledge_chunks";
CREATE POLICY tenant_isolation_knowledge_chunks ON "knowledge_chunks"
  FOR ALL
  USING (tenant_id = get_current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true');

-- Leads
DROP POLICY IF EXISTS tenant_isolation_leads ON "leads";
CREATE POLICY tenant_isolation_leads ON "leads"
  FOR ALL
  USING (tenant_id = get_current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true');

-- Appointments
DROP POLICY IF EXISTS tenant_isolation_appointments ON "appointments";
CREATE POLICY tenant_isolation_appointments ON "appointments"
  FOR ALL
  USING (tenant_id = get_current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true');

-- Staff & Services
DROP POLICY IF EXISTS tenant_isolation_staff_members ON "staff_members";
CREATE POLICY tenant_isolation_staff_members ON "staff_members"
  FOR ALL
  USING (tenant_id = get_current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true');

DROP POLICY IF EXISTS tenant_isolation_services ON "services";
CREATE POLICY tenant_isolation_services ON "services"
  FOR ALL
  USING (tenant_id = get_current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true');

-- Audit Logs
DROP POLICY IF EXISTS tenant_isolation_audit_logs ON "audit_logs";
CREATE POLICY tenant_isolation_audit_logs ON "audit_logs"
  FOR ALL
  USING (tenant_id = get_current_tenant_id() OR current_setting('app.is_super_admin', true) = 'true');
