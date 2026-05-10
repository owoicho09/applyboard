const tg                         = require('../services/telegram');
const { getState, setState }     = require('../utils/stateManager');
const { isRateLimited }          = require('../middleware/rateLimiter');
const { upsertLead, logMessage } = require('../services/leadService');
const { MESSAGES, STAGES, BTN }  = require('../config/constants');
const { sanitizeText }           = require('../utils/validators');

// ── Bot username — used to detect @mentions in groups ────
const BOT_USERNAME = 'ApplyBoardbot';

// ── Always use user_id as the unique identifier ──────────
// This ensures the same person is tracked across DMs and groups
const tgId = (userId) => `tg_${userId}`;

// ── Detect if message is from a group ────────────────────
const isGroup = (chat) =>
  chat?.type === 'group' || chat?.type === 'supergroup';

// ── Detect if bot was mentioned in a group message ───────
const isMentioned = (msg) => {
  const text     = msg.text || '';
  const entities = msg.entities || [];

  // Check text for @BotUsername
  if (text.toLowerCase().includes(`@${BOT_USERNAME.toLowerCase()}`)) return true;

  // Check entities for mention type pointing to our bot
  for (const entity of entities) {
    if (entity.type === 'mention') {
      const mention = text.substring(entity.offset, entity.offset + entity.length);
      if (mention.toLowerCase() === `@${BOT_USERNAME.toLowerCase()}`) return true;
    }
  }

  return false;
};

// ── Strip the @mention from text so AI gets clean input ──
const stripMention = (text) =>
  text.replace(new RegExp(`@${BOT_USERNAME}`, 'gi'), '').trim();

// ── Main entry point ──────────────────────────────────────
const handleTelegram = async (update) => {
  try {

    // ── Callback query (button tap) ───────────────────────
    if (update.callback_query) {
      const query  = update.callback_query;
      const chatId = query.message.chat.id;
      const userId = query.from.id;
      const btnId  = query.data;
      const name   = query.from.first_name || '';

      // Always use user_id so group and DM are the same person
      const phone  = tgId(userId);

      if (btnId === 'SECTION_HEADER') {
        await tg.answerCallback(query.id);
        return;
      }

      await tg.answerCallback(query.id);
      await tg.sendTyping(chatId);

      await upsertLead(phone, { name, source: 'telegram' });

      const state = await getState(phone);

      console.log(`[TELEGRAM] Button userId=${userId} chatId=${chatId} btnId=${btnId} stage=${state.stage}`);

      const { handleButton } = require('./buttonHandler');
      // Pass chatId so replies go to the right chat (group or DM)
      await handleButton(phone, btnId, state, { platform: 'telegram', chatId });
      return;
    }

    // ── Regular message ───────────────────────────────────
    if (update.message) {
      const msg    = update.message;
      const chat   = msg.chat;
      const chatId = chat.id;
      const userId = msg.from?.id;
      const name   = msg.from?.first_name || '';
      const text   = msg.text?.trim() || '';

      if (!text || !userId) return;

      // ── GROUP LOGIC ───────────────────────────────────
      if (isGroup(chat)) {
        // Ignore completely if bot not mentioned
        if (!isMentioned(msg)) return;

        // Bot was mentioned — process the message
        const cleanText = stripMention(text);
        if (!cleanText) {
          // Just mentioned with no message — give a friendly nudge
          await tg.sendText(chatId, `Hey ${name}, what can I help you with?`);
          return;
        }

        // Use user_id so this person's history is preserved in DMs too
        const phone = tgId(userId);

        const limited = await isRateLimited(phone);
        if (limited) {
          await tg.sendText(chatId, MESSAGES.rateLimit);
          return;
        }

        await tg.sendTyping(chatId);
        await upsertLead(phone, { name, source: 'telegram' });
        await logMessage(phone, 'inbound', 'text', cleanText, String(msg.message_id));

        const state = await getState(phone);

        console.log(`[TELEGRAM] Group mention userId=${userId} chatId=${chatId} stage=${state.stage} text="${cleanText.slice(0, 50)}"`);

        const { handleText } = require('./textHandler');
        // chatId = group chat so reply appears in the group
        await handleText(phone, sanitizeText(cleanText), state, { platform: 'telegram', chatId });
        return;
      }

      // ── PRIVATE DM LOGIC ──────────────────────────────
      // Use user_id — same as userId in DMs so history carries over from groups
      const phone = tgId(userId);

      const limited = await isRateLimited(phone);
      if (limited) {
        await tg.sendText(chatId, MESSAGES.rateLimit);
        return;
      }

      await tg.sendTyping(chatId);
      await upsertLead(phone, { name, source: 'telegram' });
      await logMessage(phone, 'inbound', 'text', text, String(msg.message_id));

      const state = await getState(phone);

      console.log(`[TELEGRAM] DM userId=${userId} stage=${state.stage} text="${text.slice(0, 50)}"`);

      const { handleText } = require('./textHandler');
      await handleText(phone, sanitizeText(text), state, { platform: 'telegram', chatId });
    }

  } catch (err) {
    console.error('[TELEGRAM] Handler error:', err.message);
    const chatId = update.callback_query?.message?.chat?.id
                || update.message?.chat?.id;
    if (chatId) {
      await tg.sendText(chatId, MESSAGES.fallback).catch(() => {});
    }
  }
};

module.exports = { handleTelegram, tgId };