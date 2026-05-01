const express          = require('express');
const router           = express.Router();
const path             = require('path');
const { basicAuth, generateToken, verifyToken } = require('./dashboardAuth');
const supabase         = require('../config/database');
const { sendBroadcast } = require('../services/broadcast');
const { sendText }     = require('../services/whatsapp');

// ── Serve dashboard HTML (basic auth on the page itself) ──
router.get('/', basicAuth, (req, res) => {
  // Generate a session token and pass it to the HTML
  const token = generateToken(process.env.ADMIN_USERNAME);
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// ── Auth token endpoint ───────────────────────────────────
router.post('/auth/token', basicAuth, (req, res) => {
  const token = generateToken(process.env.ADMIN_USERNAME);
  res.json({ token, expires: '12h' });
});

// ── All API routes require JWT ────────────────────────────
router.use('/api', verifyToken);

// ════════════════════════════════════════════════════════
// STATS
// ════════════════════════════════════════════════════════
router.get('/api/stats', async (req, res) => {
  try {
    const [
      { count: totalLeads },
      { count: totalConsultations },
      { count: escalations },
      { count: paidLeads },
      paymentsResult,
      { count: todayLeads },
    ] = await Promise.all([
      supabase.from('leads').select('*', { count: 'exact', head: true }),
      supabase.from('consultations').select('*', { count: 'exact', head: true }),
      supabase.from('leads').select('*', { count: 'exact', head: true }).eq('is_escalated', true).eq('conversation_stage', 'escalated'),
      supabase.from('leads').select('*', { count: 'exact', head: true }).eq('payment_status', 'paid'),
      supabase.from('payments').select('amount').eq('status', 'success'),
      supabase.from('leads').select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(new Date().setHours(0,0,0,0)).toISOString()),
    ]);

    const revenue = (paymentsResult.data || [])
      .reduce((sum, p) => sum + Number(p.amount), 0);

    res.json({
      total_leads:         totalLeads || 0,
      total_consultations: totalConsultations || 0,
      escalations_pending: escalations || 0,
      paid_leads:          paidLeads || 0,
      total_revenue:       revenue,
      revenue_formatted:   `₦${revenue.toLocaleString('en-NG')}`,
      today_leads:         todayLeads || 0,
    });
  } catch (err) {
    console.error('[ADMIN] stats error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ════════════════════════════════════════════════════════
// LEADS — full CRUD
// ════════════════════════════════════════════════════════
router.get('/api/leads', async (req, res) => {
  try {
    const {
      search, service, stage, country,
      payment, escalated, limit = 100, offset = 0,
      sort = 'created_at', order = 'desc'
    } = req.query;

    let query = supabase
      .from('leads')
      .select('*')
      .order(sort, { ascending: order === 'asc' })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    // Filters
    if (service)   query = query.eq('service_interested', service);
    if (stage)     query = query.eq('conversation_stage', stage);
    if (country)   query = query.eq('destination_country', country);
    if (payment)   query = query.eq('payment_status', payment);
    if (escalated === 'true') query = query.eq('is_escalated', true);

    // Search by name or phone
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

// Get single lead with full conversation history
router.get('/api/leads/:id', async (req, res) => {
  try {
    const { data: lead, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;

    // Get conversation history
    const { data: conversations } = await supabase
      .from('conversations')
      .select('*')
      .eq('lead_id', req.params.id)
      .order('created_at', { ascending: true })
      .limit(50);

    // Get consultations
    const { data: consultations } = await supabase
      .from('consultations')
      .select('*')
      .eq('lead_id', req.params.id)
      .order('created_at', { ascending: false });

    // Get payments
    const { data: payments } = await supabase
      .from('payments')
      .select('*')
      .eq('lead_id', req.params.id)
      .order('created_at', { ascending: false });

    res.json({
      lead,
      conversations: conversations || [],
      consultations: consultations || [],
      payments:      payments || [],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update lead
router.put('/api/leads/:id', async (req, res) => {
  try {
    const allowed = [
      'name', 'email', 'service_interested', 'destination_country',
      'program_level', 'budget_range', 'timeline', 'notes',
      'agent_assigned', 'conversation_stage', 'is_escalated',
      'payment_status', 'loan_interest',
    ];

    const updates = {};
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('leads')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ════════════════════════════════════════════════════════
// CONSULTATIONS
// ════════════════════════════════════════════════════════
router.get('/api/consultations', async (req, res) => {
  try {
    const { status, date } = req.query;

    let query = supabase
      .from('consultations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (status) query = query.eq('status', status);
    if (date) {
      const start = new Date(date);
      const end   = new Date(date);
      end.setDate(end.getDate() + 1);
      query = query
        .gte('created_at', start.toISOString())
        .lt('created_at', end.toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/api/consultations/:id', async (req, res) => {
  try {
    const { status, agent_notes } = req.body;
    const { data, error } = await supabase
      .from('consultations')
      .update({ status, agent_notes })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
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

    let query = supabase
      .from('payments')
      .select(`*, leads(name, phone_number)`)
      .order('created_at', { ascending: false })
      .limit(100);

    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Manually confirm a bank transfer
router.put('/api/payments/:id/confirm', async (req, res) => {
  try {
    const { data: payment, error } = await supabase
      .from('payments')
      .update({ status: 'success', updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    // Update lead payment status
    if (payment.phone_number) {
      await supabase
        .from('leads')
        .update({ payment_status: 'paid' })
        .eq('phone_number', payment.phone_number);

      // Notify user on WhatsApp
      await sendText(
        payment.phone_number,
        `🎉 *Payment Confirmed!*\n\nYour bank transfer of ₦${Number(payment.amount).toLocaleString('en-NG')} has been confirmed.\n\nOur team will contact you within 24 hours to begin processing. Thank you for choosing ApplyBoard Africa! 🌍`
      ).catch(() => {});
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
      .from('broadcasts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Preview how many recipients a broadcast would reach
router.post('/api/broadcasts/preview', async (req, res) => {
  try {
    const { filter = {} } = req.body;
    let query = supabase
      .from('leads')
      .select('*', { count: 'exact', head: true });

    if (filter.service)  query = query.eq('service_interested', filter.service);
    if (filter.country)  query = query.eq('destination_country', filter.country);
    if (filter.payment)  query = query.eq('payment_status', filter.payment);
    if (filter.consultation) query = query.eq('consultation_booked', true);

    const { count } = await query;
    res.json({ count: count || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Send broadcast
router.post('/api/broadcasts', express.json(), async (req, res) => {
  try {
    const { message, filter = {}, title } = req.body;
    if (!message?.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const { data, error } = await supabase
      .from('broadcasts')
      .insert({
        title:         title || `Broadcast ${new Date().toLocaleDateString('en-NG')}`,
        message,
        target_filter: filter,
        status:        'sending',
        created_by:    req.admin?.username || 'admin',
      })
      .select()
      .single();

    if (error) throw error;

    // Run async — do not block response
    sendBroadcast(data.id, message, filter)
      .catch((err) => console.error('[ADMIN] Broadcast error:', err.message));

    res.json({ success: true, broadcast_id: data.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ════════════════════════════════════════════════════════
// DIRECT MESSAGE — send to one number
// ════════════════════════════════════════════════════════
router.post('/api/message', express.json(), async (req, res) => {
  try {
    const { phone, message } = req.body;
    if (!phone || !message) {
      return res.status(400).json({ error: 'Phone and message are required' });
    }

    await sendText(phone, message);

    // Log to conversations
    await supabase.from('conversations').insert({
      phone_number:  phone,
      direction:     'outbound',
      message_type:  'text',
      content:       message,
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;