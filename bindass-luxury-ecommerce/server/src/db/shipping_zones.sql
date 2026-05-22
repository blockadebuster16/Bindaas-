-- ============================================================
-- BINDASS Shipping Zones — Supabase PostgreSQL
-- Run this once in your Supabase project → SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS shipping_zones (
  id            SERIAL PRIMARY KEY,
  zone_name     TEXT NOT NULL UNIQUE,        -- e.g. 'INDIA', 'USA'
  display_name  TEXT NOT NULL,               -- e.g. 'India'
  currency_code TEXT NOT NULL,               -- e.g. 'INR'
  currency_symbol TEXT NOT NULL,             -- e.g. '₹'
  base_shipping_fee DECIMAL(10,2) NOT NULL,  -- Flat fee in local currency
  free_shipping_threshold DECIMAL(10,2) DEFAULT 0,  -- 0 = disabled
  vat_rate      DECIMAL(5,2) DEFAULT 0,      -- % (display-only, DDU model)
  de_minimis    DECIMAL(10,2) DEFAULT 0,     -- Duty-free threshold (display)
  duty_note     TEXT,                        -- Disclaimer shown at checkout
  climate_fee   DECIMAL(10,2) DEFAULT 0,     -- Climate fee in local currency
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Seed Data (2026 Luxury Retail Estimates) ────────────────────────────────
INSERT INTO shipping_zones
  (zone_name, display_name, currency_code, currency_symbol, base_shipping_fee, free_shipping_threshold, vat_rate, de_minimis, duty_note, climate_fee)
VALUES
  ('INDIA',  'India',        'INR', '₹',   250,   40000,  18, 0,    NULL, 25),
  ('USA',    'United States','USD', '$',   30,    500,    8,  800,  'Import duties may apply for shipments above $800. These are the buyer''s responsibility (DDU).', 0.30),
  ('UK',     'United Kingdom','GBP','£',   25,    450,    20, 135,  'UK VAT & duties may apply. These are the buyer''s responsibility (DDU).', 0.25),
  ('EU',     'Europe',       'EUR', '€',   25,    500,    21, 150,  'EU VAT & customs may apply. These are the buyer''s responsibility (DDU).', 0.25),
  ('UAE',    'UAE',          'AED', 'د.إ', 100,   2000,   5,  1000, 'UAE VAT may apply on imports. These are the buyer''s responsibility (DDU).', 1.00),
  ('SEA',    'South East Asia','USD','$',  25,    400,    10, 50,   'Local import duties may apply. These are the buyer''s responsibility (DDU).', 0.25),
  ('AUS',    'Australia',    'AUD', 'A$',  40,    750,    10, 1000, 'Australian GST may apply on imports. These are the buyer''s responsibility (DDU).', 0.40),
  ('INTL',   'International','USD', '$',   45,    0,      0,  0,    'Local import duties & taxes are the buyer''s responsibility (DDU).', 0.30)
ON CONFLICT (zone_name) DO NOTHING;

-- Enable Row Level Security (read-only public access)
ALTER TABLE shipping_zones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON shipping_zones FOR SELECT USING (true);
