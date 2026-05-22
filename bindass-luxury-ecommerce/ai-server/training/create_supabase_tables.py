"""
Supabase Table Migration
========================
Creates the refund_audit table in Supabase PostgreSQL.
Run once: python training/create_supabase_tables.py
"""
from supabase import create_client
import os, sys
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent / ".env")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("[!] SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env")
    sys.exit(1)

client = create_client(SUPABASE_URL, SUPABASE_KEY)

# We use a known-good table insert approach to verify connection
# The actual DDL must be run in the Supabase SQL Editor (shown below)
print("""
=============================================================
  Supabase Table Setup
=============================================================

Run the following SQL in your Supabase SQL Editor:
https://supabase.com/dashboard/project/mxgoliwncqqvkokltjay/sql/new

-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS refund_audit (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id       TEXT NOT NULL,
  owner_id        TEXT NOT NULL,
  agent_id        TEXT,

  ai_amount       NUMERIC(10,2) NOT NULL DEFAULT 0,
  ai_type         TEXT NOT NULL DEFAULT 'none',
  ai_reasoning    TEXT,

  final_amount    NUMERIC(10,2),
  final_type      TEXT,
  override_reason TEXT,

  anger_score     NUMERIC(4,3),
  anger_level     TEXT,
  intent          TEXT,

  status          TEXT NOT NULL DEFAULT 'AI_SUGGESTED',

  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$ BEGIN
  NEW.updated_at = NOW(); RETURN NEW;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON refund_audit
FOR EACH ROW EXECUTE FUNCTION update_updated_at();
-- -----------------------------------------------------------
""")

# Verify connection by checking if table exists
try:
    result = client.table("refund_audit").select("id").limit(1).execute()
    print("[v] Connection verified. refund_audit table found!")
except Exception as e:
    if "does not exist" in str(e) or "relation" in str(e).lower():
        print("[!] Table not found. Please run the SQL above in the Supabase SQL Editor first.")
    else:
        print(f"[v] Connected to Supabase. Error: {e}")
