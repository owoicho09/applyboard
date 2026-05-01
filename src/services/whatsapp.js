const axios = require('axios');

const API_URL = () =>
  `https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

const authHeaders = () => ({
  Authorization:  `Bearer ${process.env.WHATSAPP_TOKEN}`,
  'Content-Type': 'application/json',
});

const send = async (payload) => {
  try {
    const res = await axios.post(API_URL(), payload, {
      headers: authHeaders(),
      timeout: 10000,
    });
    return res.data;
  } catch (err) {
    console.error('[WHATSAPP] Send error:', err.response?.data || err.message);
    throw err;
  }
};

const sendText = (to, text) => send({
  messaging_product: 'whatsapp',
  recipient_type:    'individual',
  to,
  type: 'text',
  text: { body: text, preview_url: false },
});

const sendButtons = (to, bodyText, buttons, headerText = null) => {
  if (!buttons?.length || buttons.length > 3) {
    throw new Error('sendButtons requires 1-3 buttons');
  }
  return send({
    messaging_product: 'whatsapp',
    recipient_type:    'individual',
    to,
    type: 'interactive',
    interactive: {
      type: 'button',
      ...(headerText && { header: { type: 'text', text: headerText } }),
      body:   { text: bodyText },
      action: {
        buttons: buttons.map(b => ({
          type:  'reply',
          reply: { id: b.id, title: b.title.slice(0, 20) },
        })),
      },
    },
  });
};

const sendList = (to, bodyText, buttonLabel, sections) => send({
  messaging_product: 'whatsapp',
  recipient_type:    'individual',
  to,
  type: 'interactive',
  interactive: {
    type:   'list',
    body:   { text: bodyText },
    action: { button: buttonLabel.slice(0, 20), sections },
  },
});

const sendDocument = (to, url, filename, caption = '') => send({
  messaging_product: 'whatsapp',
  recipient_type:    'individual',
  to,
  type:     'document',
  document: { link: url, filename, caption },
});

const sendImage = (to, url, caption = '') => send({
  messaging_product: 'whatsapp',
  recipient_type:    'individual',
  to,
  type:  'image',
  image: { link: url, caption },
});

const markRead = (messageId) => send({
  messaging_product: 'whatsapp',
  status:            'read',
  message_id:        messageId,
}).catch(() => {});

module.exports = {
  sendText, sendButtons, sendList,
  sendDocument, sendImage, markRead,
};