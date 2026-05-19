const { sendText, sendButtons } = require('../services/messenger');
const { getState, setState }    = require('../utils/stateManager');
const { STAGES, MESSAGES }      = require('../config/constants');
const { sanitizeText }          = require('../utils/validators');
const { updateLead }            = require('../services/leadService');

const HARD_TRIGGERS = {
  menu:  ['menu', 'main menu', 'home', 'restart', 'start over'],
  paid:  ['i have paid', 'i paid', 'payment done', 'transfer done', 'i sent the money', 'i made payment'],
  agent: ['speak to agent', 'talk to human', 'real person', 'speak to someone', 'call me', 'i want to call'],
};

const matchesHard = (text, keywords) =>
  keywords.some((kw) => text.toLowerCase().includes(kw.toLowerCase()));

// Map exam keywords to amounts
const EXAM_AMOUNTS = {
  'ielts':    85000,
  'toefl':    75000,
  'gre':      90000,
  'gmat':     95000,
  'sat':      80000,
  'pte':      70000,
  'duolingo': 45000,
  'german':   120000,
  'french':   100000,
  'japanese': 110000,
};

const getPaymentAmount = (state) => {
  // Check exam field first — most reliable
  const exam = (state.data?.exam || '').toLowerCase();
  for (const [key, amount] of Object.entries(EXAM_AMOUNTS)) {
    if (exam.includes(key)) return amount;
  }

  // Check service field
  const service = (state.data?.service || '').toLowerCase();
  for (const [key, amount] of Object.entries(EXAM_AMOUNTS)) {
    if (service.includes(key)) return amount;
  }

  // Check chat history for exam mentions
  const history = state.data?.chatHistory || [];
  const allText = history
    .map(h => h.content || '')
    .join(' ')
    .toLowerCase();

  for (const [key, amount] of Object.entries(EXAM_AMOUNTS)) {
    if (allText.includes(key)) return amount;
  }

  // Default registration fee
  return 10000;
};


const handleText = async (from, text, state, message) => {
  const clean = sanitizeText(text).trim();
  const lower = clean.toLowerCase();

  console.log(`[TEXT] from=${from} stage=${state.stage} text="${clean.slice(0, 80)}"`);

  // ── 1. Numeric reply ──────────────────────────────────
  if (/^\d+$/.test(clean) && state.data?.lastMenu?.length) {
    const num  = parseInt(clean, 10);
    const item = state.data.lastMenu.find((m) => m.number === num);
    if (item) {
      const { handleButton } = require('./buttonHandler');
      return handleButton(from, item.id, state, message);
    }
  }

  // ── 2. Waiting for name ───────────────────────────────
  if (state.stage === STAGES.CONSULT_NAME) {
    const { startConsultation } = require('../flows/consultation');
    return startConsultation(from, state, clean);
  }

  // ── 3. Hard triggers ──────────────────────────────────
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

  // ── 4. First message ──────────────────────────────────
  if (state.stage === STAGES.GREETING || !state.stage) {
    const { sendGreeting } = require('../flows/greeting');
    await setState(from, STAGES.FREE_TEXT_AI);
    return sendGreeting(from, state.data?.name);
  }

  // ── 5. Payment awaiting ───────────────────────────────
  if (state.stage === STAGES.PAYMENT_AWAITING) {
    // If they've already paid but state wasn't cleared, fix it
    const { getLead } = require('../services/leadService');
    const lead        = await getLead(from);

    if (lead?.payment_status === 'paid') {
      const { clearState } = require('../utils/stateManager');
      await clearState(from);
      await setState(from, STAGES.FREE_TEXT_AI, {});
      const { askAI } = require('../services/ai');
      return sendText(from, await askAI(from, clean, { stage: STAGES.FREE_TEXT_AI, data: state.data }));
    }

    // Only fire the link immediately for unambiguous "send me the link right now" signals.
    // Everything else — questions, affirmatives, concerns — goes to the AI first.
    const SEND_LINK_NOW = [
      'send the link', 'send link', 'send it now', 'i want to pay now',
      'i am ready to pay', "i'm ready to pay", 'ready to pay now',
      'pay now', 'generate link', 'payment link please', 'gimme the link',
    ];
    const wantsLinkNow = SEND_LINK_NOW.some(kw => lower.includes(kw));

    if (wantsLinkNow) {
      const { handlePayment } = require('../flows/payment');
      const freshState        = await getState(from);
      return handlePayment(from, 'PAY_NOW', freshState);
    }

    // AI handles everything else — questions, objections, "yes", "ok", short replies, follow-ups.
    // The AI decides if the moment is right to offer the link. It can use [[SEND_PAYMENT_LINK]]
    // when the user explicitly confirms they are ready to pay.
    const { askAI } = require('../services/ai');
    const aiReply   = await askAI(
      from, clean, state,
      `This user received a ₦10,000 registration payment link but has not paid yet. They may have questions, concerns, or just be warming up. Your job: answer whatever they asked or respond to what they said — fully, naturally, like Ade would. Address their actual message first. Then, only if the moment feels right, ask softly: "Are you ready to go ahead with the registration?" — do NOT ask this every single message. If they clearly confirm they want to pay (e.g., "yes let's do it", "ok send it"), end your response with [[SEND_PAYMENT_LINK]] on its own line. Never skip their question to push the link. Relationship first, transaction second.`
    );

    const shouldSendLink = aiReply.includes('[[SEND_PAYMENT_LINK]]');
    const cleanReply     = aiReply.replace('[[SEND_PAYMENT_LINK]]', '').trim();

    if (cleanReply) await sendText(from, cleanReply);

    if (shouldSendLink) {
      const { handlePayment } = require('../flows/payment');
      const amount            = getPaymentAmount(state);
      const { updateData }    = require('../utils/stateManager');
      await updateData(from, { payment_amount: amount });
      const freshState = await getState(from);
      await handlePayment(from, 'REGISTRATION', freshState);
    }

    return;
  }

  // ── 6. Escalated — hold the space until human arrives ─
  if (state.stage === STAGES.ESCALATED) {
    const { askAI } = require('../services/ai');
    const aiReply   = await askAI(
      from, clean, state,
      `This user previously asked to speak to a human and was flagged for escalation. A team member has been notified. Your job now: acknowledge warmly that someone is on their way, answer any question they ask in the meantime — but do NOT trigger [[SEND_PAYMENT_LINK]] and do NOT push for registration. Just hold the conversation warmly until the human takes over.`
    );
    return sendText(from, aiReply);
  }

  // ── 7. AI handles everything ──────────────────────────
  try {
    const { askAI } = require('../services/ai');

    // Signal detection writes to DB/Redis — run it in parallel with the AI call
    const [, aiReply] = await Promise.all([
      detectAndSaveSignals(from, lower, state),
      askAI(from, clean, state),
    ]);

    // Check if AI has flagged payment should be sent now
    const shouldSendPayment = aiReply.includes('[[SEND_PAYMENT_LINK]]');

    // Clean the tag from the message before sending to user
    const cleanReply = aiReply.replace('[[SEND_PAYMENT_LINK]]', '').trim();

    // Send the AI message first
    if (cleanReply) {
      await sendText(from, cleanReply);
    }

    // Then immediately send the payment link if flagged
    if (shouldSendPayment) {
      console.log('[PAYMENT TRIGGER] AI flagged payment — generating link...');

      const { handlePayment } = require('../flows/payment');
      const amount             = getPaymentAmount(state);
      const { updateData }     = require('../utils/stateManager');

      // Save amount to state
      await updateData(from, { payment_amount: amount });

      // Get fresh state with updated amount
      const freshState = await getState(from);

      // Fire payment immediately
      await handlePayment(from, 'REGISTRATION', freshState);
    }

  } catch (err) {
    console.error('[TEXT] Error:', err.message);
    return sendText(
      from,
      `Something went wrong on my end. Give me a moment and try again.`
    );
  }
};

