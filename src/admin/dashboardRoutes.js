const express    = require('express');
const router     = express.Router();
const path       = require('path');
const {
  basicAuth, generateToken, verifyToken,
  loginUser, getDeptFromEmail, DEPT_SERVICES,
} = require('./dashboardAuth');
const supabase         = require('../config/database');
const { STAFF_MEMBERS } = require('../config/constants');
const { sendBroadcast } = require('../services/broadcast');
const { sendText, sendTextAs, sendButtons } = require('../services/messenger');

// ── Serve dashboard HTML ──────────────────────────────────
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// ── Auth ──────────────────────────────────────────────────
router.post('/auth/token', express.json(), async (req, res) => {
  try {
    if (req.body?.email && req.body?.password) {
      const user  = await loginUser(req.body.email, req.body.password);
      const dept  = user.department || getDeptFromEmail(user.email);
      const token = generateToken(user.email, user.role, dept);
      return res.json({
        token,
        expires: '12h',
        user: {
          name:       user.name,
          email:      user.email,
          role:       user.role,
          department: dept,
        },
      });
    }

    // Super admin via basic auth header
    const authHeader   = req.headers['authorization'] || '';
    const b64          = authHeader.split(' ')[1] || '';
    const decoded      = Buffer.from(b64, 'base64').toString('utf-8');
    const [user, pass] = decoded.split(':');

    if (user === process.env.ADMIN_USERNAME && pass === process.env.ADMIN_PASSWORD) {
      const token = generateToken(user, 'superadmin', 'superadmin');
      return res.json({
        token,
        expires: '12h',
        user: { name: 'Super Admin', email: user, role: 'superadmin', department: 'superadmin' },
      });
    }

    return res.status(401).json({ error: 'Invalid credentials' });
  } catch (err) {
    return res.status(401).json({ error: err.message });
  }
});

// ── All API routes require JWT ────────────────────────────
router.use('/api', verifyToken);

// ── Helper: build department filter ──────────────────────
const buildDeptFilter = (query, dept, role) => {
  if (role === 'superadmin') return query; // Sees everything

  const services = DEPT_SERVICES[dept] || [];
  if (services.includes('all')) return query;

  if (dept === 'complaints') {
    return query.or('is_escalated.eq.true,conversation_stage.eq.escalated');
  }

  if (services.length === 1) {
    return query.eq('service_interested', services[0]);
  }

  return query.in('service_interested', services);
};

