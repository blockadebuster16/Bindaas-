-- ============================================================
-- FULL BINDASS DB SCHEMA (Supabase PostgreSQL)
-- Run this in the Supabase SQL Editor
-- ============================================================

-- 1. Shipping Zones (if not already created)
CREATE TABLE IF NOT EXISTS shipping_zones (
  id SERIAL PRIMARY KEY,
  zone_name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  currency_code TEXT NOT NULL,
  currency_symbol TEXT NOT NULL,
  base_shipping_fee DECIMAL(10,2) NOT NULL,
  free_shipping_threshold DECIMAL(10,2) DEFAULT 0,
  vat_rate DECIMAL(5,2) DEFAULT 0,
  de_minimis DECIMAL(10,2) DEFAULT 0,
  duty_note TEXT,
  climate_fee DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  climate_contribution DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'Pending', -- 'Pending', 'Processing', 'Shipped', 'Delivered'
  transaction_id TEXT,
  shipping_info JSONB, -- store JSON of address
  order_date TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Order Items
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL, -- Storing MongoDB ObjectId as TEXT here to keep reference
  name TEXT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  size TEXT,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Coupons
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT DEFAULT 'percentage', -- 'percentage' or 'fixed'
  discount_value DECIMAL(10,2) NOT NULL,
  min_purchase DECIMAL(10,2) DEFAULT 0,
  expiry_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  usage_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Coupon Usage
CREATE TABLE IF NOT EXISTS coupon_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  used_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Store Settings
CREATE TABLE IF NOT EXISTS store_settings (
  id INT PRIMARY KEY DEFAULT 1, -- Singleton, always 1
  cgst DECIMAL(5,2) DEFAULT 9,
  sgst DECIMAL(5,2) DEFAULT 9,
  shipping_gst DECIMAL(5,2) DEFAULT 18,
  air_rate DECIMAL(10,2) DEFAULT 54,
  surface_rate DECIMAL(10,2) DEFAULT 42,
  cod_fee DECIMAL(10,2) DEFAULT 34,
  cod_enabled BOOLEAN DEFAULT TRUE,
  item_weight INT DEFAULT 300,
  unit_weight INT DEFAULT 500,
  free_shipping_threshold DECIMAL(10,2) DEFAULT 0,
  climate_fee_enabled BOOLEAN DEFAULT TRUE,
  climate_fee_amount DECIMAL(10,2) DEFAULT 25,
  climate_fee_cause TEXT DEFAULT 'Certified Mangrove Restoration Projects',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Initialize singleton settings row if doesn't exist
INSERT INTO store_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- 7. Settings Audit Log
CREATE TABLE IF NOT EXISTS settings_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_email TEXT NOT NULL,
  changes JSONB NOT NULL,
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Membership Tiers
CREATE TABLE IF NOT EXISTS membership_tiers (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,    -- 'Silver', 'Gold', 'Platinum', 'BINDASS Black'
  spend_threshold DECIMAL(10,2) NOT NULL,
  benefits JSONB, -- Array of strings
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Memberships
INSERT INTO membership_tiers (name, spend_threshold, benefits)
VALUES
  ('Silver', 0, '["Early access to sales", "Birthday reward"]'),
  ('Gold', 25000, '["Free standard shipping", "Early access to sales", "Birthday reward"]'),
  ('Platinum', 100000, '["Free express shipping", "Priority support", "Exclusive collection access"]'),
  ('BINDASS Black', 500000, '["Personal stylist", "VIP event invites", "Lifetime free express shipping"]')
ON CONFLICT (name) DO NOTHING;

-- 9. Analytics Events
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT, -- Can be null for guests
  event_type TEXT NOT NULL, -- e.g., 'page_view', 'add_to_cart', 'checkout_started'
  page_path TEXT,
  session_id TEXT,
  zone TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Search Logs
CREATE TABLE IF NOT EXISTS search_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  search_term TEXT NOT NULL,
  results_count INT NOT NULL,
  user_email TEXT,
  zone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- FIX: DISABLE RLS (Allows the publishable key to work)
-- ============================================================
ALTER TABLE shipping_zones DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE coupons DISABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usage DISABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings_audit_log DISABLE ROW LEVEL SECURITY;
ALTER TABLE membership_tiers DISABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE search_logs DISABLE ROW LEVEL SECURITY;
