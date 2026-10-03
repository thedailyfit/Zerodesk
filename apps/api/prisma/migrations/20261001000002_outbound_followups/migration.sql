CREATE TABLE "outbound_follow_ups" (
  "id" UUID PRIMARY KEY,
  "tenant_id" UUID NOT NULL REFERENCES "tenants"("id"),
  "request_id" TEXT NOT NULL,
  "appointment_id" UUID,
  "phone_number" TEXT NOT NULL,
  "purpose" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PENDING' CHECK ("status" IN ('PENDING','DISPATCHED','COMPLETED','FAILED','UNREACHABLE')),
  "dispatch_started_at" TIMESTAMPTZ,
  "provider_request_id" TEXT,
  "call_uuid" TEXT UNIQUE,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL,
  UNIQUE ("tenant_id", "request_id")
);
CREATE INDEX "outbound_follow_ups_tenant_id_created_at_idx" ON "outbound_follow_ups"("tenant_id", "created_at");
ALTER TABLE "outbound_follow_ups" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON "outbound_follow_ups" USING (tenant_id::text = current_setting('app.current_tenant_id', true)) WITH CHECK (tenant_id::text = current_setting('app.current_tenant_id', true));
