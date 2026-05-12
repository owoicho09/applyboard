const wa = require('./whatsapp');
const tg = require('./telegram');
const supabase = require('../config/database');

const isTelegram = (to) => String(to).startsWith('tg_');
const getChatId  = (to) => String(to).replace('tg_', '');

// ── Reply override ────────────────────────────────────────
let _replyOverride = null;

const setReplyChat = (chatId) => {
  _replyOverride = chatId ? String(chatId) : null;
};

const getReplyChat = (to) => {
  const dest = _replyOverride || getChatId(to);
  _replyOverride = null;
  return dest;
};

// ── Outbound message logger ───────────────────────────────
const logOutbound = async (to, message) => {
  try {
    // Get lead_id from leads table
    const { data: lead } = await supabase
      .from('leads')
      .select('id')
      .eq('phone_number', to)
      .single();

    await supabase.from('conversations').insert({
      lead_id:      lead?.id || null,
      phone_number: to,
      direction:    'outbound',
      message_type: 'text',
      content:      message,
      created_at:   new Date().toISOString(),
    });
  } catch (err) {
    console.error('[MESSENGER] Outbound log error:', err.message);
  }
};
// ── Unified send functions ────────────────────────────────

const sendText = async (to, text) => {
  const result = isTelegram(to)
    ? await tg.sendText(getReplyChat(to), text)
    : await wa.sendText(to, text);
  await logOutbound(to, text);
  return result;
};

const sendButtons = async (to, bodyText, buttons, headerText = null) => {
  const result = isTelegram(to)
    ? await tg.sendButtons(getReplyChat(to), bodyText, buttons, headerText)
    : await wa.sendButtons(to, bodyText, buttons, headerText);
  await logOutbound(to, `[buttons] ${bodyText}`);
  return result;
};

const sendList = async (to, bodyText, buttonLabel, sections) => {
  const result = isTelegram(to)
    ? await tg.sendList(getReplyChat(to), bodyText, buttonLabel, sections)
    : await wa.sendList(to, bodyText, buttonLabel, sections);
  await logOutbound(to, `[list] ${bodyText}`);
  return result;
};

const sendDocument = async (to, url, filename, caption = '') => {
  const result = isTelegram(to)
    ? await tg.sendDocument(getReplyChat(to), url, filename, caption)
    : await wa.sendDocument(to, url, filename, caption);
  await logOutbound(to, `[document] ${filename} — ${caption}`);
  return result;
};

const sendImage = async (to, url, caption = '') => {
  const result = isTelegram(to)
    ? await tg.sendImage(getReplyChat(to), url, caption)
    : await wa.sendImage(to, url, caption);
  await logOutbound(to, `[image] ${caption}`);
  return result;
};

const markRead = async (messageId, to = '') => {
  if (isTelegram(to)) return;
  return wa.markRead(messageId);
};

module.exports = {
  sendText,
  sendButtons,
  sendList,
  sendDocument,
  sendImage,
  markRead,
  setReplyChat,
};