const { sendText }                                        = require('../services/messenger');
const { setState, updateData, getState, tryLock, releaseLock } = require('../utils/stateManager');
const { updateLead }                                      = require('../services/leadService');
const { STAGES }                                          = require('../config/stages');
const { extractProfileSignals, detectAwaitingDoc }        = require('../utils/profileExtractor');
const { computeLeadScore }                                = require('../utils/leadScorer');
const { PROFILE_COLLECTION_GUIDANCE }                     = require('../config/prompts');

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

  return `PROFILE STATUS — do not narrate this to the user, use it to guide the conversation naturally:
Collected: ${have.length ? have.join(' | ') : 'nothing yet'}
Still to learn: ${need.length ? need.join(', ') : 'complete'}
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
  return sendText(from, reply);
};

const handleProfileCollecting = async (from, text, state) => {
  const acquired = await tryLock(from);
  if (!acquired) return;

  try {
    const { askAI } = require('../services/ai');
    const note = buildProfileNote(state.data || {});

    const [, aiReply] = await Promise.all([
      extractProfileSignals(from, text, state),
      askAI(from, text, state, note),
    ]);

    const profileReady = aiReply.includes('[[PROFILE_READY]]');
    const cleanReply   = aiReply.replace('[[PROFILE_READY]]', '').trim();

    // Track which document the AI just asked for so media handler can label incoming files
    const awaitingDoc = detectAwaitingDoc(aiReply);
    if (awaitingDoc) await updateData(from, { awaitingDoc });

    if (cleanReply) await sendText(from, cleanReply);

    // Transition to summary if AI signalled ready OR auto-threshold met
    const freshState = await getState(from);
    if (profileReady || hasEnoughForSummary(freshState.data || {})) {
      // Mark summaryGenerated=true before transitioning so we don't re-generate on next message
      await setState(from, STAGES.PROFILE_SUMMARY, { ...freshState.data, summaryGenerated: true });

      // Send summary immediately — don't wait for the user's next message
      const summaryNote = `You now have a solid picture of this person. Read it back as a natural, human summary — like you're quickly catching up a colleague. NOT a bullet list. Conversational prose. Cover their destination, what they want to do (study/work/visa/relocate), timeline if known, any documents mentioned, and one standout detail that shows you were listening. Keep it to 3–4 sentences. End with something like: "That's actually a workable profile — does that sound right to you?" Then stop and wait for confirmation.`;

      const { askAI } = require('../services/ai');
      const summaryReply = await askAI(from, '[GENERATE_SUMMARY]', await getState(from), summaryNote);
      await sendText(from, summaryReply);
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

    const roadmap = await askAI(from, '[PROFILE_CONFIRMED]', await getState(from), roadmapNote);
    return sendText(from, roadmap);
  }

  // User is correcting or asking a follow-up — handle naturally
  await extractProfileSignals(from, text, state);

  const correctionNote = `The user is responding to the profile summary you just read back. They may be correcting something, adding detail, or asking a question. Acknowledge any correction naturally in one sentence. If they corrected something, update your understanding and confirm it in one sentence. Do NOT re-read the whole summary. Do not introduce payment yet.`;

  const reply = await askAI(from, text, state, correctionNote);
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

    const { askAI } = require('../services/ai');
    const roadmapNote = `The user is in the final stage before registration. Their profile has been confirmed. If they are asking a question, answer it naturally as Ade would — warm, direct, no jargon. When the moment feels natural — not rushed, not mechanical — introduce the ₦10,000 registration once: "The way this moves forward is a ₦10,000 registration — that's what connects you with the right specialist who takes everything from there." Then ask once if they want to do it now. If they confirm → use [[SEND_PAYMENT_LINK]]. If they ask a follow-up question → answer it, then let the conversation breathe before asking again. Do not repeat the registration ask on every message.`;

    const aiReply    = await askAI(from, text, state, roadmapNote);
    const tagPresent = aiReply.includes('[[SEND_PAYMENT_LINK]]');
    const cleanReply = aiReply.replace('[[SEND_PAYMENT_LINK]]', '').trim();

    if (cleanReply) await sendText(from, cleanReply);

    if (tagPresent) {
      const freshState    = await getState(from);
      const { handlePayment } = require('./payment');
      return handlePayment(from, 'REGISTRATION', {
        ...freshState,
        data: { ...freshState.data, payment_amount: 10000 },
      });
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
