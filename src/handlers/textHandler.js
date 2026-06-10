const { sendText, sendButtons } = require('../services/messenger');
const { getState, setState, tryLock, releaseLock } = require('../utils/stateManager');
const { COMPANY, EXAM_AMOUNTS }   = require('../config/constants');
const { STAGES }                  = require('../config/stages');
const { MESSAGES }                = require('../config/messages');
const { sanitizeText }          = require('../utils/validators');
const { updateLead }            = require('../services/leadService');

const HARD_TRIGGERS = {
  menu:  ['menu', 'main menu', 'home', 'restart', 'start over'],
  paid:  [
    'i have paid', 'i paid', 'payment done', 'transfer done',
    'i sent the money', 'i made payment', 'payment successful',
    'done paying', 'money sent', 'i have transferred', 'just paid now',
    'i transferred', 'payment made', 'i just paid',
  ],
  agent: ['speak to agent', 'talk to human', 'real person', 'speak to someone', 'call me', 'i want to call'],
  // Catches any request for bank account details — response is hardcoded, never touches the AI
  bank:  [
    'account number', 'bank account', 'account details',
    'gtbank', 'another account', 'different account',
    "don't do online", 'dont do online', 'no online', 'cant do online', "can't do online",
    'send to account', 'direct transfer', 'transfer to you', 'send directly to',
    'send me account', 'give me account', 'account number please',
  ],
};

// Normalise apostrophes and smart quotes before keyword matching so
// "dont" and "don't" both hit the same trigger.
const normaliseText = (s) =>
  s.replace(/[‘’ʼ]/g, "'").replace(/[“”]/g, '"');

const matchesHard = (text, keywords) => {
  const normalised = normaliseText(text.toLowerCase());
  return keywords.some((kw) => normalised.includes(kw.toLowerCase()));
};

