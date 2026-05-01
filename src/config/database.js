require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

if (!process.env.SUPABASE_URL) throw new Error('[DB] SUPABASE_URL is not set in .env');
if (!process.env.SUPABASE_SERVICE_KEY) throw new Error('[DB] SUPABASE_SERVICE_KEY is not set in .env');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    db: { schema: 'public' },
    global: {
      headers: { 'x-application-name': 'applyboard-bot' },
    },
  }
);

// Verify connection on startup
(async () => {
  try {
    const { error } = await supabase.from('leads').select('id').limit(1);
    if (error) throw error;
    console.log('[DB] Supabase connected successfully');
  } catch (err) {
    console.error('[DB] Supabase connection failed:', err.message);
    process.exit(1); // Kill server — DB is required
  }
})();

module.exports = supabase;