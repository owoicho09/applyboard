const { sendButtons, sendText } = require('../services/whatsapp');
const { getState, setState }    = require('../utils/stateManager');
const { updateLead }            = require('../services/leadService');
const { MESSAGES, STAGES, BTN } = require('../config/constants');
const { sanitizeName }          = require('../utils/validators');
const supabase                  = require('../config/database');

const TIME_LABELS = {
  [BTN.CT_MORNING]:   'Morning (9am–12pm)',
  [BTN.CT_AFTERNOON]: 'Afternoon (12pm–5pm)',
  [BTN.CT_EVENING]:   'Evening (5pm–8pm)',
};

const startConsultation = async (from, state, action = null) => {
  // ── Stage: ask for name ───────────────────────────────
  if (!action || action === 'START') {
    await setState(from, STAGES.CONSULT_NAME);
    return sendText(from, MESSAGES.consultationPush);
  }

  // ── Stage: name received → ask for time ──────────────
  if (state.stage === STAGES.CONSULT_NAME) {
    const name = sanitizeName(action);
    if (!name || name.length < 2) {
      return sendText(from, `Please enter your full name (letters only):`);
    }
    await setState(from, STAGES.CONSULT_TIME, { name });
    await updateLead(from, { name });

    return sendButtons(
      from,
      `Thank you, *${name}*! 😊\n\nWhen is the best time for your FREE consultation?`,
      [
        { id: BTN.CT_MORNING,   title: '🌅 Morning' },
        { id: BTN.CT_AFTERNOON, title: '☀️ Afternoon' },
        { id: BTN.CT_EVENING,   title: '🌙 Evening' },
      ]
    );
  }

  // ── Stage: time received → confirm & save ────────────
  if (state.stage === STAGES.CONSULT_TIME) {
    const timeLabel = TIME_LABELS[action];
    if (!timeLabel) {
      return sendButtons(
        from,
        'Please select your preferred time:',
        [
          { id: BTN.CT_MORNING,   title: '🌅 Morning' },
          { id: BTN.CT_AFTERNOON, title: '☀️ Afternoon' },
          { id: BTN.CT_EVENING,   title: '🌙 Evening' },
        ]
      );
    }

    const name    = state.data?.name || 'Client';
    const service = state.data?.service || 'General Enquiry';

    await setState(from, STAGES.CONSULT_CONFIRMED, { preferred_time: timeLabel });

    // Save to consultations table
// Save to consultations table
    try {
      const { error } = await supabase.from('consultations').insert({
        phone_number:   from,
        client_name:    name,
        preferred_time: timeLabel,
        service_topic:  service,
        status:         'pending',
      });
      if (error) console.error('[CONSULT] DB insert error:', error.message);
    } catch (err) {
      console.error('[CONSULT] DB insert error:', err.message);
    }


    // Update lead record
    await updateLead(from, {
      consultation_booked:   true,
      conversation_stage:    'consultation_booked',
      consultation_datetime: new Date().toISOString(),
    });

    await sendText(from, MESSAGES.consultationConfirmed(name, timeLabel, service));

    // Follow-up buttons
    return sendButtons(
      from,
      `While you wait, would you like to explore more?`,
      [
        { id: BTN.MENU_MAIN,  title: '🏠 Main Menu' },
        { id: BTN.SVC_LOAN,   title: '💰 Loan Options' },
        { id: BTN.PAY_NOW,    title: '💳 Pay Now' },
      ]
    );
  }
};

module.exports = { startConsultation };