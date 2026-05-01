const { markRead }               = require('../services/whatsapp');
const { getState }               = require('../utils/stateManager');
const { isRateLimited }          = require('../middleware/rateLimiter');
const { isMessageSeen }          = require('../utils/stateManager');
const { upsertLead, logMessage } = require('../services/leadService');
const { MESSAGES }               = require('../config/constants');
const { sendText }               = require('../services/whatsapp');

// ── Twilio sends form-encoded POST, not JSON ──────────────
// req.body looks like:
// { From: 'whatsapp:+234...', Body: 'Hello', MessageSid: 'SMxxx' }

const handleIncoming = async (entry) => {
  try {
    // entry IS the parsed Twilio body
    const from    = entry.From?.replace('whatsapp:', '').trim();
    const msgId   = entry.MessageSid;
    const msgType = entry.NumMedia > 0 ? 'media' : 'text';
    const body    = entry.Body?.trim() || '';
    const name    = entry.ProfileName || '';

    if (!from || !msgId) {
      console.warn('[HANDLER] Missing from or msgId — skipping');
      return;
    }

    // 1. Deduplicate
    const alreadySeen = await isMessageSeen(msgId);
    if (alreadySeen) {
      console.log(`[HANDLER] Duplicate message ignored: ${msgId}`);
      return;
    }

    // 2. Rate limit
    const limited = await isRateLimited(from);
    if (limited) {
      await sendText(from, MESSAGES.rateLimit);
      return;
    }

    // 3. Upsert lead
    await upsertLead(from, { name });

    // 4. Log message
    await logMessage(from, 'inbound', msgType, body, msgId);

    // 5. Get state
    const state = await getState(from);

    // 6. Route
    if (msgType === 'media') {
      const { handleMedia } = require('./mediaHandler');
      await handleMedia(from, msgType, entry, state);
    } else {
      const { handleText } = require('./textHandler');
      await handleText(from, body, state, entry);
    }

  } catch (err) {
    console.error('[HANDLER] Error:', err.message);
    const from = entry?.From?.replace('whatsapp:', '').trim();
    if (from) await sendText(from, MESSAGES.fallback).catch(() => {});
  }
};

module.exports = { handleIncoming };