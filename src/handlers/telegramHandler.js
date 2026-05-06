const tg                         = require('../services/telegram');
const { getState, setState }     = require('../utils/stateManager');
const { isRateLimited }          = require('../middleware/rateLimiter');
const { upsertLead, logMessage } = require('../services/leadService');
const { MESSAGES, STAGES, BTN }  = require('../config/constants');
const { sanitizeText }           = require('../utils/validators');

// ── Prefix all Telegram chat IDs so they never clash
// with WhatsApp phone numbers in Redis/Supabase
const tgId = (chatId) => `tg_${chatId}`;

// ── Main entry point ──────────────────────────────────────
const handleTelegram = async (update) => {
  try {
    // ── Callback query (button tap) ───────────────────────
    if (update.callback_query) {
      const query  = update.callback_query;
      const chatId = query.message.chat.id;
      const btnId  = query.data;
      const name   = query.from.first_name || '';
      const phone  = tgId(chatId);

      // Ignore section header taps
      if (btnId === 'SECTION_HEADER') {
        await tg.answerCallback(query.id);
        return;
      }

      await tg.answerCallback(query.id);
      await tg.sendTyping(chatId);

      await upsertLead(phone, {
        name,
        source: 'telegram',
      });

      const state = await getState(phone);

      console.log(`[TELEGRAM] Button from=${chatId} btnId=${btnId} stage=${state.stage}`);

      const { handleButton } = require('./buttonHandler');
      await handleButton(phone, btnId, state, { platform: 'telegram', chatId });
      return;
    }

    // ── Regular message ───────────────────────────────────
    if (update.message) {
      const msg    = update.message;
      const chatId = msg.chat.id;
      const text   = msg.text?.trim() || '';
      const name   = msg.from?.first_name || '';
      const phone  = tgId(chatId);

      if (!text) return; // Ignore non-text messages for now

      // Rate limit
      const limited = await isRateLimited(phone);
      if (limited) {
        await tg.sendText(chatId, MESSAGES.rateLimit);
        return;
      }

      await tg.sendTyping(chatId);

      // Upsert lead
      await upsertLead(phone, {
        name,
        source: 'telegram',
      });

      // Log message
      await logMessage(phone, 'inbound', 'text', text, String(msg.message_id));

      const state = await getState(phone);

      console.log(`[TELEGRAM] Message from=${chatId} stage=${state.stage} text="${text.slice(0, 50)}"`);

      const { handleText } = require('./textHandler');
      await handleText(phone, sanitizeText(text), state, { platform: 'telegram', chatId });
    }

  } catch (err) {
    console.error('[TELEGRAM] Handler error:', err.message);

    // Try to send fallback to user
    const chatId = update.callback_query?.message?.chat?.id
                || update.message?.chat?.id;
    if (chatId) {
      await tg.sendText(chatId, MESSAGES.fallback).catch(() => {});
    }
  }
};

module.exports = { handleTelegram, tgId };