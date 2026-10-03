-- Tenant role policies. The migration/administration role remains privileged.
-- Never grant the tenant application role table ownership, SUPERUSER or BYPASSRLS.
ALTER TABLE "outbound_follow_ups" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "outbound_follow_ups";
DROP POLICY IF EXISTS tenant_isolation_outbound_follow_ups ON "outbound_follow_ups";
CREATE POLICY tenant_isolation_outbound_follow_ups ON "outbound_follow_ups" FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

ALTER TABLE "tenant_kyc" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_tenant_kyc ON "tenant_kyc";
CREATE POLICY tenant_isolation_tenant_kyc ON "tenant_kyc" FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_users ON "users";
CREATE POLICY tenant_isolation_users ON "users" FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

ALTER TABLE "customers" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_customers ON "customers";
CREATE POLICY tenant_isolation_customers ON "customers" FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

ALTER TABLE "conversations" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_conversations ON "conversations";
CREATE POLICY tenant_isolation_conversations ON "conversations" FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

ALTER TABLE "messages" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_messages ON "messages";
CREATE POLICY tenant_isolation_messages ON "messages" FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

ALTER TABLE "knowledge_documents" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_knowledge_documents ON "knowledge_documents";
CREATE POLICY tenant_isolation_knowledge_documents ON "knowledge_documents" FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

ALTER TABLE "knowledge_chunks" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_knowledge_chunks ON "knowledge_chunks";
CREATE POLICY tenant_isolation_knowledge_chunks ON "knowledge_chunks" FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

ALTER TABLE "pipeline_stages" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_pipeline_stages ON "pipeline_stages";
CREATE POLICY tenant_isolation_pipeline_stages ON "pipeline_stages" FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

ALTER TABLE "leads" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_leads ON "leads";
CREATE POLICY tenant_isolation_leads ON "leads" FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

ALTER TABLE "activities" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_activities ON "activities";
CREATE POLICY tenant_isolation_activities ON "activities" FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

ALTER TABLE "tasks" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_tasks ON "tasks";
CREATE POLICY tenant_isolation_tasks ON "tasks" FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

ALTER TABLE "services" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_services ON "services";
CREATE POLICY tenant_isolation_services ON "services" FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

ALTER TABLE "staff_members" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_staff_members ON "staff_members";
CREATE POLICY tenant_isolation_staff_members ON "staff_members" FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

ALTER TABLE "appointments" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_appointments ON "appointments";
CREATE POLICY tenant_isolation_appointments ON "appointments" FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

ALTER TABLE "voice_configs" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_voice_configs ON "voice_configs";
CREATE POLICY tenant_isolation_voice_configs ON "voice_configs" FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

ALTER TABLE "whatsapp_configs" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_whatsapp_configs ON "whatsapp_configs";
CREATE POLICY tenant_isolation_whatsapp_configs ON "whatsapp_configs" FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

ALTER TABLE "analytics_events" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_analytics_events ON "analytics_events";
CREATE POLICY tenant_isolation_analytics_events ON "analytics_events" FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

ALTER TABLE "daily_rollups" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_daily_rollups ON "daily_rollups";
CREATE POLICY tenant_isolation_daily_rollups ON "daily_rollups" FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

ALTER TABLE "subscriptions" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_subscriptions ON "subscriptions";
CREATE POLICY tenant_isolation_subscriptions ON "subscriptions" FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_audit_logs ON "audit_logs";
CREATE POLICY tenant_isolation_audit_logs ON "audit_logs" FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

ALTER TABLE "invoices" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_invoices ON "invoices";
CREATE POLICY tenant_isolation_invoices ON "invoices" FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

ALTER TABLE "invoice_items" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_invoice_items ON "invoice_items";
CREATE POLICY tenant_isolation_invoice_items ON "invoice_items" FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

ALTER TABLE "automation_deliveries" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_automation_deliveries ON "automation_deliveries";
CREATE POLICY tenant_isolation_automation_deliveries ON "automation_deliveries" FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

ALTER TABLE "automation_workflows" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_automation_workflows ON "automation_workflows";
CREATE POLICY tenant_isolation_automation_workflows ON "automation_workflows" FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

ALTER TABLE "automation_runs" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_automation_runs ON "automation_runs";
CREATE POLICY tenant_isolation_automation_runs ON "automation_runs" FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

ALTER TABLE "patient_consents" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_patient_consents ON "patient_consents";
CREATE POLICY tenant_isolation_patient_consents ON "patient_consents" FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

ALTER TABLE "usage_ledgers" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_usage_ledgers ON "usage_ledgers";
CREATE POLICY tenant_isolation_usage_ledgers ON "usage_ledgers" FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

ALTER TABLE "llm_traces" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_llm_traces ON "llm_traces";
CREATE POLICY tenant_isolation_llm_traces ON "llm_traces" FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

ALTER TABLE "evaluation_scores" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_evaluation_scores ON "evaluation_scores";
CREATE POLICY tenant_isolation_evaluation_scores ON "evaluation_scores" FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

ALTER TABLE "bad_answer_flags" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_bad_answer_flags ON "bad_answer_flags";
CREATE POLICY tenant_isolation_bad_answer_flags ON "bad_answer_flags" FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

ALTER TABLE "golden_test_cases" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_golden_test_cases ON "golden_test_cases";
CREATE POLICY tenant_isolation_golden_test_cases ON "golden_test_cases" FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

ALTER TABLE "agent_estates" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_agent_estates ON "agent_estates";
CREATE POLICY tenant_isolation_agent_estates ON "agent_estates" FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

ALTER TABLE "action_traces" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_action_traces ON "action_traces";
CREATE POLICY tenant_isolation_action_traces ON "action_traces" FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

ALTER TABLE "support_tickets" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_support_tickets ON "support_tickets";
CREATE POLICY tenant_isolation_support_tickets ON "support_tickets" FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);
