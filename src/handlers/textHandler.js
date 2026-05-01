const { sendText, sendButtons }  = require('../services/whatsapp');
const { getState, setState }     = require('../utils/stateManager');
const { STAGES, BTN, MESSAGES }  = require('../config/constants');
const { sanitizeText }           = require('../utils/validators');
const { updateLead }             = require('../services/leadService');

// Hard keywords that should ALWAYS trigger specific flows
// regardless of what else is in the message
const HARD_TRIGGERS = {
  menu:    ['menu', 'main menu', 'home', 'restart', 'start over'],
  paid:    ['i have paid', 'i paid', 'payment done', 'transfer done', 'i sent the money', 'i made payment'],
  agent:   ['speak to agent', 'talk to human', 'real person', 'speak to someone', 'call me', 'i want to call'],
};

const matchesHard = (text, keywords) =>
  keywords.some((kw) => text.toLowerCase().includes(kw.toLowerCase()));

const handleText = async (from, text, state, message) => {
  const clean = sanitizeText(text).trim();
  const lower = clean.toLowerCase();

  console.log(`[TEXT] from=${from} stage=${state.stage} text="${clean.slice(0, 80)}"`);

  // ── 1. Numeric reply — resolve from last menu ─────────
  // Only resolve numbers if there is an active menu in state
  if (/^\d+$/.test(clean) && state.data?.lastMenu?.length) {
    const num  = parseInt(clean, 10);
    const item = state.data.lastMenu.find((m) => m.number === num);
    if (item) {
      console.log(`[TEXT] Numeric ${num} → btnId: ${item.id}`);
      const { handleButton } = require('./buttonHandler');
      return handleButton(from, item.id, state, message);
    }
  }

  // ── 2. Waiting for name in consultation flow ──────────
  if (state.stage === STAGES.CONSULT_NAME) {
    const { startConsultation } = require('../flows/consultation');
    return startConsultation(from, state, clean);
  }

  // ── 3. Hard triggers — always work regardless of stage ─
  if (matchesHard(lower, HARD_TRIGGERS.menu)) {
    const { sendMainMenu } = require('../flows/mainMenu');
    return sendMainMenu(from);
  }

  if (matchesHard(lower, HARD_TRIGGERS.paid)) {
    return sendText(
      from,
      `✅ *Got it! Payment notification received.*\n\nOur team will confirm your transfer within *1 hour* during business hours.\n\nReference: *${state.data?.payment_ref || 'N/A'}*\n\n📞 ${process.env.BUSINESS_PHONE || '+234 706 345 9820'}`
    );
  }

  if (matchesHard(lower, HARD_TRIGGERS.agent)) {
    const { escalate } = require('../flows/escalation');
    return escalate(from, state);
  }

  // ── 4. First message — send greeting first then AI ────
  if (state.stage === STAGES.GREETING || !state.stage) {
    const { sendGreeting } = require('../flows/greeting');
    await setState(from, STAGES.MAIN_MENU);
    return sendGreeting(from, state.data?.name);
  }

  // ── 5. Everything else — Claude handles it ────────────
  // Claude has full business context, user history, and personality
  // It will respond naturally AND guide toward the right service
  try {
    const { askAI } = require('../services/ai');

    // Update lead with any signals in the message
    await detectAndSaveSignals(from, lower, state);

    const aiReply = await askAI(from, clean, state);
    await sendText(from, aiReply);

    // After AI reply, check if we should offer a consultation prompt
    // Only show buttons if the conversation has been going for a bit
    const historyLength = state.data?.chatHistory?.length || 0;
    if (historyLength >= 4 && historyLength % 4 === 0) {
      // Every 4 exchanges, offer a gentle next step
      await sendButtons(
        from,
        `Ready to take the next step?`,
        [
          { id: BTN.SVC_CONSULT, title: '📞 Free Consultation' },
          { id: BTN.MENU_MAIN,   title: '🏠 All Services' },
          { id: BTN.ESCALATE,    title: '👤 Talk to Agent' },
        ]
      );
    }

  } catch (err) {
    console.error('[TEXT] Error:', err.message);
    await sendButtons(
      from,
      `I didn't quite catch that. What would you like help with?`,
      [
        { id: BTN.MENU_MAIN,   title: '🏠 Main Menu' },
        { id: BTN.SVC_STUDY,   title: '📚 Study Abroad' },
        { id: BTN.SVC_CONSULT, title: '📞 Consultation' },
      ]
    );
  }
};

// Silently detect signals in messages and save to lead record
const detectAndSaveSignals = async (from, lower, state) => {
  try {
    const updates = {};

    // Detect destination mentions
    const destinations = {
      'canada':      'Canada',
      'uk':          'United Kingdom',
      'united kingdom': 'United Kingdom',
      'england':     'United Kingdom',
      'germany':     'Germany',
      'usa':         'United States',
      'america':     'United States',
      'australia':   'Australia',
      'ireland':     'Ireland',
      'new zealand': 'New Zealand',
    };
    for (const [keyword, country] of Object.entries(destinations)) {
      if (lower.includes(keyword) && !state.data?.destination) {
        updates.destination_country = country;
        break;
      }
    }

    // Detect service interest
    if ((lower.includes('study') || lower.includes('school') || lower.includes('university')) && !state.data?.service_interested) {
      updates.service_interested = 'study_abroad';
    } else if ((lower.includes('visa') || lower.includes('travel document')) && !state.data?.service_interested) {
      updates.service_interested = 'visa';
    } else if ((lower.includes('loan') || lower.includes('scholarship') || lower.includes('funding')) && !state.data?.service_interested) {
      updates.service_interested = 'loan';
      updates.loan_interest = true;
    } else if ((lower.includes('ielts') || lower.includes('toefl') || lower.includes('test prep')) && !state.data?.service_interested) {
      updates.service_interested = 'test_prep';
    }

    if (Object.keys(updates).length > 0) {
      await updateLead(from, updates);
    }
  } catch (err) {
    // Non-critical — never crash for this
    console.error('[SIGNALS] Error:', err.message);
  }
};

module.exports = { handleText };