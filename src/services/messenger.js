const wa = require('./whatsapp');
const tg = require('./telegram');
const supabase = require('../config/database');

const isTelegram = (to) => String(to).startsWith('tg_');
const getChatId  = (to) => String(to).replace('tg_', '');

// ── Reply override ────────────────────────────────────────
// Keyed by phone (`to`) so concurrent messages from different Telegram groups
// cannot steal each other's reply target.
const _overrides = new Map();

const setReplyChat = (to, chatId) => {
  if (chatId) _overrides.set(String(to), String(chatId));
  else _overrides.delete(String(to));
};

const getReplyChat = (to) => {
  const key  = String(to);
  const dest = _overrides.get(key) || getChatId(to);
  _overrides.delete(key);
  return dest;
};

// ── Outbound message logger ───────────────────────────────
const logOutbound = async (to, message, sentBy = 'bot') => {
  try {
    // Get lead_id from leads table
    const { data: lead } = await supabase
      .from('leads')
      .select('id')
      .eq('phone_number', to)
      .single();

    const { error } = await supabase.from('conversations').insert({
      lead_id:      lead?.id || null,
      phone_number: to,
      direction:    'outbound',
      message_type: 'text',
      content:      message,
      sent_by:      sentBy,
      created_at:   new Date().toISOString(),
    });
    if (error) console.error('[MESSENGER] Outbound log insert error:', error.message, '| phone:', to);
  } catch (err) {
    console.error('[MESSENGER] Outbound log error:', err.message);
  }
};
// ── Unified send functions ────────────────────────────────

const sendText = async (to, text) => {
  const result = isTelegram(to)
    ? await tg.sendText(getReplyChat(to), text)
    : await wa.sendText(to, text);
  logOutbound(to, text).catch(() => {});
  return result;
};

const sendTextAs = async (to, text, sentBy = 'bot') => {
  const result = isTelegram(to)
    ? await tg.sendText(getReplyChat(to), text)
    : await wa.sendText(to, text);
  logOutbound(to, text, sentBy).catch(() => {});
  return result;
};

const sendButtons = async (to, bodyText, buttons, headerText = null) => {
  const result = isTelegram(to)
    ? await tg.sendButtons(getReplyChat(to), bodyText, buttons, headerText)
    : await wa.sendButtons(to, bodyText, buttons, headerText);
  logOutbound(to, `[buttons] ${bodyText}`).catch(() => {});
  return result;
};

const sendList = async (to, bodyText, buttonLabel, sections) => {
  const result = isTelegram(to)
    ? await tg.sendList(getReplyChat(to), bodyText, buttonLabel, sections)
    : await wa.sendList(to, bodyText, buttonLabel, sections);
  logOutbound(to, `[list] ${bodyText}`).catch(() => {});
  return result;
};

const sendDocument = async (to, url, filename, caption = '') => {
  const result = isTelegram(to)
    ? await tg.sendDocument(getReplyChat(to), url, filename, caption)
    : await wa.sendDocument(to, url, filename, caption);
  logOutbound(to, `[document] ${filename} — ${caption}`).catch(() => {});
  return result;
};

const sendImage = async (to, url, caption = '') => {
  const result = isTelegram(to)
    ? await tg.sendImage(getReplyChat(to), url, caption)
    : await wa.sendImage(to, url, caption);
  logOutbound(to, `[image] ${caption}`).catch(() => {});
  return result;
};

const markRead = async (messageId, to = '') => {
  if (isTelegram(to)) return;
  return wa.markRead(messageId);
};

module.exports = {
  sendText,
  sendTextAs,
  sendButtons,
  sendList,
  sendDocument,
  sendImage,
  markRead,
  setReplyChat,
};