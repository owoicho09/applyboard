const supabase = require('../config/database');

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

    await supabase.from('conversations').insert({
      lead_id:       lead?.id || null,
      phone_number:  phone,
      direction,
      message_type:  type,
      content:       content?.slice(0, 4096) || '',
      wa_message_id: waId,
    });
  } catch (err) {
    console.error('[LEAD SERVICE] logMessage error:', err.message);
  }
};

module.exports = { upsertLead, updateLead, getLead, logMessage };