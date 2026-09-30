CREATE TABLE "automation_deliveries" (
 "id" UUID NOT NULL PRIMARY KEY,
 "tenant_id" UUID NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
 "business_key" TEXT NOT NULL,
 "status" TEXT NOT NULL DEFAULT 'PENDING',
 "provider_message_id" TEXT,
 "reason" TEXT,
 "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "updated_at" TIMESTAMPTZ NOT NULL
);
CREATE UNIQUE INDEX "automation_deliveries_tenant_id_business_key_key" ON "automation_deliveries"("tenant_id", "business_key");
CREATE INDEX "automation_deliveries_tenant_id_status_idx" ON "automation_deliveries"("tenant_id", "status");
ALTER TABLE "automation_deliveries" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_automation_deliveries" ON "automation_deliveries"
USING ("tenant_id" = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
WITH CHECK ("tenant_id" = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);
