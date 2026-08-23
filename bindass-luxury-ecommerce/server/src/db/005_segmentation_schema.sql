-- 1. Extend Customers (if using auth.users or a custom users table, we'll assume a 'users' or 'customers' table exists. 
-- Based on the codebase, we'll create a dedicated table for RFM segments linked by email, or we'll add columns if 'users' exists.
-- Since Supabase typically uses auth.users, and the app uses MongoDB for Users and Supabase for Orders,
-- we'll create a PostgreSQL 'customer_segments' table that acts as our single source of truth for the RFM engine.

CREATE TABLE IF NOT EXISTS customer_segments (
    email VARCHAR(255) PRIMARY KEY,
    recency_score INT DEFAULT 0,
    frequency_score INT DEFAULT 0,
    monetary_score INT DEFAULT 0,
    rfm_segment VARCHAR(50) DEFAULT 'New',
    last_order_date TIMESTAMPTZ,
    total_orders INT DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0,
    last_calculated_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 2. Custom Segments Builder
CREATE TABLE IF NOT EXISTS segments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    rules JSONB NOT NULL, -- e.g. { "rfm_segment": "Champions", "total_spent": { ">": 1000 } }
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Sender Profiles (SMTP Rotation & Warmup)
CREATE TABLE IF NOT EXISTS sender_profiles (
    id SERIAL PRIMARY KEY,
    domain VARCHAR(255) NOT NULL,
    from_name VARCHAR(255) NOT NULL,
    from_email VARCHAR(255) NOT NULL,
    reply_to VARCHAR(255),
    smtp_host VARCHAR(255),
    smtp_port INT,
    smtp_user VARCHAR(255),
    smtp_pass VARCHAR(255),
    provider VARCHAR(50) DEFAULT 'Mailgun', -- Mailgun, SES, etc.
    mailgun_domain VARCHAR(255),
    mailgun_api_key VARCHAR(255),
    hourly_limit INT DEFAULT 50, -- Guardrails
    is_warming_up BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'active'
);

-- 4. Campaigns (Drip Sequences)
CREATE TABLE IF NOT EXISTS campaigns (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    segment_id INT REFERENCES segments(id),
    sender_profile_id INT REFERENCES sender_profiles(id),
    status VARCHAR(50) DEFAULT 'draft', -- draft, active, paused, completed
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Campaign Steps (Drip logic)
CREATE TABLE IF NOT EXISTS campaign_steps (
    id SERIAL PRIMARY KEY,
    campaign_id INT REFERENCES campaigns(id) ON DELETE CASCADE,
    step_order INT NOT NULL,
    delay_hours INT DEFAULT 0,
    subject VARCHAR(255) NOT NULL,
    body_html TEXT NOT NULL,
    body_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Email Events (Webhook Sink)
CREATE TABLE IF NOT EXISTS email_events (
    id SERIAL PRIMARY KEY,
    campaign_id INT REFERENCES campaigns(id),
    step_id INT REFERENCES campaign_steps(id),
    recipient_email VARCHAR(255) NOT NULL,
    event_type VARCHAR(50) NOT NULL, -- sent, delivered, opened, clicked, bounced, complained
    message_id VARCHAR(255),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for analytics aggregation
CREATE INDEX IF NOT EXISTS idx_email_events_campaign ON email_events(campaign_id, event_type);
CREATE INDEX IF NOT EXISTS idx_email_events_recipient ON email_events(recipient_email);
