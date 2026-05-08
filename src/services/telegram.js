const axios = require('axios');

const BASE = () => `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

// ── Core send ─────────────────────────────────────────────
const call = async (method, data) => {
  try {
    const res = await axios.post(`${BASE()}/${method}`, data, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000,
    });
    return res.data;
  } catch (err) {
    console.error(`[TELEGRAM] ${method} error:`, err.response?.data || err.message);
    throw err;
  }
}; 

// ── Send plain text ───────────────────────────────────────
const sendText = async (chatId, text) => {
  return call('sendMessage', {
    chat_id:    chatId,
    text:       text,
    parse_mode: 'Markdown',
  });
};

// ── Send inline buttons (max 3 per row) ──────────────────
// buttons = [{ id, title }, { id, title }]
const sendButtons = async (chatId, text, buttons, headerText = null) => {
  const fullText = headerText ? `*${headerText}*\n\n${text}` : text;

  // Split into rows of 2 buttons each for better mobile display
  const rows = [];
  for (let i = 0; i < buttons.length; i += 2) {
    rows.push(
      buttons.slice(i, i + 2).map(b => ({
        text:          b.title,
        callback_data: b.id,
      }))
    );
  }

  return call('sendMessage', {
    chat_id:    chatId,
    text:       fullText,
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: rows,
    },
  });
};

// ── Send list as inline buttons ───────────────────────────
// sections = [{ title, rows: [{ id, title, description }] }]
const sendList = async (chatId, bodyText, buttonLabel, sections) => {
  const keyboard = [];

  sections.forEach(section => {
    // Section header as disabled text row
    if (section.title) {
      keyboard.push([{ text: `── ${section.title} ──`, callback_data: 'SECTION_HEADER' }]);
    }
    // Each item as its own row
    section.rows.forEach(row => {
      const label = row.description
        ? `${row.title} — ${row.description}`
        : row.title;
      keyboard.push([{ text: label, callback_data: row.id }]);
    });
  });

  return call('sendMessage', {
    chat_id:    chatId,
    text:       bodyText,
    parse_mode: 'Markdown',
    reply_markup: { inline_keyboard: keyboard },
  });
};

// ── Send document/PDF ─────────────────────────────────────
const sendDocument = async (chatId, url, filename, caption = '') => {
  return call('sendDocument', {
    chat_id:  chatId,
    document: url,
    caption,
    parse_mode: 'Markdown',
  });
};

// ── Send image ────────────────────────────────────────────
const sendImage = async (chatId, url, caption = '') => {
  return call('sendPhoto', {
    chat_id:    chatId,
    photo:      url,
    caption,
    parse_mode: 'Markdown',
  });
};

// ── Answer callback query (removes loading spinner on button tap) ──
const answerCallback = async (callbackQueryId, text = '') => {
  return call('answerCallbackQuery', {
    callback_query_id: callbackQueryId,
    text,
  }).catch(() => {}); // Non-critical
};

// ── Send typing indicator ─────────────────────────────────
const sendTyping = async (chatId) => {
  return call('sendChatAction', {
    chat_id: chatId,
    action:  'typing',
  }).catch(() => {});
};

// ── Register webhook with Telegram ───────────────────────
const registerWebhook = async (url) => {
  const result = await call('setWebhook', {
    url:             `${url}/telegram/webhook`,
    allowed_updates: ['message', 'callback_query'],
    drop_pending_updates: true,
  });
  console.log('[TELEGRAM] Webhook registered:', result);
  return result;
};

// ── Get webhook info ──────────────────────────────────────
const getWebhookInfo = async () => {
  return call('getWebhookInfo', {});
};

module.exports = {
  sendText,
  sendButtons,
  sendList,
  sendDocument,
  sendImage,
  answerCallback,
  sendTyping,
  registerWebhook,
  getWebhookInfo,
};