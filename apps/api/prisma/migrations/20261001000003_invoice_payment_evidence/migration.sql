-- Preserve legacy claims for reconciliation; never treat a historical status as a receipt.
ALTER TABLE invoices
  ADD COLUMN manual_cash_receipt_id TEXT,
  ADD COLUMN payment_verified_by TEXT,
  ADD COLUMN payment_verified_at TIMESTAMPTZ,
  ADD COLUMN legacy_paid_amount DECIMAL(12,2),
  ALTER COLUMN status SET DEFAULT 'PENDING';
UPDATE invoices SET legacy_paid_amount = paid_amount, paid_amount = 0, status = 'PAYMENT_REVIEW'
WHERE paid_amount > 0 OR status = 'PAID';
CREATE UNIQUE INDEX invoices_tenant_id_manual_cash_receipt_id_key
  ON invoices(tenant_id, manual_cash_receipt_id);
ALTER TABLE invoices ADD CONSTRAINT invoices_payment_evidence_check CHECK (
  (paid_amount = 0 AND status <> 'PAID') OR
  (manual_cash_receipt_id IS NOT NULL AND length(trim(manual_cash_receipt_id)) > 0
    AND payment_verified_by IS NOT NULL AND length(trim(payment_verified_by)) > 0
    AND payment_verified_at IS NOT NULL
    AND payment_method IS NOT NULL AND payment_method = 'CASH')
);