// Strip markdown formatting symbols from WhatsApp messages.
// WhatsApp renders these as literal characters — the AI sometimes forgets the rule.
const stripWhatsAppMarkdown = (text) => text
  .replace(/\*([^*\n]+)\*/g, '$1')  // *bold*
  .replace(/_([^_\n]+)_/g, '$1')    // _italic_
  .replace(/^#{1,6}\s+/gm, '')      // # headers at line start
  .replace(/^[*\-]\s+/gm, '');      // bullet starters (* or -)

const checkThreshold = (data) => {
  const hasDirection = !!(data.destination_country || data.destination || data.service_interested);
  const hasGoal      = !!(data.program_level || data.service_interested);
  const personalDetails = [
    data.motivation, data.budget_range || data.budget,
    data.age, data.work_experience, data.passport_status, data.fears,
  ].filter(Boolean).length;
  return hasDirection && hasGoal && personalDetails >= 2;
};

const buildAgendaNote = (data) => {
  const have = [];
  const need = [];

  const fields = {
    motivation:     data.motivation,
    destination:    data.destination_country || data.destination,
    service:        data.service_interested,
    program:        data.program_level,
    urgency:        data.urgency,
    budget:         data.budget_range || data.budget,
    age:            data.age,
    qualifications: data.work_experience,
    passport:       data.passport_status,
    fears:          data.fears,
  };

  for (const [k, v] of Object.entries(fields)) {
    if (v) have.push(`${k}: ${v}`);
    else need.push(k);
  }

  const thresholdMet = checkThreshold(data);

  // Mode: SUMMARY — threshold met, read-back not yet sent
  if (thresholdMet && !data.summaryShown) {
    return `[AGENDA STATUS — internal only, do not narrate to the user]
Collected: ${have.join(' | ')}

You have enough of a picture. Answer any question in their message first if there is one. Then in one sentence read back what you actually heard from this specific person — not a template, their actual situation. Then ask: "There's a ₦10,000 registration that gets your case properly matched and moving — want me to sort that now?" Stop there. Do not explain more. If they confirm in this same message, include [[SEND_PAYMENT_LINK]] at the very end.`;
  }

  // Mode: REGISTRATION — summary already sent, user is responding to the ask
  if (thresholdMet && data.summaryShown) {
    return `[AGENDA STATUS — internal only, do not narrate to the user]
Collected: ${have.join(' | ')}

The ₦10,000 ask was already made. The user is responding now.
If they confirmed (yes, ok, okay, sure, proceed, go ahead, ready, let's go, i'm ready, do it, sorted) → include [[SEND_PAYMENT_LINK]] at the very end. Say nothing about the link. No explanation. One brief line max.
If they asked a question → answer it in one sentence, then: "Ready to go ahead?" Include [[SEND_PAYMENT_LINK]] only when they next confirm.
If they said no or not yet → "No stress, I'll be here when you're ready."
Do not repeat the full pitch. Do not re-summarize. Do not ask again this session if they declined.`;
  }

  // Mode: COLLECTING — still gathering information
  return `[AGENDA STATUS — internal only, do not narrate to the user]
Collected: ${have.length ? have.join(' | ') : 'nothing yet'}
Still needed: ${need.join(', ')}

Work missing fields into the conversation naturally, one at a time, only when the moment fits. Never run through them as a checklist. Answer any question they ask first, then come back.`;
};

const getPaymentAmount = (state) => {
  const { REGISTRATION_FEE } = require('../config/constants');
  const serviceInterested = (state.data?.service_interested || '').toLowerCase();

  // Only charge exam coaching price when the service is explicitly test prep.
  // A study abroad or loan lead who mentioned IELTS in passing must still pay ₦10,000.
  if (serviceInterested === 'test_prep') {
    const exam = (state.data?.exam || '').toLowerCase();
    for (const [key, amount] of Object.entries(EXAM_AMOUNTS)) {
      if (exam.includes(key)) return amount;
    }
    // test_prep but no exam field — scan history as last resort
    const history = state.data?.chatHistory || [];
    const allText = history.map(h => h.content || '').join(' ').toLowerCase();
    for (const [key, amount] of Object.entries(EXAM_AMOUNTS)) {
      if (allText.includes(key)) return amount;
    }
  }

  return REGISTRATION_FEE;
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
      // If they had a pending payment, mark summaryShown so the loop doesn't restart
      if (lead.payment_status === 'pending') restored.summaryShown = true;

      await setState(from, STAGES.FREE_TEXT_AI, restored);
      const freshState   = await getState(from);
      const agendaNote   = buildAgendaNote(freshState.data || {});

      const { askAI } = require('../services/ai');
      const aiReply   = await askAI(
        from, clean, freshState,
        `This user is returning after a gap — their session expired but they are a known contact. Their profile is already loaded in context. Do NOT re-introduce yourself or say "welcome". Pick up naturally — one warm sentence acknowledging you remember them, then one question that continues where you left off.\n\n${agendaNote}`
      );
      return sendText(from, aiReply);
    }

    // Genuine new user — AI reads their first message and responds to it specifically
    await setState(from, STAGES.FREE_TEXT_AI);
    const newState = await getState(from);

    // Fire signal extraction in background — don't block the greeting
    const { extractProfileSignals } = require('../utils/profileExtractor');
    Promise.all([
      detectAndSaveSignals(from, lower, newState),
      extractProfileSignals(from, clean, newState),
    ]).catch(() => {});

    const { askAI } = require('../services/ai');
    const greetingNote = `This is a brand new user — their very first message. Read exactly what they said and respond to it specifically — show you heard what they actually want. Then ask the one question that takes it one layer deeper into their situation. Two sentences maximum. No welcome speech. No list of services. No "how can I help you today".`;
    const greeting = await askAI(from, clean, newState, greetingNote);
    return sendText(from, greeting);
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
      'let proceed', "let's proceed", 'lets proceed', 'proceed with payment',
      'i want to go ahead', 'go ahead and pay', 'yes i want to pay',
      'i am ready to proceed', "i'm ready to proceed", 'process it',
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

  // ── 6. Profile consultation stages ───────────────────
  if (state.stage === STAGES.PROFILE_COLLECTING) {
    const { handleProfileCollecting } = require('../flows/profileConsultation');
    return handleProfileCollecting(from, clean, state);
  }

  if (state.stage === STAGES.PROFILE_SUMMARY) {
    const { handleProfileSummary } = require('../flows/profileConsultation');
    return handleProfileSummary(from, clean, state);
  }

  if (state.stage === STAGES.PROFILE_ROADMAP) {
    const { handleProfileRoadmap } = require('../flows/profileConsultation');
    return handleProfileRoadmap(from, clean, state);
  }

  // ── 7. Escalated — hold the space until human arrives ─
  if (state.stage === STAGES.ESCALATED) {
    const { askAI } = require('../services/ai');
    const aiReply   = await askAI(
      from, clean, state,
      `This user previously asked to speak to a human and was flagged for escalation. A team member has been notified. Your job now: acknowledge warmly that someone is on their way, answer any question they ask in the meantime — but do NOT trigger [[SEND_PAYMENT_LINK]] and do NOT push for registration. Just hold the conversation warmly until the human takes over.`
    );
    return sendText(from, aiReply);
  }

  // ── 8. AI handles everything ──────────────────────────
  const acquired = await tryLock(from);
  if (!acquired) {
    return; // previous message still processing — drop silently rather than sending a visible lockout message
  }
  try {
    const { askAI } = require('../services/ai');
    const { extractProfileSignals } = require('../utils/profileExtractor');

    // Extract signals first so the agenda note reflects this turn's data
    await Promise.all([
      detectAndSaveSignals(from, lower, state),
      extractProfileSignals(from, clean, state),
    ]);
    const freshState = await getState(from);
    const freshData  = freshState.data || {};

    // Hard bypass — when threshold is met and the ask was already made,
    // a simple affirmative goes straight to payment without touching the AI.
    // Prevents the "Yes → re-pitch → Yes → re-pitch" loop entirely.
    if (checkThreshold(freshData) && freshData.summaryShown && freshData.payment_status !== 'paid') {
      const AFFIRM = [
        'yes', 'yep', 'yh', 'yeah', 'ok', 'okay', 'k', 'sure', 'proceed',
        'go ahead', "let's go", 'lets go', 'let proceed', "let's proceed",
        'lets proceed', 'do it', 'ready', "i'm ready", 'i am ready',
        'go on', 'confirmed', 'sorted', 'send it', 'i want to go ahead',
        'yes please', 'definitely', 'yes i want', 'i want to proceed',
        'i would like to proceed', 'i am ready to proceed', "i'm ready to proceed",
      ];
      const isAffirmative = AFFIRM.some(a => lower.trim() === a || lower.trim() === a + '.' || lower.trim() === a + '!');
      if (isAffirmative && !freshData.payment_url) {
        try {
          const { handlePayment } = require('../flows/payment');
          const { updateData }    = require('../utils/stateManager');
          await updateData(from, { payment_amount: getPaymentAmount(freshState) });
          const payState = await getState(from);
          return await handlePayment(from, 'REGISTRATION', payState);
        } finally {
          await releaseLock(from);
        }
      }
    }

    const agendaNote = buildAgendaNote(freshData);
    const wasSummaryTurn = checkThreshold(freshData) && !freshData.summaryShown;
    const aiReply    = await askAI(from, clean, freshState, agendaNote);

    // Mark summary as shown so next turn moves to registration mode
    if (wasSummaryTurn) {
      const { updateData } = require('../utils/stateManager');
      await updateData(from, { summaryShown: true });
    }

    const tagPresent = aiReply.includes('[[SEND_PAYMENT_LINK]]');

    // Catches phrases where the AI described sending a link instead of using the tag.
    // Mirrors the same pattern used in the PAYMENT_AWAITING handler.
    const narrationPattern = /\b(send(ing)? (you )?(the |a )?(payment )?link|link (is |being )?(sent|on its way)|here.{0,10}(payment )?link|your (payment )?link (is )?coming)\b/i;
    const aiNarratedLink   = !tagPresent && narrationPattern.test(aiReply);

    const shouldSendLink = tagPresent || aiNarratedLink;

    // Strip tag and — for WhatsApp — strip any markdown the AI leaked
    let cleanReply = aiReply.replace('[[SEND_PAYMENT_LINK]]', '').trim();
    if (!from.startsWith('tg_')) cleanReply = stripWhatsAppMarkdown(cleanReply);

    if (cleanReply) await sendText(from, cleanReply);

    if (shouldSendLink) {
      const d = freshState.data || {};
      const hasContext = !!(d.name || d.destination || d.service_interested || d.destination_country);

      if (!hasContext) {
        // No qualification data yet — block the payment trigger
        console.log('[GUARDRAIL] Payment tag blocked — no context collected');
      } else if (d.payment_status === 'paid') {
        // Lead already paid — never charge again regardless of what the AI said
        console.log('[GUARDRAIL] Payment tag blocked — lead already paid');
      } else if (d.service_interested === 'test_prep' && !d.exam) {
        // Test prep without a confirmed exam — AI fired the tag incorrectly.
        // Test prep does not use the ₦10,000 registration; clients pay class fees directly.
        console.log('[GUARDRAIL] Payment tag blocked — test_prep service, no exam confirmed');
      } else if (d.payment_url) {
        // Link already generated this session — resend stored URL (FREE_TEXT_AI dedup)
        console.log(`[PAYMENT TRIGGER] FREE_TEXT_AI — resending existing link tag=${tagPresent} narration=${aiNarratedLink}`);
        await sendText(from, `Here is your payment link:\n\n${d.payment_url}\n\nPay with card, bank transfer, or USSD. Confirmation comes through automatically once done.`);
      } else {
        console.log(`[PAYMENT TRIGGER] AI flagged payment — generating link tag=${tagPresent} narration=${aiNarratedLink}`);
        const { handlePayment } = require('../flows/payment');
        const amount             = getPaymentAmount(freshState);
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

    // Loan/scholarship checked FIRST — "loan for my masters" contains "masters" which would
    // otherwise trigger study_abroad before reaching this branch.
    if (
      (lower.includes('loan') || lower.includes('scholarship') ||
       lower.includes('funding') || lower.includes('finance')) &&
      !state.data?.service_interested &&
      !isNegated(lower, 'loan') && !isNegated(lower, 'scholarship')
    ) {
      updates.service_interested = 'loan';
      updates.loan_interest      = true;
    } else if (
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