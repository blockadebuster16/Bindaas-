const { createClient } = require('@supabase/supabase-js');

const supabaseUrl  = process.env.SUPABASE_URL;
const supabaseKey  = process.env.SUPABASE_SERVICE_KEY; // service_role (backend only)

if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️  Supabase env vars missing — geo/shipping zones will use fallback defaults.');
}

const supabase = supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey)
    : null;

module.exports = supabase;
