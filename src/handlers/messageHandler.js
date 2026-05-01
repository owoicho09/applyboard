const { markRead }               = require('../services/whatsapp');
const { getState }               = require('../utils/stateManager');
const { isRateLimited }          = require('../middleware/rateLimiter');
const { isMessageSeen }          = require('../utils/stateManager');
const { upsertLead, logMessage } = require('../services/leadService');
const { MESSAGES }               = require('../config/constants');
const { sendText }               = require('../services/whatsapp');

const handleIncoming = async (entry) => {
  const message = entry.messages[0];
  const contact = entry.contacts?.[0];
  const from    = message.from;
  const msgId   = message.id;
  const msgType = message.type;

  // 1. Deduplicate
  const alreadySeen = await isMessageSeen(msgId);
  if (alreadySeen) {
    console.log(`[HANDLER] Duplicate ignored: ${msgId}`);
    return;
  }

  // 2. Mark as read
  await markRead(msgId);

  // 3. Rate limit
  const limited = await isRateLimited(from);
  if (limited) {
    await sendText(from, MESSAGES.rateLimit);
    return;
  }

  // 4. Upsert lead
  await upsertLead(from, { name: contact?.profile?.name });

  // 5. Log message
  const content = message.text?.body
               || message.interactive?.button_reply?.id
               || msgType;
  await logMessage(from, 'inbound', msgType, content, msgId);

  // 6. Get state
  const state = await getState(from);

  console.log(`[HANDLER] from=${from} type=${msgType} stage=${state.stage}`);

  // 7. Route
  try {
    if (msgType === 'interactive') {
      const btnId = message.interactive?.button_reply?.id
                 || message.interactive?.list_reply?.id;
      const { handleButton } = require('./buttonHandler');
      await handleButton(from, btnId, state, message);

    } else if (msgType === 'text') {
      const { handleText } = require('./textHandler');
      await handleText(from, message.text.body.trim(), state, message);

    } else {
      const { handleMedia } = require('./mediaHandler');
      await handleMedia(from, msgType, message, state);
    }
  } catch (err) {
    console.error('[HANDLER] Flow error:', err.message);
    await sendText(from, MESSAGES.fallback);
  }
};

module.exports = { handleIncoming };