const detectAndSaveSignals = async (from, lower, state) => {
  try {
    const updates = {};

    const destinations = {
      'canada':         'Canada',
      'uk':             'United Kingdom',
      'united kingdom': 'United Kingdom',
      'england':        'United Kingdom',
      'britain':        'United Kingdom',
      'germany':        'Germany',
      'usa':            'United States',
      'america':        'United States',
      'united states':  'United States',
      'australia':      'Australia',
      'ireland':        'Ireland',
      'new zealand':    'New Zealand',
      'brazil':         'Brazil',
      'france':         'France',
      'netherlands':    'Netherlands',
      'italy':          'Italy',
      'spain':          'Spain',
      'portugal':       'Portugal',
      'japan':          'Japan',
      'malaysia':       'Malaysia',
      'singapore':      'Singapore',
      'dubai':          'UAE',
      'uae':            'UAE',
      'turkey':         'Turkey',
      'south korea':    'South Korea',
      'korea':          'South Korea',
      'mexico':         'Mexico',
      'argentina':      'Argentina',
      'colombia':       'Colombia',
    };

    for (const [keyword, country] of Object.entries(destinations)) {
      if (lower.includes(keyword) && !state.data?.destination) {
        updates.destination_country = country;
        break;
      }
    }

    if (
      (lower.includes('study') || lower.includes('university') ||
       lower.includes('school') || lower.includes('masters') ||
       lower.includes('degree') || lower.includes('admission')) &&
      !state.data?.service_interested
    ) {
      updates.service_interested = 'study_abroad';
    } else if (
      (lower.includes('visa') || lower.includes('embassy') ||
       lower.includes('immigration')) &&
      !state.data?.service_interested
    ) {
      updates.service_interested = 'visa';
    } else if (
      (lower.includes('loan') || lower.includes('scholarship') ||
       lower.includes('funding') || lower.includes('finance')) &&
      !state.data?.service_interested
    ) {
      updates.service_interested = 'loan';
      updates.loan_interest      = true;
    } else if (
      (lower.includes('ielts') || lower.includes('toefl') ||
       lower.includes('gre')   || lower.includes('gmat') ||
       lower.includes('test prep') || lower.includes('language class')) &&
      !state.data?.service_interested
    ) {
      updates.service_interested = 'test_prep';
    }

    // Detect and save exam type for correct amount calculation
    for (const exam of Object.keys(EXAM_AMOUNTS)) {
      if (lower.includes(exam)) {
        updates.exam = exam.toUpperCase();
        break;
      }
    }

    // Age detection
    const ageMatch = lower.match(/\b(1[89]|[2-5][0-9])\b/);
    if (ageMatch && !state.data?.age) {
      const age = parseInt(ageMatch[1]);
      if (age >= 18 && age <= 60) {
        updates.age = age;
        if (age > 32) {
          updates.notes = `Age ${age} — loan only eligible for Canada and USA`;
        }
      }
    }

    // Budget signals
    if (
      lower.includes('no money')    || lower.includes("can't afford") ||
      lower.includes('expensive')   || lower.includes('budget') ||
      lower.includes('cheap')       || lower.includes('affordable')
    ) {
      updates.budget_range = 'budget_sensitive';
    }

    if (Object.keys(updates).length > 0) {
      await updateLead(from, updates);
      const { updateData } = require('../utils/stateManager');
      await updateData(from, updates);
    }
  } catch (err) {
    console.error('[SIGNALS] Error:', err.message);
  }
};

module.exports = { handleText };