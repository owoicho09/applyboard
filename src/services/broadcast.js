const supabase       = require('../config/database');
const { sendText }   = require('./whatsapp');
const { delay }      = require('../utils/helpers');

const sendBroadcast = async (broadcastId, message, filter = {}) => {
  let query = supabase.from('leads').select('phone_number, name');

  if (filter.service)       query = query.eq('service_interested', filter.service);
  if (filter.country)       query = query.eq('destination_country', filter.country);
  if (filter.payment_status) query = query.eq('payment_status', filter.payment_status);
  if (filter.consultation)  query = query.eq('consultation_booked', true);

  const { data: leads, error } = await query;
  if (error) throw error;

  let sent = 0, failed = 0;

  for (const lead of (leads || [])) {
    try {
      const firstName    = lead.name?.split(' ')[0] || 'there';
      const personalized = message.replace('{{name}}', firstName);
      await sendText(lead.phone_number, personalized);
      sent++;
      await delay(1100); // 1.1s between messages — WhatsApp rate limit compliance
    } catch (err) {
      console.error(`[BROADCAST] Failed to send to ${lead.phone_number}:`, err.message);
      failed++;
    }
  }

  await supabase
    .from('broadcasts')
    .update({
      sent_count:    sent,
      failed_count:  failed,
      total_targets: leads?.length || 0,
      status:        'completed',
      sent_at:       new Date().toISOString(),
    })
    .eq('id', broadcastId);

  console.log(`[BROADCAST] Done — Sent: ${sent}, Failed: ${failed}`);
  return { sent, failed, total: leads?.length || 0 };
};

module.exports = { sendBroadcast };