const { sendText }                                            = require('../services/messenger');
const { setState, updateData, getState, tryLock, releaseLock } = require('../utils/stateManager');
const { updateLead }                                          = require('../services/leadService');
const { STAGES }                                              = require('../config/stages');
const { extractProfileSignals, detectAwaitingDoc }            = require('../utils/profileExtractor');
const { computeLeadScore }                                    = require('../utils/leadScorer');
const { PROFILE_COLLECTION_GUIDANCE }                         = require('../config/prompts');
const { stripWhatsAppMarkdown }                               = require('../utils/validators');

// Builds the per-turn guidance note the AI gets while collecting the profile
const buildProfileNote = (data) => {
  const have = [];
  const need = [];

  const fields = {
    motivation:      data.motivation,
    urgency:         data.urgency,
    name:            data.name,
    age:             data.age,
    program_level:   data.program_level,
    destination:     data.destination_country || data.destination,
    passport_status: data.passport_status,
    work_experience: data.work_experience,
    budget:          data.budget_range || data.budget,
  };

  for (const [k, v] of Object.entries(fields)) {
    if (v) have.push(`${k}: ${v}`);
    else need.push(k);
  }

  const docs   = data.documents_checklist || {};
  const docStr = ['passport', 'degree', 'transcript', 'cv']
    .map(d => `${d}=${docs[d] ? 'received' : 'pending'}`)
    .join(', ');

  // Show only the top 3 missing fields — prevents checklist behaviour
  const PRIORITY = ['destination', 'motivation', 'program_level', 'name', 'age', 'urgency', 'passport_status', 'work_experience', 'budget'];
  const topNeeded = need.filter(f => PRIORITY.includes(f)).slice(0, 3);

  return `PROFILE STATUS — do not narrate this to the user, use it to guide the conversation naturally:
Collected: ${have.length ? have.join(' | ') : 'nothing yet'}
Priority next: ${topNeeded.length ? topNeeded.join(', ') : 'all key fields covered'}
Documents: ${docStr}

Work the missing fields into the conversation at natural moments. One question at a time. Never run through them like a checklist.
${PROFILE_COLLECTION_GUIDANCE}`;
};

// Returns true when we have enough data to move to summary, regardless of AI signal
const hasEnoughForSummary = (data) => {
  const hasDirection = !!(data.destination_country || data.destination || data.service_interested);
  const hasPersonal  = !!(data.motivation || data.urgency || data.budget_range || data.budget || data.work_experience);
  const hasProfile   = !!(data.name || data.program_level || data.age);
  return hasDirection && hasPersonal && hasProfile;
};

// Entry point — replaces startConsultation for the new profile-based flow
const startProfileConsultation = async (from, state) => {
  await setState(from, STAGES.PROFILE_COLLECTING);
  const { askAI } = require('../services/ai');
  const reply = await askAI(
    from,
    '[CONSULTATION_START]',
    { stage: STAGES.FREE_TEXT_AI, data: state.data || {} },
    `The user just clicked to start a consultation. Open with ONE warm, human question about what is driving their decision — why they want to go abroad, what they want to do there, what made them start thinking about this. Not a welcome speech. Not a service list. Not "how can I help". Just one natural question that shows you actually want to understand their situation. Keep it to one sentence.`
  );
  const clean = !from.startsWith('tg_') ? stripWhatsAppMarkdown(reply) : reply;
  return sendText(from, clean);
};

const handleProfileCollecting = async (from, text, state) => {
  const acquired = await tryLock(from);
  if (!acquired) return;

  try {
    const { askAI } = require('../services/ai');

    // Extract signals FIRST so the profile note and AI context reflect this turn's data
    await extractProfileSignals(from, text, state);
    const freshState = await getState(from);
    const note = buildProfileNote(freshState.data || {});

    const aiReply = await askAI(from, text, freshState, note);

    const profileReady = aiReply.includes('[[PROFILE_READY]]');
    let cleanReply     = aiReply.replace('[[PROFILE_READY]]', '').trim();
    if (!from.startsWith('tg_')) cleanReply = stripWhatsAppMarkdown(cleanReply);

    // Track which document the AI just asked for so media handler can label incoming files
    const awaitingDoc = detectAwaitingDoc(aiReply);
    if (awaitingDoc) await updateData(from, { awaitingDoc });

    if (cleanReply) await sendText(from, cleanReply);

    // Transition to summary if AI signalled ready OR auto-threshold met
    const postState = await getState(from);
    if (profileReady || hasEnoughForSummary(postState.data || {})) {
      await setState(from, STAGES.PROFILE_SUMMARY, { ...postState.data, summaryGenerated: true });

      const summaryNote = `You now have a solid picture of this person. Read it back as a natural, human summary — like you're quickly catching up a colleague. NOT a bullet list. Conversational prose. Cover their destination, what they want to do (study/work/visa/relocate), timeline if known, any documents mentioned, and one standout detail that shows you were listening. Keep it to 3–4 sentences. End with something like: "That's actually a workable profile — does that sound right to you?" Then stop and wait for confirmation.`;

      const summaryReply = await askAI(from, '[GENERATE_SUMMARY]', await getState(from), summaryNote);
      let cleanSummary = summaryReply;
      if (!from.startsWith('tg_')) cleanSummary = stripWhatsAppMarkdown(cleanSummary);
      await sendText(from, cleanSummary);
    }
  } finally {
    await releaseLock(from);
  }
};

