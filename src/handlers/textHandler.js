const { sendText }           = require('../services/messenger');
const { getState, setState } = require('../utils/stateManager');
const { STAGES, MESSAGES }   = require('../config/constants');
const { sanitizeText }       = require('../utils/validators');
const { updateLead }         = require('../services/leadService');

// Hard triggers — always work regardless of conversation stage
const HARD_TRIGGERS = {
  menu:  ['menu', 'main menu', 'home', 'restart', 'start over'],
  paid:  ['i have paid', 'i paid', 'payment done', 'transfer done', 'i sent the money', 'i made payment'],
  agent: ['speak to agent', 'talk to human', 'real person', 'speak to someone', 'call me', 'i want to call'],
};

const matchesHard = (text, keywords) =>
  keywords.some((kw) => text.toLowerCase().includes(kw.toLowerCase()));

const handleText = async (from, text, state, message) => {
  const clean = sanitizeText(text).trim();
  const lower = clean.toLowerCase();

  console.log(`[TEXT] from=${from} stage=${state.stage} text="${clean.slice(0, 80)}"`);

  // ── 1. Numeric reply — resolve from last menu ─────────
  if (/^\d+$/.test(clean) && state.data?.lastMenu?.length) {
    const num  = parseInt(clean, 10);
    const item = state.data.lastMenu.find((m) => m.number === num);
    if (item) {
      console.log(`[TEXT] Numeric ${num} → btnId: ${item.id}`);
      const { handleButton } = require('./buttonHandler');
      return handleButton(from, item.id, state, message);
    }
  }

  // ── 2. Waiting for name during registration ───────────
  if (state.stage === STAGES.CONSULT_NAME) {
    const { startConsultation } = require('../flows/consultation');
    return startConsultation(from, state, clean);
  }

  // ── 3. Hard triggers — work anywhere in conversation ──
  if (matchesHard(lower, HARD_TRIGGERS.menu)) {
    const { sendMainMenu } = require('../flows/mainMenu');
    return sendMainMenu(from);
  }

  if (matchesHard(lower, HARD_TRIGGERS.paid)) {
    return sendText(
      from,
      `Got it. Payment notification received.\n\nOur team will confirm within 1 hour during business hours.\n\nReference: ${state.data?.payment_ref || 'N/A'}\n\n${process.env.BUSINESS_PHONE || '+234 706 345 9820'}`
    );
  }

  if (matchesHard(lower, HARD_TRIGGERS.agent)) {
    const { escalate } = require('../flows/escalation');
    return escalate(from, state);
  }

  // ── 4. First message — send greeting ─────────────────
  if (state.stage === STAGES.GREETING || !state.stage) {
    const { sendGreeting } = require('../flows/greeting');
    await setState(from, STAGES.FREE_TEXT_AI);
    return sendGreeting(from, state.data?.name);
  }

  // ── 5. AI handles everything else ────────────────────
  // No buttons after AI response — conversation flows naturally
  try {
    const { askAI } = require('../services/ai');

    // Silently capture signals from the message into the lead record
    await detectAndSaveSignals(from, lower, state);

    const aiReply = await askAI(from, clean, state);
    return sendText(from, aiReply);

  } catch (err) {
    console.error('[TEXT] Error:', err.message);
    return sendText(
      from,
      `Something went wrong on my end. Give me a moment and try again.`
    );
  }
};

// ── Silently detect and save signals to CRM ───────────────
// Runs in background — never crashes the main flow
const detectAndSaveSignals = async (from, lower, state) => {
  try {
    const updates = {};

    // Destination detection — expanded country list
    const destinations = {
      'canada':        'Canada',
      'uk':            'United Kingdom',
      'united kingdom':'United Kingdom',
      'england':       'United Kingdom',
      'britain':       'United Kingdom',
      'germany':       'Germany',
      'usa':           'United States',
      'america':       'United States',
      'united states': 'United States',
      'australia':     'Australia',
      'ireland':       'Ireland',
      'new zealand':   'New Zealand',
      'brazil':        'Brazil',
      'france':        'France',
      'netherlands':   'Netherlands',
      'italy':         'Italy',
      'spain':         'Spain',
      'portugal':      'Portugal',
      'japan':         'Japan',
      'malaysia':      'Malaysia',
      'singapore':     'Singapore',
      'dubai':         'UAE',
      'uae':           'UAE',
      'turkey':        'Turkey',
      'south korea':   'South Korea',
      'korea':         'South Korea',
      'mexico':        'Mexico',
      'argentina':     'Argentina',
      'colombia':      'Colombia',
    };

    for (const [keyword, country] of Object.entries(destinations)) {
      if (lower.includes(keyword) && !state.data?.destination) {
        updates.destination_country = country;
        break;
      }
    }

    // Service interest detection
    if (
      (lower.includes('study') || lower.includes('university') ||
       lower.includes('school') || lower.includes('masters') ||
       lower.includes('degree') || lower.includes('admission')) &&
      !state.data?.service_interested
    ) {
      updates.service_interested = 'study_abroad';
    } else if (
      (lower.includes('visa') || lower.includes('travel document') ||
       lower.includes('embassy') || lower.includes('immigration')) &&
      !state.data?.service_interested
    ) {
      updates.service_interested = 'visa';
    } else if (
      (lower.includes('loan') || lower.includes('scholarship') ||
       lower.includes('funding') || lower.includes('finance') ||
       lower.includes('tuition')) &&
      !state.data?.service_interested
    ) {
      updates.service_interested = 'loan';
      updates.loan_interest      = true;
    } else if (
      (lower.includes('ielts') || lower.includes('toefl') ||
       lower.includes('gre') || lower.includes('gmat') ||
       lower.includes('test prep') || lower.includes('language class')) &&
      !state.data?.service_interested
    ) {
      updates.service_interested = 'test_prep';
    } else if (
      lower.includes('flight') || lower.includes('hotel') ||
      lower.includes('travel') || lower.includes('ticket')
    ) {
      updates.service_interested = 'travel';
    } else if (
      lower.includes('hajj') || lower.includes('umrah') ||
      lower.includes('pilgrimage')
    ) {
      updates.service_interested = 'pilgrimage';
    }

    // Age detection — important for loan eligibility rules
    const ageMatch = lower.match(/\b(1[89]|[2-5][0-9])\b/);
    if (ageMatch && !state.data?.age) {
      const age = parseInt(ageMatch[1]);
      if (age >= 18 && age <= 60) {
        updates.age = age;
        // Flag loan restriction if above 32
        if (age > 32) {
          updates.notes = `Age ${age} — loan only eligible for Canada and USA`;
        }
      }
    }

    // Budget signals
    if (
      lower.includes('no money') || lower.includes('can\'t afford') ||
      lower.includes('expensive') || lower.includes('budget') ||
      lower.includes('cheap') || lower.includes('affordable')
    ) {
      updates.budget_range = 'budget_sensitive';
    }

    if (Object.keys(updates).length > 0) {
      await updateLead(from, updates);
      // Also update state data so AI has fresh context
      const { updateData } = require('../utils/stateManager');
      await updateData(from, updates);
    }
  } catch (err) {
    console.error('[SIGNALS] Error:', err.message);
  }
};

module.exports = { handleText };