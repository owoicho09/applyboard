const wa = require('./whatsapp');
const tg = require('./telegram');

const isTelegram = (to) => String(to).startsWith('tg_');
const getChatId  = (to) => String(to).replace('tg_', '');

// ── Reply override ────────────────────────────────────────
// When a message comes from a group, we track the user by user_id
// but must reply to the group chat_id — this override handles that
let _replyOverride = null;

const setReplyChat = (chatId) => {
  _replyOverride = chatId ? String(chatId) : null;
};

const getReplyChat = (to) => {
  const dest = _replyOverride || getChatId(to);
  _replyOverride = null; // Auto-clear after each use
  return dest;
};

// ── Unified send functions ────────────────────────────────

const sendText = async (to, text) => {
  if (isTelegram(to)) return tg.sendText(getReplyChat(to), text);
  return wa.sendText(to, text);
};

const sendButtons = async (to, bodyText, buttons, headerText = null) => {
  if (isTelegram(to)) return tg.sendButtons(getReplyChat(to), bodyText, buttons, headerText);
  return wa.sendButtons(to, bodyText, buttons, headerText);
};

const sendList = async (to, bodyText, buttonLabel, sections) => {
  if (isTelegram(to)) return tg.sendList(getReplyChat(to), bodyText, buttonLabel, sections);
  return wa.sendList(to, bodyText, buttonLabel, sections);
};

const sendDocument = async (to, url, filename, caption = '') => {
  if (isTelegram(to)) return tg.sendDocument(getReplyChat(to), url, filename, caption);
  return wa.sendDocument(to, url, filename, caption);
};

const sendImage = async (to, url, caption = '') => {
  if (isTelegram(to)) return tg.sendImage(getReplyChat(to), url, caption);
  return wa.sendImage(to, url, caption);
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