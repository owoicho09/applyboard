const { sendText, sendButtons } = require('../services/messenger');
const { getState, setState, tryLock, releaseLock } = require('../utils/stateManager');
const { STAGES, MESSAGES, COMPANY } = require('../config/constants');
const { sanitizeText }          = require('../utils/validators');
const { updateLead }            = require('../services/leadService');

const HARD_TRIGGERS = {
  menu:  ['menu', 'main menu', 'home', 'restart', 'start over'],
  paid:  ['i have paid', 'i paid', 'payment done', 'transfer done', 'i sent the money', 'i made payment'],
  agent: ['speak to agent', 'talk to human', 'real person', 'speak to someone', 'call me', 'i want to call'],
  // Catches any request for bank account details — response is hardcoded, never touches the AI
  bank:  [
    'account number', 'bank account', 'account details',
    'gtbank', 'another account', 'different account',
    "don't do online", 'no online', 'cant do online', "can't do online",
    'transfer directly', 'send to account', 'direct transfer',
    'send me account', 'give me account', 'account number please',
  ],
};

const matchesHard = (text, keywords) =>
  keywords.some((kw) => text.toLowerCase().includes(kw.toLowerCase()));

// Strip markdown formatting symbols from WhatsApp messages.
// WhatsApp renders these as literal characters — the AI sometimes forgets the rule.
const stripWhatsAppMarkdown = (text) => text
  .replace(/\*([^*\n]+)\*/g, '$1')  // *bold*
  .replace(/_([^_\n]+)_/g, '$1')    // _italic_
  .replace(/^#{1,6}\s+/gm, '')      // # headers at line start
  .replace(/^[*\-]\s+/gm, '');      // bullet starters (* or -)

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
      `Got it. Payment notification received.\n\nOur team will confirm within 1 hour during business hours.\n\nReference: ${state.data?.payment_ref || 'N/A'}\n\n${process.env.BUSINESS_PHONE || COMPANY.phone}`
    );
  }

  if (matchesHard(lower, HARD_TRIGGERS.agent)) {
    const { escalate } = require('../flows/escalation');
    return escalate(from, state);
  }

  if (matchesHard(lower, HARD_TRIGGERS.bank)) {
    // Never touch the AI for bank account requests — return a fixed response only.
    // The AI hallucinated a GTBank account number in production; this intercept prevents recurrence.
    const url = state.data?.payment_url;
    return sendText(from, MESSAGES.paystackTransfer(url));
  }

  // ── 4. First message / returning user ───────────────
  if (state.stage === STAGES.GREETING || !state.stage) {
    const { getLead } = require('../services/leadService');
    const lead        = await getLead(from);

    if (lead?.name || lead?.service_interested || lead?.destination_country) {
      // Returning user — Redis expired but Supabase has their profile.
      // Restore key fields and hand straight to AI with context.
      const restored = {};
      if (lead.name)                restored.name               = lead.name;
      if (lead.destination_country) restored.destination        = lead.destination_country;
      if (lead.service_interested)  restored.service_interested = lead.service_interested;
      if (lead.program_level)       restored.program_level      = lead.program_level;
      if (lead.timeline)            restored.timeline           = lead.timeline;
      if (lead.loan_interest)       restored.loan_interest      = lead.loan_interest;
      if (lead.notes)               restored.notes              = lead.notes;

      await setState(from, STAGES.FREE_TEXT_AI, restored);
      const freshState = await getState(from);

      const { askAI } = require('../services/ai');
      const aiReply   = await askAI(
        from, clean, freshState,
        `This user is returning after a gap — their session expired but they are a known contact. Their profile is already loaded in context. Do NOT re-introduce yourself or say "welcome". Pick up naturally — one warm sentence acknowledging you remember them, then one question that continues where you left off. Profile: ${lead.name ? `name: ${lead.name}` : ''}${lead.destination_country ? `, destination: ${lead.destination_country}` : ''}${lead.service_interested ? `, service: ${lead.service_interested}` : ''}.`
      );
      return sendText(from, aiReply);
    }

    // Genuine new user
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
    const { askAI } = require('../services/ai');
    const aiReply   = await askAI(
      from, clean, state,
      `This user received a ₦10,000 registration payment link but has not paid yet.

WHAT THE ₦10,000 REGISTRATION COVERS — know this cold so you can answer confidently:
Immediate matching with the right specialist for their exact profile. A personal case review and tailored roadmap. Access to partner schools, institutions, and application support. No hidden charges. No service commission added on top. The ₦10,000 is the only fee from us to get started. Any third-party costs (school application fees, visa fees, exam fees) are disclosed upfront by the specialist — never a surprise from our side.

TRUST OBJECTION DETECTION — payment friction only:
A trust objection is ONLY a question about the payment itself. Qualifying phrases: "what do I get", "what is the 10k for", "what am I getting from this", "hidden charges", "additional charges", "any other fees", "service charge", "is that all I pay", "what's your commission", "will I pay more after this", "is there not going to be additional cost". These are about the money specifically.
When you detect one of these:
1. Answer clearly in 1-2 confident sentences — no hedging
2. Close with one sentence: "You are all set — register now and your specialist reaches out same day."
3. Include [[SEND_PAYMENT_LINK]] at the very end. Do NOT ask "are you ready?" after a trust objection — answer, close, done.
Questions about the office address, company history, what services you offer, or how the process works are NOT trust objections — answer them normally, no [[SEND_PAYMENT_LINK]] unless they then confirm they want to pay.

For everything else (genuine questions, hesitation, objections about value):
Answer fully, naturally, as Ade would. Address their message first. Ask a follow-up question only if it moves things forward — not on every single message.

PAYMENT LINK TRIGGER:
When user clearly confirms they want to pay, OR right after answering a trust objection, place [[SEND_PAYMENT_LINK]] on its own line at the very end of your response. This is a machine trigger — it does NOT appear to the user. Do NOT say "I will send you the link" or describe sending it. Just include the tag and say nothing else about it.`
    );

    // Primary detection — AI used the tag correctly
    const tagPresent = aiReply.includes('[[SEND_PAYMENT_LINK]]');

    // Fallback detection — AI narrated the action instead of using the tag
    // Catches phrases like "sending you the link", "link is on its way", "here's your payment link"
    const narrationPattern = /\b(send(ing)? (you )?(the |a )?(payment )?link|link (is |being )?(sent|on its way)|here.{0,10}(payment )?link|your (payment )?link (is )?coming)\b/i;
    const aiNarratedLink   = !tagPresent && narrationPattern.test(aiReply);

    const shouldSendLink = tagPresent || aiNarratedLink;
    const cleanReply     = aiReply.replace('[[SEND_PAYMENT_LINK]]', '').trim();

    if (cleanReply) await sendText(from, cleanReply);

    if (shouldSendLink) {
      const existingUrl = state.data?.payment_url;
      if (existingUrl) {
        // Link already generated this session — resend the stored URL, never charge again
        console.log('[PAYMENT TRIGGER] PAYMENT_AWAITING — resending existing link (dedup)');
        await sendText(from, `Here is your payment link:\n\n${existingUrl}\n\nPay with card, bank transfer, or USSD. Confirmation comes through automatically once done.`);
      } else {
        console.log(`[PAYMENT TRIGGER] PAYMENT_AWAITING — generating new link tag=${tagPresent} narration=${aiNarratedLink}`);
        const { handlePayment } = require('../flows/payment');
        const amount            = getPaymentAmount(state);
        const { updateData }    = require('../utils/stateManager');
        await updateData(from, { payment_amount: amount });
        const freshState = await getState(from);
        await handlePayment(from, 'REGISTRATION', freshState);
      }
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
  const acquired = await tryLock(from);
  if (!acquired) {
    return; // previous message still processing — drop silently rather than sending a visible lockout message
  }
  try {
    const { askAI } = require('../services/ai');

    // Signal detection writes to DB/Redis — run it in parallel with the AI call
    const [, aiReply] = await Promise.all([
      detectAndSaveSignals(from, lower, state),
      askAI(from, clean, state),
    ]);

    const tagPresent = aiReply.includes('[[SEND_PAYMENT_LINK]]');

    // Strip tag and — for WhatsApp — strip any markdown the AI leaked
    let cleanReply = aiReply.replace('[[SEND_PAYMENT_LINK]]', '').trim();
    if (!from.startsWith('tg_')) cleanReply = stripWhatsAppMarkdown(cleanReply);

    if (cleanReply) await sendText(from, cleanReply);

    if (tagPresent) {
      const freshState = await getState(from);
      const d          = freshState.data || {};
      const hasContext = !!(d.name || d.destination || d.service_interested || d.destination_country);

      if (!hasContext) {
        // No qualification data yet — block the payment trigger
        console.log('[GUARDRAIL] Payment tag blocked — no context collected');
      } else if (d.payment_url) {
        // Link already generated this session — resend stored URL (FREE_TEXT_AI dedup)
        console.log('[PAYMENT TRIGGER] FREE_TEXT_AI — resending existing link (dedup)');
        await sendText(from, `Here is your payment link:\n\n${d.payment_url}\n\nPay with card, bank transfer, or USSD. Confirmation comes through automatically once done.`);
      } else {
        console.log('[PAYMENT TRIGGER] AI flagged payment — generating link...');
        const { handlePayment } = require('../flows/payment');
        const amount             = getPaymentAmount(state);
        const { updateData }     = require('../utils/stateManager');
        await updateData(from, { payment_amount: amount });
        const payState = await getState(from);
        await handlePayment(from, 'REGISTRATION', payState);
      }
    }

  } catch (err) {
    console.error('[TEXT] Error:', err.message);
    return sendText(
      from,
      `Something went wrong on my end. Give me a moment and try again.`
    );
  } finally {
    await releaseLock(from);
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

    // Returns true if a negation word ("no loan", "don't need a visa") precedes the keyword
    const isNegated = (text, keyword) => {
      const idx = text.indexOf(keyword);
      if (idx === -1) return false;
      const before = text.slice(Math.max(0, idx - 35), idx);
      return /\b(no|not|don'?t|never|without|no need for|avoid|instead of)\b/.test(before);
    };

    if (
      (lower.includes('study') || lower.includes('university') ||
       lower.includes('school') || lower.includes('masters') ||
       lower.includes('degree') || lower.includes('admission')) &&
      !state.data?.service_interested &&
      !isNegated(lower, 'study')
    ) {
      updates.service_interested = 'study_abroad';
    } else if (
      (lower.includes('visa') || lower.includes('embassy') ||
       lower.includes('immigration')) &&
      !state.data?.service_interested &&
      !isNegated(lower, 'visa')
    ) {
      updates.service_interested = 'visa';
    } else if (
      (lower.includes('loan') || lower.includes('scholarship') ||
       lower.includes('funding') || lower.includes('finance')) &&
      !state.data?.service_interested &&
      !isNegated(lower, 'loan') && !isNegated(lower, 'scholarship')
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

    // Age detection — require an explicit age indicator to avoid false positives on prices/durations
    const hasAgeContext = /\b(age[d]?|i\s+am|i'?m|years?\s+old|yr[s]?\s+old|born\s+in)\b/.test(lower);
    if (hasAgeContext) {
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