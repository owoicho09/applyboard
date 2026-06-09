const supabase = require('../config/database');

const buildHistory = async (phone, state) => {
  const history = state.data?.chatHistory || [];
  if (history.length > 0) return history.slice(-10);

  // Redis expired — seed from Supabase conversations table so the AI isn't flying blind
  try {
    const { data } = await supabase
      .from('conversations')
      .select('direction, content')
      .eq('phone_number', phone)
      .order('created_at', { ascending: false })
      .limit(10);

    if (!data?.length) return [];
    return data
      .reverse()
      .map(row => ({
        role:    row.direction === 'inbound' ? 'user' : 'assistant',
        content: row.content || '',
      }))
      .filter(m => m.content);
  } catch {
    return [];
  }
};

const loadPersistentContext = async (phone) => {
  try {
    const lead = await getLead(phone);
    if (!lead) return '';

    const parts = [];
    if (lead.name) {
      // Use only the first word — avoids passing full handles or "FirstName LastName" the AI parrots awkwardly
      const firstName = lead.name.trim().split(/\s+/)[0];
      if (firstName) parts.push(`Name (use at most once, naturally — skip entirely if it looks like a username or handle): ${firstName}`);
    }
    if (lead.destination_country) parts.push(`Destination: ${lead.destination_country}`);
    if (lead.service_interested)  parts.push(`Service: ${lead.service_interested}`);
    if (lead.program_level)       parts.push(`Program: ${lead.program_level}`);
    if (lead.timeline)            parts.push(`Timeline: ${lead.timeline}`);
    if (lead.loan_interest)       parts.push(`Interested in loans`);
    if (lead.payment_status === 'paid') parts.push(`Already paid registration — focus on next steps, not payment`);
    if (lead.notes)               parts.push(`Notes: ${lead.notes}`);

    return parts.length > 0
      ? `\n\n[Known context: ${parts.join(' | ')}]`
      : '';
  } catch {
    return '';
  }
};

const upsertLead = async (phone, data = {}) => {
  try {
    const { data: existing } = await supabase
      .from('leads')
      .select('id, name')
      .eq('phone_number', phone)
      .single();

    if (existing) {
      const updatePayload = { last_interaction: new Date().toISOString(), ...data };
      // Never overwrite a confirmed name (e.g. WhatsApp display name re-appearing each message)
      if (existing.name && data.name) delete updatePayload.name;
      await supabase
        .from('leads')
        .update(updatePayload)
        .eq('phone_number', phone);
    } else {
      await supabase
        .from('leads')
        .insert({ phone_number: phone, last_interaction: new Date().toISOString(), ...data });

      // ── Notify owner of new lead ──────────────────────
      try {
        const { notifyOwner } = require('./notifyOwner');
        await notifyOwner(
          `🆕 *New Lead*\n\nName: ${data.name || 'Unknown'}\nPhone: ${phone}\nSource: ${data.source || 'Telegram'}\nTime: ${new Date().toLocaleTimeString('en-NG', { timeZone: 'Africa/Lagos' })} WAT`
        );
      } catch (e) {
        console.error('[LEAD SERVICE] notify error:', e.message);
      }
    }
  } catch (err) {
    console.error('[LEAD SERVICE] upsertLead error:', err.message);
  }
};

const updateLead = async (phone, updates = {}) => {
  try {
    await supabase
      .from('leads')
      .update({ ...updates, last_interaction: new Date().toISOString() })
      .eq('phone_number', phone);
  } catch (err) {
    console.error('[LEAD SERVICE] updateLead error:', err.message);
  }
};

const getLead = async (phone) => {
  try {
    const { data } = await supabase
      .from('leads')
      .select('*')
      .eq('phone_number', phone)
      .single();
    return data || null;
  } catch (err) {
    console.error('[LEAD SERVICE] getLead error:', err.message);
    return null;
  }
};

const logMessage = async (phone, direction, type, content, waId = null) => {
  try {
    const { data: lead } = await supabase
      .from('leads')
      .select('id')
      .eq('phone_number', phone)
      .single();

    const { error } = await supabase.from('conversations').insert({
      lead_id:       lead?.id || null,
      phone_number:  phone,
      direction,
      message_type:  type,
      content:       content?.slice(0, 4096) || '',
      sent_by:       direction === 'inbound' ? null : 'bot',
      wa_message_id: waId,
      created_at:    new Date().toISOString(),
    });
    if (error) console.error('[LEAD SERVICE] logMessage insert error:', error.message, '| phone:', phone);
  } catch (err) {
    console.error('[LEAD SERVICE] logMessage error:', err.message);
  }
};

module.exports = { upsertLead, updateLead, getLead, logMessage, buildHistory, loadPersistentContext };