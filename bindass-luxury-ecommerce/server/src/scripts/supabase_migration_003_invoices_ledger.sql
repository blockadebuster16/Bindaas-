-- ==============================================================================
-- Migration 003: Invoices Table (GST-compliant) + Inventory Ledger
-- Bindaas Luxury E-Commerce
-- Run in: Supabase Dashboard → SQL Editor
-- ==============================================================================

-- ── 1. INVOICES TABLE ─────────────────────────────────────────────────────────
-- Persists every generated invoice with full GST breakdown and HTML snapshot.
-- invoice_number follows the pattern: INV-YYYY-XXXXXX (e.g. INV-2026-001042)

CREATE TABLE IF NOT EXISTS invoices (
    id                  BIGSERIAL PRIMARY KEY,
    order_id            UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    invoice_number      TEXT NOT NULL UNIQUE,
    user_email          TEXT NOT NULL,
    customer_name       TEXT,
    customer_phone      TEXT,

    -- ── Pricing Breakdown ──────────────────────────────────────────────────
    subtotal            NUMERIC(10,2) NOT NULL DEFAULT 0,
    discount_amount     NUMERIC(10,2) NOT NULL DEFAULT 0,
    shipping_amount     NUMERIC(10,2) NOT NULL DEFAULT 0,
    shipping_gst_amount NUMERIC(10,2) NOT NULL DEFAULT 0,

    -- ── GST / Tax Compliance ───────────────────────────────────────────────
    cgst_rate           NUMERIC(5,2) DEFAULT 9.00,    -- %
    sgst_rate           NUMERIC(5,2) DEFAULT 9.00,    -- %
    igst_rate           NUMERIC(5,2) DEFAULT 0.00,    -- % for inter-state
    cgst_amount         NUMERIC(10,2) NOT NULL DEFAULT 0,
    sgst_amount         NUMERIC(10,2) NOT NULL DEFAULT 0,
    igst_amount         NUMERIC(10,2) NOT NULL DEFAULT 0,
    climate_fee         NUMERIC(10,2) NOT NULL DEFAULT 0,
    total_amount        NUMERIC(10,2) NOT NULL,
    currency            TEXT NOT NULL DEFAULT 'INR',

    -- ── GST Entity Details ─────────────────────────────────────────────────
    seller_gstin        TEXT DEFAULT 'PENDING_REGISTRATION',
    seller_pan          TEXT,
    seller_address      TEXT DEFAULT 'Mumbai, Maharashtra, India',
    buyer_gstin         TEXT,                           -- NULL for B2C customers

    -- ── HSN / SAC Classification ───────────────────────────────────────────
    -- Stored as JSONB array: [{ "hsn_code": "6211", "description": "Apparel", "amount": 14950 }]
    hsn_breakdown       JSONB DEFAULT '[]'::JSONB,
    default_hsn_code    TEXT DEFAULT '6211',            -- HSN for readymade garments

    -- ── Storage ───────────────────────────────────────────────────────────
    html_snapshot       TEXT,                           -- Full rendered HTML
    pdf_url             TEXT,                           -- Set when PDF is generated
    email_sent_at       TIMESTAMPTZ,

    -- ── State ─────────────────────────────────────────────────────────────
    status              TEXT NOT NULL DEFAULT 'ISSUED'
                        CHECK (status IN ('ISSUED', 'CANCELLED', 'AMENDED')),
    issued_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata            JSONB DEFAULT '{}'::JSONB
);

CREATE INDEX IF NOT EXISTS idx_invoices_order   ON invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_email   ON invoices(user_email);
CREATE INDEX IF NOT EXISTS idx_invoices_number  ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_status  ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_date    ON invoices(issued_at DESC);

-- ── 2. INVOICE_ITEMS TABLE ────────────────────────────────────────────────────
-- Line items with individual HSN codes and tax amounts (required for GST compliance)

CREATE TABLE IF NOT EXISTS invoice_items (
    id              BIGSERIAL PRIMARY KEY,
    invoice_id      BIGINT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    order_item_id   UUID REFERENCES order_items(id),
    product_id      TEXT NOT NULL,
    name            TEXT NOT NULL,
    hsn_code        TEXT DEFAULT '6211',
    size            TEXT,
    quantity        INT NOT NULL DEFAULT 1,
    unit_price      NUMERIC(10,2) NOT NULL,
    line_total      NUMERIC(10,2) NOT NULL,
    cgst_amount     NUMERIC(10,2) DEFAULT 0,
    sgst_amount     NUMERIC(10,2) DEFAULT 0,
    igst_amount     NUMERIC(10,2) DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_inv_items_invoice ON invoice_items(invoice_id);

-- ── 3. INVENTORY LEDGER ───────────────────────────────────────────────────────
-- Immutable audit trail for every stock change (sale, restock, return, adjustment)

CREATE TABLE IF NOT EXISTS inventory_ledger (
    id              BIGSERIAL PRIMARY KEY,
    product_id      TEXT NOT NULL,               -- MongoDB ObjectId as TEXT
    product_name    TEXT,
    sku             TEXT,
    event_type      TEXT NOT NULL
                    CHECK (event_type IN (
                        'SALE', 'RESTOCK', 'RETURN', 'RETURN_REJECTED',
                        'ADJUSTMENT', 'RESERVATION', 'RESERVATION_RELEASED',
                        'RTO_RETURNED', 'MANUAL'
                    )),
    delta           INT NOT NULL,                -- positive = added, negative = removed
    qty_after       INT,                         -- snapshot of stock_quantity after change
    order_id        UUID REFERENCES orders(id),
    return_id       BIGINT,                      -- FK to returns table (Phase 5)
    reason          TEXT,
    performed_by    TEXT,                        -- 'system' | admin email
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ledger_product  ON inventory_ledger(product_id);
CREATE INDEX IF NOT EXISTS idx_ledger_order    ON inventory_ledger(order_id);
CREATE INDEX IF NOT EXISTS idx_ledger_event    ON inventory_ledger(event_type);
CREATE INDEX IF NOT EXISTS idx_ledger_date     ON inventory_ledger(created_at DESC);

-- ── 4. Add invoice_id foreign key to orders ───────────────────────────────────
ALTER TABLE orders ADD COLUMN IF NOT EXISTS invoice_id BIGINT REFERENCES invoices(id);

-- ── 5. Sequence for invoice numbering ─────────────────────────────────────────
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1000 INCREMENT 1;

-- ── Verification ──────────────────────────────────────────────────────────────
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('invoices', 'invoice_items', 'inventory_ledger')
ORDER BY table_name;
