const { sendText, sendButtons } = require('../services/messenger');
const { setState }              = require('../utils/stateManager');
const { updateLead }            = require('../services/leadService');
const { STAGES }                = require('../config/stages');
const { BTN }                   = require('../config/buttons');
const { sanitizeName }          = require('../utils/validators');

// Called when conversion moment is detected — not a "book a call" flow
// This is the natural transition from conversation to registration payment
const startConsultation = async (from, state, action = null) => {

  // If no name yet — collect it naturally
  if (!action || action === 'START') {
    await setState(from, STAGES.CONSULT_NAME);
    return sendText(
      from,
      `Before I send you the registration link, let me get your name so we set things up properly.\n\nWhat do I call you?`
    );
  }

  // Name received
  if (state.stage === STAGES.CONSULT_NAME) {
    const name = sanitizeName(action);
    if (!name || name.length < 2) {
      return sendText(from, `Just your name is fine — what do I call you?`);
    }

    await setState(from, STAGES.PAYMENT_INVOICE, { name });
    await updateLead(from, { name });

    const service = state.data?.service || 'General';

    // Move straight to payment
    const { handlePayment } = require('./payment');
    return handlePayment(from, 'REGISTRATION', {
      ...state,
      data: { ...state.data, name, payment_amount: 10000 },
    });
  }
};

module.exports = { startConsultation };