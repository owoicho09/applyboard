const { sendButtons, sendText }  = require('../services/messenger');
const { setState }               = require('../utils/stateManager');
const { updateLead }             = require('../services/leadService');
const { MESSAGES, STAGES, BTN }  = require('../config/constants');

const escalate = async (from, state) => {
  await setState(from, STAGES.ESCALATED);
  await updateLead(from, {
    is_escalated:       true,
    conversation_stage: 'escalated',
  });

  // Notify agent on WhatsApp
  const agentNumber = process.env.AGENT_WHATSAPP;
  if (agentNumber) {
    const agentMsg =
      `🔔 *New Escalation — Action Required*\n\n` +
      `📞 Phone: ${from}\n` +
      `👤 Name: ${state.data?.name || 'Unknown'}\n` +
      `📋 Service: ${state.data?.service || 'Unknown'}\n` +
      `🔄 Stage: ${state.stage}\n` +
      `🕐 Time: ${new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos' })}`;

    await sendText(agentNumber, agentMsg).catch((err) =>
      console.error('[ESCALATION] Agent notify failed:', err.message)
    );
  }

  await sendButtons(
    from,
    MESSAGES.escalation,
    [
      { id: BTN.MENU_MAIN,   title: '🏠 Back to Menu' },
      { id: BTN.SVC_CONSULT, title: '📅 Book Appointment' },
    ]
  );
};

module.exports = { escalate };
