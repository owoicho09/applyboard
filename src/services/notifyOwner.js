const axios = require('axios');

const notifyOwner = async (message) => {
  const chatId = process.env.MY_PERSONAL_TELEGRAM_ID;
  const token  = process.env.TELEGRAM_BOT_TOKEN;
  if (!chatId || !token) return;

  try {
    await axios.post(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        chat_id:    chatId,
        text:       message,
        parse_mode: 'Markdown',
      }
    );
  } catch (err) {
    console.error('[NOTIFY OWNER] Error:', err.message);
  }
};

module.exports = { notifyOwner };