const { sendText }   = require('../services/messenger');
const { setState }   = require('../utils/stateManager');
const { STAGES }     = require('../config/constants');

const handleMedia = async (from, type, message, state) => {
  console.log(`[MEDIA] from=${from} type=${type}`);

  if (!state.stage || state.stage === STAGES.GREETING) {
    await setState(from, STAGES.FREE_TEXT_AI);
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

  return sendText(from, aiReply);
};

module.exports = { handleMedia };
