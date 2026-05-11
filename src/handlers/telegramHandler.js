const tg                         = require('../services/telegram');
const { getState }               = require('../utils/stateManager');
const { isRateLimited }          = require('../middleware/rateLimiter');
const { upsertLead, logMessage } = require('../services/leadService');
const { MESSAGES }               = require('../config/constants');
const { sanitizeText }           = require('../utils/validators');
const { setReplyChat }           = require('../services/messenger');
const { sendWelcomeMessage }     = require('../services/scheduler');

// ── Bot username ──────────────────────────────────────────
const BOT_USERNAME = 'ApplyBoardbot';

// ── Always use user_id as identifier ─────────────────────
const tgId = (userId) => `tg_${userId}`;

// ── Detect group chat ─────────────────────────────────────
const isGroup = (chat) =>
  chat?.type === 'group' || chat?.type === 'supergroup';

// ── Detect @mention ───────────────────────────────────────
const isMentioned = (msg) => {
  const text     = msg.text     || '';
  const entities = msg.entities || [];

  if (text.toLowerCase().includes(`@${BOT_USERNAME.toLowerCase()}`)) return true;

  for (const entity of entities) {
    if (entity.type === 'mention') {
      const mention = text.substring(entity.offset, entity.offset + entity.length);
      if (mention.toLowerCase() === `@${BOT_USERNAME.toLowerCase()}`) return true;
    }
  }
  return false;
};

// ── Strip @mention from text ──────────────────────────────
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

      // If button tapped in a group reply to the group
      if (isGroup(query.message?.chat)) {
        setReplyChat(chatId);
      }

      const { handleButton } = require('./buttonHandler');
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

      // ── New member joined ─────────────────────────────
      if (msg.new_chat_members?.length) {
        for (const member of msg.new_chat_members) {
          // Skip if the new member is the bot itself
          if (member.username?.toLowerCase() === BOT_USERNAME.toLowerCase()) continue;
          // Skip bots
          if (member.is_bot) continue;

          console.log(`[TELEGRAM] New member joined: ${member.first_name} (${member.id})`);
          await sendWelcomeMessage(member, chatId);

          // Also upsert as a lead so they appear in CRM
          const memberPhone = tgId(member.id);
          await upsertLead(memberPhone, {
            name:   member.first_name || '',
            source: 'telegram_group',
          }).catch(() => {});
        }
        return;
      }

      if (!text || !userId) return;

      // ── GROUP ─────────────────────────────────────────
      if (isGroup(chat)) {
        // Ignore if bot not @mentioned
        if (!isMentioned(msg)) return;

        const cleanText = stripMention(text);
        if (!cleanText) {
          await tg.sendText(chatId, `Hey ${name}, what can I help you with?`);
          return;
        }

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

        // Tell messenger to reply to the GROUP not the user's DM
        setReplyChat(chatId);

        const { handleText } = require('./textHandler');
        await handleText(phone, sanitizeText(cleanText), state, { platform: 'telegram', chatId });
        return;
      }

      // ── PRIVATE DM ────────────────────────────────────
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