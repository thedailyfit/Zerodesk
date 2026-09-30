CREATE TABLE "automation_runs" (
  "id" UUID NOT NULL,
  "tenant_id" UUID NOT NULL,
  "workflow_id" UUID NOT NULL,
  "request_id" UUID NOT NULL,
  "definition" JSONB NOT NULL,
  "payload" JSONB NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "reason" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL,
  CONSTRAINT "automation_runs_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "automation_runs_workflow_id_tenant_id_fkey" FOREIGN KEY ("workflow_id", "tenant_id") REFERENCES "automation_workflows"("id", "tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "automation_runs_tenant_id_request_id_key" ON "automation_runs"("tenant_id", "request_id");
CREATE INDEX "automation_runs_tenant_id_workflow_id_created_at_idx" ON "automation_runs"("tenant_id", "workflow_id", "created_at");
