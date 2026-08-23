-- ============================================================
-- Migration 002: Rename n8n sync columns to email dispatch columns
-- Table: orders
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================

-- Step 1: Rename n8n_synced_at → email_sent_at
ALTER TABLE orders
    RENAME COLUMN n8n_synced_at TO email_sent_at;

-- Step 2: Rename n8n_sync_failed → email_send_failed
ALTER TABLE orders
    RENAME COLUMN n8n_sync_failed TO email_send_failed;

-- Step 3: Update column comments for clarity
COMMENT ON COLUMN orders.email_sent_at IS
    'Timestamp of when the order confirmation invoice email was successfully dispatched via Resend.';

COMMENT ON COLUMN orders.email_send_failed IS
    'True if the Resend invoice email dispatch permanently failed after all retries.';

-- Verification: confirm the renamed columns exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'orders'
  AND column_name IN ('email_sent_at', 'email_send_failed')
ORDER BY column_name;
