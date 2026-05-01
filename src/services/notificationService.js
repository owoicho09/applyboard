const { sendText } = require('./whatsapp');

const notifyAgent = async (event, data = {}) => {
  const agentNumber = process.env.AGENT_WHATSAPP;
  if (!agentNumber) return;

  let message = '';

  switch (event) {
    case 'NEW_CONSULTATION':
      message =
        `📅 *New Consultation Booked*\n\n` +
        `👤 Name: ${data.name || 'Unknown'}\n` +
        `📞 Phone: ${data.phone}\n` +
        `🕐 Time: ${data.time}\n` +
        `📋 Topic: ${data.service || 'General'}`;
      break;

    case 'PAYMENT_RECEIVED':
      message =
        `💰 *Payment Received*\n\n` +
        `📞 Phone: ${data.phone}\n` +
        `💵 Amount: ₦${Number(data.amount).toLocaleString()}\n` +
        `🔖 Reference: ${data.reference}`;
      break;

    case 'ESCALATION':
      message =
        `🚨 *Escalation — Respond Within 30 Minutes*\n\n` +
        `📞 Phone: ${data.phone}\n` +
        `👤 Name: ${data.name || 'Unknown'}\n` +
        `📋 Service: ${data.service || 'Unknown'}\n` +
        `🔄 Stage: ${data.stage}`;
      break;

    default:
      message = `[ApplyBoard Bot] Event: ${event}\n${JSON.stringify(data)}`;
  }

  await sendText(agentNumber, message).catch((err) =>
    console.error('[NOTIFY] Agent notification failed:', err.message)
  );
};

module.exports = { notifyAgent };