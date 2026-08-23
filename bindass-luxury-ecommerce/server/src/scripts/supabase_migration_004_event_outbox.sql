-- ==============================================================================
-- Migration 004: Event Outbox + Idempotency Keys + Returns Table
-- Bindaas Luxury E-Commerce
-- Run in: Supabase Dashboard → SQL Editor
-- ==============================================================================

-- ── 1. EVENT OUTBOX TABLE ─────────────────────────────────────────────────────
-- Durable domain event store + Dead Letter Queue (DLQ).
-- Replaces fire-and-forget setImmediate queue with persistent, restartable events.
-- Events: OrderPaidEvent, InvoiceGeneratedEvent, QikinkSubmittedEvent,
--         DeliveryFailedEvent, OrderCancelledEvent, RTOInitiatedEvent,
--         OrphanedPaymentDetected

CREATE TABLE IF NOT EXISTS event_outbox (
    id              BIGSERIAL PRIMARY KEY,
    event_type      TEXT NOT NULL,
    aggregate_id    TEXT NOT NULL,              -- order_id, payment_id, etc.
    aggregate_type  TEXT DEFAULT 'Order',       -- 'Order' | 'Payment' | 'Refund'
    payload         JSONB NOT NULL DEFAULT '{}'::JSONB,
    status          TEXT NOT NULL DEFAULT 'PENDING'
                    CHECK (status IN ('PENDING', 'PROCESSING', 'PROCESSED', 'FAILED', 'DLQ')),
    attempts        INT NOT NULL DEFAULT 0,
    max_attempts    INT NOT NULL DEFAULT 5,
    last_error      TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    scheduled_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),   -- for delayed processing
    processed_at    TIMESTAMPTZ,
    next_retry_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_outbox_status        ON event_outbox(status, next_retry_at);
CREATE INDEX IF NOT EXISTS idx_outbox_type          ON event_outbox(event_type);
CREATE INDEX IF NOT EXISTS idx_outbox_aggregate     ON event_outbox(aggregate_id);
CREATE INDEX IF NOT EXISTS idx_outbox_pending       ON event_outbox(next_retry_at)
    WHERE status IN ('PENDING', 'FAILED');

-- ── 2. IDEMPOTENCY KEYS TABLE ─────────────────────────────────────────────────
-- Standalone idempotency store for future multi-gateway support.
-- Stores request fingerprint and cached response to replay safely.

CREATE TABLE IF NOT EXISTS idempotency_keys (
    key             TEXT PRIMARY KEY,
    request_hash    TEXT,                       -- SHA256 of request body
    request_path    TEXT,
    response_status INT,
    response_body   JSONB,
    user_email      TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at      TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '24 hours'
);

CREATE INDEX IF NOT EXISTS idx_idempotency_expires ON idempotency_keys(expires_at);

-- Auto-purge old idempotency keys (optional — run manually or via pg_cron)
-- DELETE FROM idempotency_keys WHERE expires_at < NOW();

-- ── 3. RETURNS TABLE ─────────────────────────────────────────────────────────
-- Tracks return requests with admin approval workflow and Razorpay refund status.

CREATE TABLE IF NOT EXISTS returns (
    id                  BIGSERIAL PRIMARY KEY,
    order_id            UUID NOT NULL REFERENCES orders(id),
    user_email          TEXT NOT NULL,
    reason              TEXT NOT NULL,
    description         TEXT,
    evidence_urls       JSONB DEFAULT '[]'::JSONB,  -- customer-uploaded photos
    items_to_return     JSONB DEFAULT '[]'::JSONB,  -- [{ product_id, qty, reason }]
    refund_amount       NUMERIC(10,2),
    status              TEXT NOT NULL DEFAULT 'REQUESTED'
                        CHECK (status IN (
                            'REQUESTED',
                            'ADMIN_REVIEW',
                            'APPROVED',
                            'REJECTED',
                            'REFUND_INITIATED',
                            'REFUND_PROCESSED',
                            'CLOSED'
                        )),
    -- ── Admin Fields ──────────────────────────────────────────────────────
    admin_notes         TEXT,
    reviewed_by         TEXT,                       -- admin email
    reviewed_at         TIMESTAMPTZ,
    -- ── Razorpay Refund ───────────────────────────────────────────────────
    razorpay_payment_id TEXT,                       -- original payment to refund
    razorpay_refund_id  TEXT,                       -- populated after refund API call
    refund_status       TEXT,                       -- 'pending' | 'processed' | 'failed'
    refunded_at         TIMESTAMPTZ,
    -- ── Timestamps ────────────────────────────────────────────────────────
    requested_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_returns_order    ON returns(order_id);
CREATE INDEX IF NOT EXISTS idx_returns_email    ON returns(user_email);
CREATE INDEX IF NOT EXISTS idx_returns_status   ON returns(status);

-- ── 4. Add return_id FK to inventory_ledger ───────────────────────────────────
-- (Enables linking stock restores to specific return records)
ALTER TABLE inventory_ledger
    ADD CONSTRAINT fk_ledger_returns
    FOREIGN KEY (return_id) REFERENCES returns(id)
    NOT VALID;  -- NOT VALID skips historical row check — validates future inserts only

-- ── Verification ──────────────────────────────────────────────────────────────
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('event_outbox', 'idempotency_keys', 'returns')
ORDER BY table_name;
