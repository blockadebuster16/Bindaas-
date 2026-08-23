-- ==============================================================================
-- Migration 005: Refund Engine, State Machine, and Audit Logs
-- Bindaas Luxury E-Commerce
-- Run in: Supabase Dashboard → SQL Editor
-- ==============================================================================

-- ── 1. UPDATE RETURNS STATUS CONSTRAINT ───────────────────────────────────────
-- We need to drop the old check constraint and apply the new granular state machine.
-- PostgreSQL auto-names check constraints. Since we didn't name it in 004, it's 
-- usually `returns_status_check`. We will drop it if it exists.

DO $$ 
BEGIN
    ALTER TABLE returns DROP CONSTRAINT returns_status_check;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

ALTER TABLE returns 
    ADD CONSTRAINT returns_status_check 
    CHECK (status IN (
        'REQUESTED',         -- RMA submitted
        'UNDER_REVIEW',      -- Flagged for inspection/review
        'APPROVED',          -- Approved by admin
        'REJECTED',          -- Rejected by admin
        'GATEWAY_INITIATED', -- API call made to Razorpay
        'PROCESSED_SUCCESS', -- Razorpay webhook confirmed settlement
        'FAILED',            -- Gateway failure
        'REVERSED',          -- Bounced payout
        'CLOSED'             -- Archived
    ));

-- ── 2. ADD NEW COLUMNS TO RETURNS ─────────────────────────────────────────────
ALTER TABLE returns 
    ADD COLUMN IF NOT EXISTS refund_type TEXT CHECK (refund_type IN ('FULL', 'PARTIAL')),
    ADD COLUMN IF NOT EXISTS bank_reference_number TEXT,
    ADD COLUMN IF NOT EXISTS reason_code TEXT,
    ADD COLUMN IF NOT EXISTS support_ticket_id TEXT;

-- ── 3. REFUND ITEMS TABLE ─────────────────────────────────────────────────────
-- Detailed mapping for partial refunds to specific line items.

CREATE TABLE IF NOT EXISTS refund_items (
    id                      BIGSERIAL PRIMARY KEY,
    refund_id               BIGINT NOT NULL REFERENCES returns(id) ON DELETE CASCADE,
    product_id              TEXT NOT NULL,
    quantity_returned       INT NOT NULL DEFAULT 1,
    refund_amount_allocated NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refund_items_refund ON refund_items(refund_id);

-- ── 4. REFUND AUDIT LOGS ──────────────────────────────────────────────────────
-- Immutable event log for tracking actor changes (who approved/rejected).

CREATE TABLE IF NOT EXISTS refund_audit_logs (
    id              BIGSERIAL PRIMARY KEY,
    refund_id       BIGINT NOT NULL REFERENCES returns(id) ON DELETE CASCADE,
    previous_status TEXT,
    new_status      TEXT NOT NULL,
    actor_type      TEXT NOT NULL CHECK (actor_type IN ('CUSTOMER', 'ADMIN', 'SYSTEM_WEBHOOK', 'AI_AGENT')),
    actor_id        TEXT NOT NULL, -- Email or ID of the actor
    notes           TEXT,
    timestamp       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refund_audit_refund ON refund_audit_logs(refund_id);
