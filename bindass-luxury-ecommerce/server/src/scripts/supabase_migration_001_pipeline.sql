-- ==============================================================================
-- Bindaas Luxury E-Commerce — Supabase Database Migration 001
-- Order Confirmation, Qikink POD Integration & Pipeline State Machine
-- ==============================================================================

-- 1. Add Idempotency & State Machine Columns to Orders
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS idempotency_key TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'PAYMENT_PENDING',
ADD COLUMN IF NOT EXISTS fulfillment_status TEXT NOT NULL DEFAULT 'UNFULFILLED',
ADD COLUMN IF NOT EXISTS ticket_id UUID DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS n8n_synced_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS n8n_sync_failed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS qikink_order_id TEXT,
ADD COLUMN IF NOT EXISTS qikink_shipment_id TEXT,
ADD COLUMN IF NOT EXISTS tracking_number TEXT,
ADD COLUMN IF NOT EXISTS courier_name TEXT,
ADD COLUMN IF NOT EXISTS tracking_url TEXT,
ADD COLUMN IF NOT EXISTS qikink_synced_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS qikink_sync_failed BOOLEAN DEFAULT FALSE;

-- 2. Add CHECK Constraints for State Enums (drop if existing to allow re-running)
ALTER TABLE orders DROP CONSTRAINT IF EXISTS chk_payment_status;
ALTER TABLE orders ADD CONSTRAINT chk_payment_status 
CHECK (payment_status IN ('PAYMENT_PENDING', 'PAYMENT_VERIFIED', 'ORDER_CREATED', 'INVOICED', 'DISPATCHED_TO_N8N', 'PAYMENT_FAILED', 'RECONCILIATION_REQUIRED'));

ALTER TABLE orders DROP CONSTRAINT IF EXISTS chk_fulfillment_status;
ALTER TABLE orders ADD CONSTRAINT chk_fulfillment_status 
CHECK (fulfillment_status IN ('UNFULFILLED', 'SUBMITTED', 'IN_PRODUCTION', 'SHIPPED', 'DELIVERED', 'CANCELLED'));

-- 3. Create Index on Idempotency Key & Ticket ID for fast lookup
CREATE INDEX IF NOT EXISTS idx_orders_idempotency ON orders(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_orders_ticket ON orders(ticket_id);
CREATE INDEX IF NOT EXISTS idx_orders_qikink ON orders(qikink_order_id);

-- 4. Atomic Stored Procedure / RPC for Order + Items Insertion
CREATE OR REPLACE FUNCTION insert_order_with_items(
    p_order JSONB,
    p_items JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_order_id UUID;
    v_new_order RECORD;
    v_item JSONB;
BEGIN
    -- Insert Order Record
    INSERT INTO orders (
        user_email,
        total_amount,
        climate_contribution,
        transaction_id,
        status,
        payment_status,
        fulfillment_status,
        shipping_info,
        idempotency_key
    ) VALUES (
        (p_order->>'user_email'),
        (p_order->>'total_amount')::NUMERIC,
        COALESCE((p_order->>'climate_contribution')::NUMERIC, 0),
        (p_order->>'transaction_id'),
        COALESCE(p_order->>'status', 'Pending'),
        COALESCE(p_order->>'payment_status', 'PAYMENT_VERIFIED'),
        COALESCE(p_order->>'fulfillment_status', 'UNFULFILLED'),
        (p_order->'shipping_info'),
        (p_order->>'idempotency_key')
    )
    RETURNING id INTO v_order_id;

    -- Insert Order Items
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        INSERT INTO order_items (
            order_id,
            product_id,
            name,
            quantity,
            price,
            size,
            image
        ) VALUES (
            v_order_id,
            (v_item->>'product_id'),
            (v_item->>'name'),
            (v_item->>'quantity')::INT,
            (v_item->>'price')::NUMERIC,
            COALESCE(v_item->>'size', 'M'),
            COALESCE(v_item->>'image', '')
        );
    END LOOP;

    -- Return newly created order
    SELECT * INTO v_new_order FROM orders WHERE id = v_order_id;
    RETURN to_jsonb(v_new_order);
END;
$$;
