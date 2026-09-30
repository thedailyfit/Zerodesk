-- Apply before deploying the transactional billing webhook handler.
CREATE TABLE "billing_webhook_events" (
    "key" TEXT NOT NULL,
    "processed_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "billing_webhook_events_pkey" PRIMARY KEY ("key")
);

-- Provider receipts are backend-only and contain no webhook bodies.
REVOKE ALL ON TABLE "billing_webhook_events" FROM PUBLIC;
