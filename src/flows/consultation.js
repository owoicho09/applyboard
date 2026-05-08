const { sendText, sendButtons } = require('../services/messenger');
const { setState }              = require('../utils/stateManager');
const { updateLead }            = require('../services/leadService');
const { STAGES, BTN }           = require('../config/constants');
const { sanitizeName }          = require('../utils/validators');
const supabase                  = require('../config/database');

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

// Called after registration payment confirmed — collect profile and route to staff
const completeRegistration = async (from, state) => {
  const name    = state.data?.name    || 'Client';
  const service = state.data?.service || 'General';

  await updateLead(from, {
    consultation_booked:   true,
    conversation_stage:    'registered',
    consultation_datetime: new Date().toISOString(),
  });

  // Save consultation record
  try {
    const { error } = await supabase.from('consultations').insert({
      phone_number:  from,
      client_name:   name,
      service_topic: service,
      status:        'pending',
    });
    if (error) console.error('[CONSULT] DB error:', error.message);
  } catch (err) {
    console.error('[CONSULT] DB error:', err.message);
  }

  // Notify the right staff
  const { notifyStaff } = require('../services/notificationService');
  await notifyStaff(from, state);

  await sendText(
    from,
    `You are in. Registration confirmed, ${name}.\n\nThe right person on our team will reach out to you shortly with everything you need to move forward.\n\nIn the meantime — is there anything else you want to know?`
  );
};

module.exports = { startConsultation, completeRegistration };