require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function run() {
  // ── 1. Pending payment_status ────────────────────────────────────────────
  const { data: pendingLeads, error: e1 } = await supabase
    .from('leads')
    .select('id, name, phone_number, followup_count, last_interaction, payment_status')
    .eq('payment_status', 'pending');

  if (e1) { console.error('Error fetching pending leads:', e1.message); process.exit(1); }

  console.log('\n════════════════════════════════════════════════════════');
  console.log('  GROUP A — payment_status = "pending"');
  console.log('════════════════════════════════════════════════════════');
  console.log(`  Total count: ${pendingLeads.length}`);

  if (pendingLeads.length > 0) {
    // followup_count distribution
    const followupDist = {};
    pendingLeads.forEach(l => {
      const k = l.followup_count ?? 0;
      followupDist[k] = (followupDist[k] || 0) + 1;
    });
    console.log('\n  followup_count distribution:');
    Object.keys(followupDist).sort((a,b)=>Number(a)-Number(b)).forEach(k => {
      console.log(`    count=${k}: ${followupDist[k]} lead(s)`);
    });

    // last_interaction range
    const dates = pendingLeads
      .map(l => l.last_interaction)
      .filter(Boolean)
      .sort();
    console.log(`\n  last_interaction range:`);
    console.log(`    Oldest : ${dates[0] ?? 'N/A'}`);
    console.log(`    Newest : ${dates[dates.length - 1] ?? 'N/A'}`);

    // Breakdown per lead
    console.log('\n  Per-lead detail:');
    pendingLeads
      .sort((a,b) => new Date(b.last_interaction) - new Date(a.last_interaction))
      .forEach(l => {
        console.log(`    • ${l.name || 'Unknown'} | ${l.phone_number} | followup=${l.followup_count ?? 0} | last=${l.last_interaction ?? 'N/A'}`);
      });
  }

  // ── 2. payment_status IS NULL + has conversations ────────────────────────
  // First, get leads with null payment_status
  const { data: nullLeads, error: e2 } = await supabase
    .from('leads')
    .select('id, name, phone_number, followup_count, last_interaction, payment_status')
    .is('payment_status', null);

  if (e2) { console.error('Error fetching null-payment leads:', e2.message); process.exit(1); }

  // Get IDs that have at least one conversation
  const nullIds = nullLeads.map(l => l.id);
  let leadsWithConversations = [];

  if (nullIds.length > 0) {
    const { data: convRows, error: e3 } = await supabase
      .from('conversations')
      .select('lead_id')
      .in('lead_id', nullIds);

    if (e3) { console.error('Error fetching conversations:', e3.message); process.exit(1); }

    const idsWithConvs = new Set(convRows.map(r => r.lead_id));
    leadsWithConversations = nullLeads.filter(l => idsWithConvs.has(l.id));
  }

  console.log('\n════════════════════════════════════════════════════════');
  console.log('  GROUP B — payment_status IS NULL + ≥1 conversation');
  console.log('════════════════════════════════════════════════════════');
  console.log(`  Total with NULL payment_status : ${nullLeads.length}`);
  console.log(`  Of those, with conversations   : ${leadsWithConversations.length}`);

  if (leadsWithConversations.length > 0) {
    const followupDist2 = {};
    leadsWithConversations.forEach(l => {
      const k = l.followup_count ?? 0;
      followupDist2[k] = (followupDist2[k] || 0) + 1;
    });
    console.log('\n  followup_count distribution:');
    Object.keys(followupDist2).sort((a,b)=>Number(a)-Number(b)).forEach(k => {
      console.log(`    count=${k}: ${followupDist2[k]} lead(s)`);
    });

    const dates2 = leadsWithConversations
      .map(l => l.last_interaction)
      .filter(Boolean)
      .sort();
    console.log(`\n  last_interaction range:`);
    console.log(`    Oldest : ${dates2[0] ?? 'N/A'}`);
    console.log(`    Newest : ${dates2[dates2.length - 1] ?? 'N/A'}`);

    console.log('\n  Per-lead detail:');
    leadsWithConversations
      .sort((a,b) => new Date(b.last_interaction) - new Date(a.last_interaction))
      .forEach(l => {
        console.log(`    • ${l.name || 'Unknown'} | ${l.phone_number} | followup=${l.followup_count ?? 0} | last=${l.last_interaction ?? 'N/A'}`);
      });
  }

  // ── 3. Quick summary ─────────────────────────────────────────────────────
  console.log('\n════════════════════════════════════════════════════════');
  console.log('  SUMMARY');
  console.log('════════════════════════════════════════════════════════');
  console.log(`  payment_status = "pending"                     : ${pendingLeads.length}`);
  console.log(`  payment_status = NULL with conversations       : ${leadsWithConversations.length}`);
  console.log(`  payment_status = NULL total (incl. no convos)  : ${nullLeads.length}`);
  console.log('');
}

run().catch(err => { console.error('Fatal:', err); process.exit(1); });
