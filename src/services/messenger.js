const wa = require('./whatsapp');
const tg = require('./telegram');

// ── Detect platform from the "to" field ──────────────────
// Telegram IDs are prefixed with "tg_"
// WhatsApp IDs are phone numbers like "+234..."

const isTelegram = (to) => String(to).startsWith('tg_');

// Extract real chatId for Telegram
const getChatId = (to) => String(to).replace('tg_', '');

// ── Unified send functions ────────────────────────────────

const sendText = async (to, text) => {
  if (isTelegram(to)) return tg.sendText(getChatId(to), text);
  return wa.sendText(to, text);
};

const sendButtons = async (to, bodyText, buttons, headerText = null) => {
  if (isTelegram(to)) return tg.sendButtons(getChatId(to), bodyText, buttons, headerText);
  return wa.sendButtons(to, bodyText, buttons, headerText);
};

const sendList = async (to, bodyText, buttonLabel, sections) => {
  if (isTelegram(to)) return tg.sendList(getChatId(to), bodyText, buttonLabel, sections);
  return wa.sendList(to, bodyText, buttonLabel, sections);
};

const sendDocument = async (to, url, filename, caption = '') => {
  if (isTelegram(to)) return tg.sendDocument(getChatId(to), url, filename, caption);
  return wa.sendDocument(to, url, filename, caption);
};

const sendImage = async (to, url, caption = '') => {
  if (isTelegram(to)) return tg.sendImage(getChatId(to), url, caption);
  return wa.sendImage(to, url, caption);
};

const markRead = async (messageId, to = '') => {
  if (isTelegram(to)) return; // Telegram read receipts handled via answerCallback
  return wa.markRead(messageId);
};

module.exports = {
  sendText,
  sendButtons,
  sendList,
  sendDocument,
  sendImage,
  markRead,
};