const { sendText }              = require('../services/messenger');
const { setState }              = require('../utils/stateManager');
const { updateLead }            = require('../services/leadService');
const { STAGES }                = require('../config/constants');
const { notifyStaff, notifyAgent } = require('../services/notificationService');

const escalate = async (from, state) => {
  await setState(from, STAGES.ESCALATED);
  await updateLead(from, {
    is_escalated:       true,
    conversation_stage: 'escalated',
  });

  // Notify the right staff member
  await notifyAgent('ESCALATION', {
    phone:   from,
    name:    state.data?.name    || 'Unknown',
    service: state.data?.service || 'Unknown',
    stage:   state.stage,
  });

  await sendText(
    from,
    `Understood. I am flagging this for one of our senior team members right now.\n\nThey will reach out to you directly — usually within 30 minutes during business hours.\n\nIs there anything else you want me to note before they call?`
  );
};

module.exports = { escalate };