const handleProfileSummary = async (from, text, state) => {
  const { askAI } = require('../services/ai');

  // Detect confirmation vs correction
  const lower = text.toLowerCase().trim();
  const confirmed = ['yes', 'yep', 'yh', 'yeah', 'correct', 'right', 'accurate',
    'exactly', 'sounds right', 'sounds good', 'perfect', 'that\'s right',
    'yes that\'s right', 'that\'s me', 'ok', 'okay', 'confirmed', 'sure',
  ].some(kw => lower === kw || lower.startsWith(kw + ' ') || lower.includes(' ' + kw));

  const correcting = lower.startsWith('no') || lower.startsWith('not ') ||
    lower.startsWith('actually') || lower.startsWith('wait') ||
    lower.includes('i said') || lower.includes('that\'s not') ||
    lower.includes('i mean') || lower.includes('correction');

  if (confirmed && !correcting) {
    // Move to roadmap
    const freshState = await getState(from);
    await setState(from, STAGES.PROFILE_ROADMAP, { ...freshState.data, summaryConfirmed: true });

    const roadmapNote = `The user just confirmed their profile. Give ONE personalised insight — the most realistic destination option, the likely route (study/work/visa pathway), a rough cost signal or the one key requirement they should know about, and make it feel tailored specifically to them. 2–3 sentences. Warm and real. Do NOT introduce the ₦10,000 registration yet — that comes in the next message after they've absorbed this. Just make them feel genuinely understood and hopeful.`;

    let roadmap = await askAI(from, '[PROFILE_CONFIRMED]', await getState(from), roadmapNote);
    if (!from.startsWith('tg_')) roadmap = stripWhatsAppMarkdown(roadmap);
    return sendText(from, roadmap);
  }

  // User is correcting or asking a follow-up — handle naturally
  await extractProfileSignals(from, text, state);

  const correctionNote = `The user is responding to the profile summary you just read back. They may be correcting something, adding detail, or asking a question. Acknowledge any correction naturally in one sentence. If they corrected something, update your understanding and confirm it in one sentence. Do NOT re-read the whole summary. Do not introduce payment yet.`;

  let reply = await askAI(from, text, state, correctionNote);
  if (!from.startsWith('tg_')) reply = stripWhatsAppMarkdown(reply);
  return sendText(from, reply);
};

const handleProfileRoadmap = async (from, text, state) => {
  const acquired = await tryLock(from);
  if (!acquired) return;

  try {
    // Score the lead now that we have a confirmed profile
    const score = computeLeadScore(state.data || {});
    await updateLead(from, {
      lead_score:               score.lead_score,
      profile_completion_score: score.completion,
    });

    const lower = text.toLowerCase().trim();

    // Hard bypass — simple affirmative goes straight to payment without touching the AI.
    // Prevents the "yes → re-pitch → yes → re-pitch" loop.
    if (state.data?.summaryConfirmed) {
      const AFFIRM = [
        'yes', 'yep', 'yh', 'yeah', 'ok', 'okay', 'k', 'sure', 'proceed',
        'go ahead', "let's go", 'lets go', 'let proceed', "let's proceed",
        'lets proceed', 'do it', 'ready', "i'm ready", 'i am ready',
        'go on', 'confirmed', 'sorted', 'send it', 'i want to go ahead',
        'yes please', 'definitely', 'yes i want', 'i want to proceed',
        'i would like to proceed', 'i am ready to proceed', "i'm ready to proceed",
      ];
      const isAffirmative = AFFIRM.some(a => lower === a || lower === a + '.' || lower === a + '!');
      if (isAffirmative && !state.data?.payment_url) {
        const { handlePayment } = require('./payment');
        const freshState = await getState(from);
        return await handlePayment(from, 'REGISTRATION', freshState);
      }
    }

    const { askAI } = require('../services/ai');
    const roadmapNote = `The user is in the final stage before registration. Their profile has been confirmed. If they are asking a question, answer it naturally as Ade would — warm, direct, no jargon. When the moment feels natural — not rushed, not mechanical — introduce the ₦10,000 registration once: "The way this moves forward is a ₦10,000 registration — that's what connects you with the right specialist who takes everything from there." Then ask once if they want to do it now. If they confirm → use [[SEND_PAYMENT_LINK]]. If they ask a follow-up question → answer it, then let the conversation breathe before asking again. Do not repeat the registration ask on every message.`;

    const aiReply    = await askAI(from, text, state, roadmapNote);
    const tagPresent = aiReply.includes('[[SEND_PAYMENT_LINK]]');
    let cleanReply   = aiReply.replace('[[SEND_PAYMENT_LINK]]', '').trim();
    if (!from.startsWith('tg_')) cleanReply = stripWhatsAppMarkdown(cleanReply);

    if (cleanReply) await sendText(from, cleanReply);

    if (tagPresent) {
      const freshState = await getState(from);
      const { handlePayment } = require('./payment');
      return handlePayment(from, 'REGISTRATION', freshState);
    }
  } finally {
    await releaseLock(from);
  }
};

module.exports = {
  startProfileConsultation,
  handleProfileCollecting,
  handleProfileSummary,
  handleProfileRoadmap,
};
