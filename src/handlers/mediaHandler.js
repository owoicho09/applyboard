const { sendText }               = require('../services/messenger');
const { setState, updateData }   = require('../utils/stateManager');
const { updateLead }             = require('../services/leadService');
const { STAGES }                 = require('../config/stages');
const { stripWhatsAppMarkdown }  = require('../utils/validators');

const handleMedia = async (from, type, message, state) => {
  console.log(`[MEDIA] from=${from} type=${type}`);

  if (!state.stage || state.stage === STAGES.GREETING) {
    await setState(from, STAGES.FREE_TEXT_AI);
  }

  // Document / image upload during profile collection — log to documents_checklist
  if (
    (state.stage === STAGES.PROFILE_COLLECTING || state.stage === STAGES.PROFILE_SUMMARY) &&
    (type === 'image' || type === 'document')
  ) {
    const docType = state.data?.awaitingDoc || null;
    const label   = docType || (type === 'image' ? 'passport' : 'document');

    const existing = state.data?.documents_checklist || {};
    const updated  = { ...existing, [label]: true };

    await Promise.all([
      updateData(from, { documents_checklist: updated, awaitingDoc: null }),
      updateLead(from, { documents_checklist: updated }),
    ]);

    const { askAI } = require('../services/ai');
    const aiReply   = await askAI(
      from,
      `[User sent ${label} document]`,
      { ...state, data: { ...state.data, documents_checklist: updated } },
      `The user just sent their ${label} ${type === 'image' ? 'photo' : 'document'}. You cannot open or read it. Acknowledge warmly in one sentence — something like "Got your ${label}, noted." Then continue naturally with whatever comes next in the conversation. Do not ask for the same document again.`
    );
    const clean = !from.startsWith('tg_') ? stripWhatsAppMarkdown(aiReply) : aiReply;
    return sendText(from, clean);
  }

  const typeLabel = {
    image:    'a photo',
    document: 'a document',
    audio:    'a voice note',
    video:    'a video',
    sticker:  'a sticker',
  }[type] || 'something';

  const { askAI } = require('../services/ai');
  const aiReply   = await askAI(
    from,
    `[User sent ${typeLabel}]`,
    state,
    `The user sent ${typeLabel}. You cannot open or read it. Acknowledge this warmly and briefly — do not make them feel bad about it. Ask what they were trying to share or what question they have. Keep it light, one sentence max. Do not mention "menu" or any service list.`
  );

  const cleanReply = !from.startsWith('tg_') ? stripWhatsAppMarkdown(aiReply) : aiReply;
  return sendText(from, cleanReply);
};

module.exports = { handleMedia };
