-- Run this ONCE in the Supabase SQL editor.
-- Creates the customer_profiles table to store extra registration fields.

CREATE TABLE IF NOT EXISTS customer_profiles (
  email TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT,
  mobile TEXT,
  birthdate DATE,
  gender TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disable Row Level Security so the backend can access it easily with the service key
ALTER TABLE customer_profiles DISABLE ROW LEVEL SECURITY;