// ════════════════════════════════════════════════════════
// STATS — department aware
// ════════════════════════════════════════════════════════
router.get('/api/stats', async (req, res) => {
  try {
    const dept = req.admin?.department || 'info';
    const role = req.admin?.role       || 'agent';

    let leadsQuery = supabase.from('leads').select('*', { count: 'exact', head: true });
    leadsQuery     = buildDeptFilter(leadsQuery, dept, role);

    let registeredQuery = supabase.from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('payment_status', 'paid');
    registeredQuery = buildDeptFilter(registeredQuery, dept, role);

    let pendingQuery = supabase.from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('payment_status', 'paid')
      .in('conversation_stage', ['registered', 'new', 'qualified']);
    pendingQuery = buildDeptFilter(pendingQuery, dept, role);

    let escalationsQuery = supabase.from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('is_escalated', true);

    let todayQuery = supabase.from('leads')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(new Date().setHours(0,0,0,0)).toISOString());
    todayQuery = buildDeptFilter(todayQuery, dept, role);

    const paymentsQuery = supabase.from('payments')
      .select('amount')
      .eq('status', 'success');

    const [
      { count: totalLeads },
      { count: registeredLeads },
      { count: pendingAction },
      { count: escalations },
      { count: todayLeads },
      paymentsResult,
    ] = await Promise.all([
      leadsQuery,
      registeredQuery,
      pendingQuery,
      escalationsQuery,
      todayQuery,
      paymentsQuery,
    ]);

    const revenue = (paymentsResult.data || [])
      .reduce((sum, p) => sum + Number(p.amount), 0);

    res.json({
      total_leads:       totalLeads    || 0,
      registered_leads:  registeredLeads || 0,
      pending_action:    pendingAction || 0,
      escalations:       escalations   || 0,
      today_leads:       todayLeads    || 0,
      total_revenue:     revenue,
      revenue_formatted: `₦${revenue.toLocaleString('en-NG')}`,
    });
  } catch (err) {
    console.error('[ADMIN] stats error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ════════════════════════════════════════════════════════
// LEADS — department filtered
// ════════════════════════════════════════════════════════
router.get('/api/leads', async (req, res) => {
  try {
    const {
      search, service, stage, country,
      payment, escalated, status,
      limit = 100, offset = 0,
      sort = 'created_at', order = 'desc',
    } = req.query;

    const dept = req.admin?.department || 'info';
    const role = req.admin?.role       || 'agent';

    let query = supabase
      .from('leads')
      .select('*', { count: 'exact' })
      .order(sort, { ascending: order === 'asc' })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    // Apply department filter
    query = buildDeptFilter(query, dept, role);

    if (service)            query = query.eq('service_interested', service);
    if (country)            query = query.eq('destination_country', country);
    if (payment)            query = query.eq('payment_status', payment);
    if (escalated === 'true') query = query.eq('is_escalated', true);

    // Stage filter — maps friendly names
    if (stage === 'registered') {
      query = query.eq('payment_status', 'paid');
    } else if (stage) {
      query = query.eq('conversation_stage', stage);
    }

    // Lead status filter (new CRM pipeline)
    if (status) query = query.eq('lead_status', status);

    if (search) {
      query = query.or(
        `name.ilike.%${search}%,phone_number.ilike.%${search}%,email.ilike.%${search}%`
      );
    }

    const { data, error, count } = await query;
    if (error) throw error;

    res.json({ data: data || [], total: count });
  } catch (err) {
    console.error('[ADMIN] leads error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get single lead with full history
router.get('/api/leads/:id', async (req, res) => {
  try {
    const { data: lead, error } = await supabase
      .from('leads').select('*').eq('id', req.params.id).single();
    if (error) throw error;

    // Query DESC so we always get the LATEST messages first, then reverse for chronological display.
    // Run both phone_number and lead_id queries — old rows may only match one of them.
    const [convByPhone, convByLeadId] = await Promise.all([
      supabase.from('conversations').select('*').eq('phone_number', lead.phone_number)
        .order('created_at', { ascending: false }).limit(150),
      supabase.from('conversations').select('*').eq('lead_id', req.params.id)
        .order('created_at', { ascending: false }).limit(150),
    ]);

    // Deduplicate — use row.id if it exists, otherwise fall back to a compound key.
    // This handles tables with or without an auto-generated id column.
    const seenKeys = new Set();
    const allConvs = [];
    for (const row of [...(convByPhone.data || []), ...(convByLeadId.data || [])]) {
      const key = row.id != null
        ? `id:${row.id}`
        : `${row.created_at}|${row.direction}|${(row.content || '').slice(0, 80)}`;
      if (!seenKeys.has(key)) { seenKeys.add(key); allConvs.push(row); }
    }
    // Sort ascending for display, then take the 100 most recent
    allConvs.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    const conversations = allConvs.slice(-100);

    const { data: payments } = await supabase
      .from('payments').select('*').eq('lead_id', req.params.id)
      .order('created_at', { ascending: false });

    const { data: activity } = await supabase
      .from('lead_activity').select('*').eq('lead_id', req.params.id)
      .order('created_at', { ascending: false }).limit(20);

    res.json({
      lead,
      conversations: conversations || [],
      payments:      payments      || [],
      activity:      activity      || [],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generate AI consultant brief for a lead
router.get('/api/leads/:id/brief', async (req, res) => {
  try {
    const { data: lead, error } = await supabase
      .from('leads').select('*').eq('id', req.params.id).single();
    if (error) throw error;

    const parts = [];
    if (lead.name)                    parts.push(`Name: ${lead.name}`);
    if (lead.phone_number)            parts.push(`Phone: ${lead.phone_number}`);
    if (lead.destination_country)     parts.push(`Destination: ${lead.destination_country}`);
    if (lead.service_interested)      parts.push(`Service: ${lead.service_interested}`);
    if (lead.program_level)           parts.push(`Program: ${lead.program_level}`);
    if (lead.motivation)              parts.push(`Motivation: ${lead.motivation}`);
    if (lead.urgency)                 parts.push(`Urgency: ${lead.urgency}`);
    if (lead.passport_status)         parts.push(`Passport: ${lead.passport_status}`);
    if (lead.work_experience)         parts.push(`Work experience: ${lead.work_experience}`);
    if (lead.budget_range || lead.budget) parts.push(`Budget: ${lead.budget_range || lead.budget}`);
    if (lead.age)                     parts.push(`Age: ${lead.age}`);
    if (lead.profile_completion_score) parts.push(`Profile completion: ${lead.profile_completion_score}%`);
    if (lead.lead_score)              parts.push(`Lead score: ${lead.lead_score}`);

    const docs = lead.documents_checklist || {};
    const docStr = ['passport', 'degree', 'transcript', 'cv']
      .map(d => `${d}: ${docs[d] ? 'received' : 'pending'}`)
      .join(', ');
    parts.push(`Documents — ${docStr}`);

    const profileSummary = parts.join('\n');
    const { askAI } = require('../services/ai');

    const brief = await askAI(
      `admin_brief_${lead.id}`,
      '[GENERATE_CONSULTANT_BRIEF]',
      { stage: 'FREE_TEXT_AI', data: {} },
      `You are generating a consultant handover brief for an internal team member at ApplyBoard Africa. Write it in plain English, professional but warm. Based on the profile below, write 3–4 sentences covering: who this person is, what they are trying to do, their timeline and budget reality, and the key thing the consultant should focus on in the first session. End with one line about lead quality (hot/warm/cold) and why.\n\nProfile:\n${profileSummary}`
    );

    res.json({ brief });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update lead + log activity
router.put('/api/leads/:id', express.json(), async (req, res) => {
  try {
    const allowed = [
      'name', 'email', 'service_interested', 'destination_country',
      'program_level', 'budget_range', 'timeline', 'notes',
      'agent_assigned', 'conversation_stage', 'is_escalated',
      'payment_status', 'loan_interest', 'lead_status',
    ];

    const updates = {};
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('leads').update(updates).eq('id', req.params.id)
      .select().single();
    if (error) throw error;

    // Log activity
    if (req.body.lead_status || req.body.notes) {
      await supabase.from('lead_activity').insert({
        lead_id:    req.params.id,
        action:     req.body.lead_status
          ? `Status changed to: ${req.body.lead_status}`
          : 'Note added',
        note:       req.body.notes || null,
        done_by:    req.admin?.username || 'admin',
        created_at: new Date().toISOString(),
      }).catch(() => {});
    }

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Quick status update ───────────────────────────────────
router.put('/api/leads/:id/status', express.json(), async (req, res) => {
  try {
    const { status, note } = req.body;
    if (!status) return res.status(400).json({ error: 'Status required' });

    const { data, error } = await supabase
      .from('leads')
      .update({ lead_status: status, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select().single();
    if (error) throw error;

    // Log activity
    await supabase.from('lead_activity').insert({
      lead_id:    req.params.id,
      action:     `Status → ${status}`,
      note:       note || null,
      done_by:    req.admin?.username || 'admin',
      created_at: new Date().toISOString(),
    }).catch(() => {});

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ════════════════════════════════════════════════════════
// PAYMENTS
// ════════════════════════════════════════════════════════
router.get('/api/payments', async (req, res) => {
  try {
    const { status } = req.query;
    const dept       = req.admin?.department;
    const role       = req.admin?.role;

    let query = supabase
      .from('payments')
      .select('*, leads(name, phone_number, service_interested)')
      .order('created_at', { ascending: false })
      .limit(100);

    if (status) query = query.eq('status', status);

    // Finance and superadmin see all — others see their dept only
    if (role !== 'superadmin' && dept !== 'finance') {
      const services = DEPT_SERVICES[dept] || [];
      if (!services.includes('all')) {
        query = query.in('leads.service_interested', services);
      }
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/api/payments/:id/confirm', express.json(), async (req, res) => {
  try {
    const { data: payment, error } = await supabase
      .from('payments')
      .update({ status: 'success', updated_at: new Date().toISOString() })
      .eq('id', req.params.id).select().single();
    if (error) throw error;

    if (payment.phone_number) {
      await supabase.from('leads')
        .update({ payment_status: 'paid', lead_status: 'registered' })
        .eq('phone_number', payment.phone_number);

      await sendText(
        payment.phone_number,
        `Payment confirmed. You are in.\n\nAmount: ₦${Number(payment.amount).toLocaleString('en-NG')}\nReference: ${payment.reference}\n\nSomeone from our team will be in touch shortly.`
      ).catch(() => {});

      // Clear payment-awaiting state so user can converse normally
      try {
        const { clearState, setState } = require('../utils/stateManager');
        const { STAGES }               = require('../config/stages');
        await clearState(payment.phone_number);
        await setState(payment.phone_number, STAGES.FREE_TEXT_AI, {});
      } catch (e) { /* non-critical — state TTL will eventually expire */ }
    }

    res.json({ success: true, data: payment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ════════════════════════════════════════════════════════
// BROADCASTS
// ════════════════════════════════════════════════════════
router.get('/api/broadcasts', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('broadcasts').select('*')
      .order('created_at', { ascending: false }).limit(50);
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/api/broadcasts/preview', express.json(), async (req, res) => {
  try {
    const { filter = {} } = req.body;
    let query = supabase.from('leads').select('*', { count: 'exact', head: true });
    if (filter.service) query = query.eq('service_interested', filter.service);
    if (filter.country) query = query.eq('destination_country', filter.country);
    if (filter.payment) query = query.eq('payment_status', filter.payment);
    if (filter.source)  query = query.eq('source', filter.source);
    const { count } = await query;
    res.json({ count: count || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/api/broadcasts', express.json(), async (req, res) => {
  try {
    const { message, filter = {}, title } = req.body;
    if (!message?.trim()) return res.status(400).json({ error: 'Message required' });

    const { data, error } = await supabase.from('broadcasts').insert({
      title:         title || `Broadcast ${new Date().toLocaleDateString('en-NG')}`,
      message,
      target_filter: filter,
      status:        'sending',
      created_by:    req.admin?.username || 'admin',
    }).select().single();
    if (error) throw error;

    sendBroadcast(data.id, message, filter)
      .catch((err) => console.error('[ADMIN] Broadcast error:', err.message));

    res.json({ success: true, broadcast_id: data.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ════════════════════════════════════════════════════════
// DIRECT MESSAGE
// ════════════════════════════════════════════════════════
router.post('/api/message', express.json(), async (req, res) => {
  try {
    const { phone, message } = req.body;
    if (!phone || !message) return res.status(400).json({ error: 'Phone and message required' });

    const { data: lead } = await supabase
      .from('leads')
      .select('payment_status')
      .eq('phone_number', phone)
      .single();

    const adminId = req.admin?.email || req.admin?.username || 'admin';

    let sendResult;
    if (lead?.payment_status === 'pending') {
      sendResult = await sendButtons(phone, message, [
        { id: 'PAY_NOW', title: '💳 Regenerate payment link' },
      ]);
    } else {
      sendResult = await sendTextAs(phone, message, adminId);
    }

    // WhatsApp Cloud API can return HTTP 200 with an error body — axios won't throw for these.
    // Check explicitly so a silent API rejection doesn't become a false success to the team.
    if (sendResult?.error) {
      console.error('[ADMIN] WhatsApp rejected message to', phone, JSON.stringify(sendResult.error));
      return res.status(502).json({
        error:   'WhatsApp API rejected the message — it was not delivered',
        detail:  sendResult.error?.message || 'Unknown WhatsApp error',
        wa_code: sendResult.error?.code    || null,
      });
    }

    // A successful WhatsApp send always includes a message ID. No ID = not queued.
    // Skip this check for Telegram (different response shape).
    if (!phone.startsWith('tg_') && !sendResult?.messages?.[0]?.id) {
      console.error('[ADMIN] WhatsApp send: no message ID returned for', phone, JSON.stringify(sendResult));
      return res.status(502).json({
        error: 'Message may not have been delivered — WhatsApp returned no message ID',
      });
    }

    // Note: sendText/sendButtons already log to the conversations table via logOutbound()
    // in messenger.js (fire-and-forget, includes lead_id). No second insert needed here.

    res.json({ success: true, message_id: sendResult?.messages?.[0]?.id || null });
  } catch (err) {
    // Hard HTTP errors (4xx/5xx from WhatsApp API, network timeouts, etc.)
    const waError = err.response?.data?.error;
    console.error('[ADMIN] Direct message failed to', req.body?.phone, waError || err.message);
    res.status(500).json({
      error:  waError?.message || err.message,
      detail: waError ? `WhatsApp error code ${waError.code}` : null,
    });
  }
});

// ════════════════════════════════════════════════════════
// GROUP MESSAGE
// ════════════════════════════════════════════════════════
router.post('/api/group-message', express.json(), async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message required' });

    const GROUP_ID = process.env.TELEGRAM_GROUP_ID;
    if (!GROUP_ID) return res.status(500).json({ error: 'TELEGRAM_GROUP_ID not set' });

    const axios = require('axios');
    await axios.post(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        chat_id:                  GROUP_ID,
        text:                     message,
        disable_web_page_preview: true,
      },
      { headers: { 'Content-Type': 'application/json' } }
    );

    res.json({ success: true });
  } catch (err) {
    console.error('[ADMIN] Group message error:', err.message);
    res.status(500).json({ error: err.message });
  }
});


// ════════════════════════════════════════════════════════
// CONVERSATIONS — incremental polling endpoint
// ════════════════════════════════════════════════════════
router.get('/api/leads/:id/conversations', async (req, res) => {
  try {
    const { since } = req.query;
    const { data: lead } = await supabase
      .from('leads').select('phone_number').eq('id', req.params.id).single();
    if (!lead) return res.status(404).json({ error: 'Lead not found' });

    const buildQ = (col, val) => {
      let q = supabase.from('conversations').select('*').eq(col, val)
        .order('created_at', { ascending: true }).limit(100);
      if (since) q = q.gt('created_at', since);
      return q;
    };

    const [byPhone, byLeadId] = await Promise.all([
      buildQ('phone_number', lead.phone_number),
      buildQ('lead_id',      req.params.id),
    ]);

    const seenKeys = new Set();
    const msgs = [];
    for (const row of [...(byPhone.data || []), ...(byLeadId.data || [])]) {
      const key = row.id != null
        ? `id:${row.id}`
        : `${row.created_at}|${row.direction}|${(row.content || '').slice(0, 80)}`;
      if (!seenKeys.has(key)) { seenKeys.add(key); msgs.push(row); }
    }
    msgs.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    res.json(msgs.slice(0, 100));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ════════════════════════════════════════════════════════
// LEAD ACTIVITY LOG
// ════════════════════════════════════════════════════════
router.get('/api/leads/:id/activity', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('lead_activity').select('*').eq('lead_id', req.params.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/api/leads/:id/note', express.json(), async (req, res) => {
  try {
    const { note } = req.body;
    if (!note?.trim()) return res.status(400).json({ error: 'Note required' });

    await supabase.from('lead_activity').insert({
      lead_id:    req.params.id,
      action:     'Note added',
      note,
      done_by:    req.admin?.username || 'admin',
      created_at: new Date().toISOString(),
    });

    // Also update notes field on lead
    await supabase.from('leads')
      .update({ notes: note, updated_at: new Date().toISOString() })
      .eq('id', req.params.id);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ════════════════════════════════════════════════════════
// LEAD IMPORT
// ════════════════════════════════════════════════════════
router.post('/api/leads/import', express.json(), async (req, res) => {
  try {
    const { leads } = req.body;
    if (!leads?.length) return res.status(400).json({ error: 'No leads provided' });

    const toInsert = leads.map(l => ({
      phone_number:        (l.phone || l.phone_number || '').trim(),
      name:                (l.name || '').trim() || null,
      email:               (l.email || '').trim() || null,
      service_interested:  (l.service || l.service_interested || '').trim() || null,
      destination_country: (l.destination || l.destination_country || '').trim() || null,
      program_level:       (l.level || l.program_level || '').trim() || null,
      source:              'import',
    })).filter(l => l.phone_number);

    const { data, error } = await supabase
      .from('leads')
      .upsert(toInsert, { onConflict: 'phone_number' })
      .select();
    if (error) throw error;

    res.json({ success: true, imported: data?.length || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ════════════════════════════════════════════════════════
// STAFF ASSIGNMENT
// ════════════════════════════════════════════════════════
router.post('/api/leads/:id/assign', express.json(), async (req, res) => {
  try {
    const { staff_name } = req.body;
    if (!staff_name) return res.status(400).json({ error: 'staff_name required' });

    const staff = STAFF_MEMBERS.find(s => s.name === staff_name);
    if (!staff) return res.status(400).json({ error: `Unknown staff member: ${staff_name}` });

    const { data: lead, error: fetchErr } = await supabase
      .from('leads').select('*').eq('id', req.params.id).single();
    if (fetchErr) throw fetchErr;

    const { data, error } = await supabase
      .from('leads')
      .update({ agent_assigned: staff.name, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select().single();
    if (error) throw error;

    // Build WhatsApp notification message for the staff member
    const baseUrl   = process.env.BASE_URL || '';
    const dashLink  = `${baseUrl}/admin`;
    const svcLabel  = lead.service_interested?.replace(/_/g, ' ') || 'Not specified';
    const waMessage = [
      `New lead assigned to you — ${lead.name || 'Unknown'}`,
      ``,
      `Name: ${lead.name || 'Not provided'}`,
      `Phone: ${lead.phone_number}`,
      `Service: ${svcLabel}`,
      `Destination: ${lead.destination_country || 'Not specified'}`,
      `Program Level: ${lead.program_level || 'Not specified'}`,
      `Notes: ${lead.notes || 'None'}`,
      ``,
      `View in dashboard: ${dashLink}`,
    ].join('\n');

    await sendText(staff.phone, waMessage).catch((e) =>
      console.error(`[ADMIN] Staff notify failed for ${staff.name}:`, e.message)
    );

    await supabase.from('lead_activity').insert({
      lead_id:    req.params.id,
      action:     `Assigned to ${staff.name}`,
      done_by:    req.admin?.username || 'admin',
      created_at: new Date().toISOString(),
    }).catch(() => {});

    res.json({ success: true, data });
  } catch (err) {
    console.error('[ADMIN] assign error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;