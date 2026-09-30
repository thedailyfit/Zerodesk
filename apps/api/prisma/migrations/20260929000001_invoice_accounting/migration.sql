ALTER TABLE invoices
  ADD COLUMN paid_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN discount_type TEXT,
  ADD COLUMN discount_value DECIMAL(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN customer_name TEXT,
  ADD COLUMN customer_phone TEXT,
  ADD COLUMN customer_email TEXT;
-- Preserve recorded historical PAID status; operator must reconcile these legacy records.
UPDATE invoices SET paid_amount = total_amount WHERE status = 'PAID';
ALTER TABLE invoice_items
  ADD COLUMN gst_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
  ADD COLUMN gst_amount DECIMAL(12,2) NOT NULL DEFAULT 0;
