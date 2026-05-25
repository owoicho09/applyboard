require('dotenv').config();
const supabase = require('./src/config/database');

(async () => {
  // 1. Get first lead that has conversations
  const { data: leads } = await supabase.from('leads').select('id, phone_number, name').limit(20);
  if (!leads?.length) { console.log('No leads found'); process.exit(); }

  let targetLead = null;
  let convRows = [];

  for (const lead of leads) {
    const { data } = await supabase
      .from('conversations')
      .select('*')
      .eq('phone_number', lead.phone_number)
      .limit(5);
    if (data?.length) { targetLead = lead; convRows = data; break; }
  }

  if (!targetLead) { console.log('No conversations found for any lead'); process.exit(); }

  console.log('\n=== TARGET LEAD ===');
  console.log(JSON.stringify(targetLead, null, 2));

  console.log('\n=== SAMPLE ROW (raw from conversations table) ===');
  console.log(JSON.stringify(convRows[0], null, 2));

  console.log('\n=== ALL COLUMN NAMES in conversations table ===');
  console.log(Object.keys(convRows[0]).join(', '));

  console.log('\n=== id column check ===');
  console.log('row.id value:', convRows[0].id);
  console.log('row.id is null?', convRows[0].id == null);

  // 2. Simulate exactly what the endpoint does
  console.log('\n=== SIMULATING GET /api/leads/:id initial load ===');
  const [convByPhone, convByLeadId] = await Promise.all([
    supabase.from('conversations').select('*').eq('phone_number', targetLead.phone_number)
      .order('created_at', { ascending: false }).limit(150),
    supabase.from('conversations').select('*').eq('lead_id', targetLead.id)
      .order('created_at', { ascending: false }).limit(150),
  ]);

  console.log('byPhone rows:', convByPhone.data?.length, '| error:', convByPhone.error?.message || 'none');
  console.log('byLeadId rows:', convByLeadId.data?.length, '| error:', convByLeadId.error?.message || 'none');

  const seenKeys = new Set();
  const allConvs = [];
  for (const row of [...(convByPhone.data || []), ...(convByLeadId.data || [])]) {
    const key = row.id != null
      ? `id:${row.id}`
      : `${row.created_at}|${row.direction}|${(row.content || '').slice(0, 80)}`;
    if (!seenKeys.has(key)) { seenKeys.add(key); allConvs.push(row); }
  }
  allConvs.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  const conversations = allConvs.slice(-100);

  console.log('After dedup+sort, conversations count:', conversations.length);
  if (conversations.length) {
    console.log('\n=== FIRST CONV ROW (what frontend receives) ===');
    console.log(JSON.stringify(conversations[0], null, 2));
    console.log('\n=== LAST CONV ROW ===');
    console.log(JSON.stringify(conversations[conversations.length - 1], null, 2));
  }

  // 3. Simulate polling endpoint with since = oldest timestamp
  if (conversations.length) {
    const since = conversations[0].created_at;
    console.log(`\n=== SIMULATING POLLING with since=${since} ===`);
    const buildQ = (col, val) => {
      let q = supabase.from('conversations').select('*').eq(col, val)
        .order('created_at', { ascending: true }).limit(100);
      q = q.gt('created_at', since);
      return q;
    };
    const [byPhone, byLeadId] = await Promise.all([
      buildQ('phone_number', targetLead.phone_number),
      buildQ('lead_id', targetLead.id),
    ]);
    console.log('poll byPhone rows:', byPhone.data?.length, '| error:', byPhone.error?.message || 'none');
    console.log('poll byLeadId rows:', byLeadId.data?.length, '| error:', byLeadId.error?.message || 'none');
  }

  process.exit(0);
})().catch(err => { console.error('Script error:', err.message); process.exit(1); });
