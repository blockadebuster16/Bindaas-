-- ============================================================
-- Climate Donations Table
-- Run this ONCE in the Supabase SQL editor.
--
-- Purpose:
--   Stores a record for every paid Climate Action donation.
--   n8n refund automation can query this by razorpay_order_id
--   to check whether the donation is non-refundable.
-- ============================================================

CREATE TABLE IF NOT EXISTS climate_donations (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Links back to the main orders table
    order_id            UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

    -- Razorpay identifiers (what n8n will use to look up)
    razorpay_order_id   TEXT NOT NULL,
    razorpay_payment_id TEXT NOT NULL,

    -- Customer details (denormalised for fast, self-contained lookup)
    customer_email      TEXT NOT NULL,
    customer_name       TEXT,

    -- Donation details
    donation_amount     NUMERIC(10, 2) NOT NULL,
    cause               TEXT DEFAULT 'Certified Mangrove Restoration Projects',

    -- Refund policy flag — always FALSE for climate donations (non-refundable)
    is_refundable       BOOLEAN NOT NULL DEFAULT FALSE,

    donated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast n8n lookups by Razorpay order ID
CREATE INDEX IF NOT EXISTS idx_climate_donations_razorpay_order_id
    ON climate_donations (razorpay_order_id);

-- Index for lookups by customer (useful for admin reports)
CREATE INDEX IF NOT EXISTS idx_climate_donations_customer_email
    ON climate_donations (customer_email);

-- Enable Row Level Security (service_role key bypasses this automatically)
ALTER TABLE climate_donations ENABLE ROW LEVEL SECURITY;

-- Only backend service_role can read/write
CREATE POLICY "service_role_only" ON climate_donations
    USING (auth.role() = 'service_role');
