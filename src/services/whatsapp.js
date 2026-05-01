const twilio                    = require('twilio');
const { setState, getState }    = require('../utils/stateManager');

const getClient = () => twilio(
  process.env.WHATSAPP_PHONE_NUMBER_ID,
  process.env.WHATSAPP_TOKEN
);

const FROM = () => `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`;
const TO   = (phone) => {
  const clean = phone.replace('whatsapp:', '').trim();
  return `whatsapp:${clean}`;
};

const send = async (to, body, options = {}) => {
  try {
    const client = getClient();
    const msg    = await client.messages.create({
      from: FROM(),
      to:   TO(to),
      body,
      ...options,
    });
    console.log(`[WHATSAPP] Sent to ${to} — SID: ${msg.sid}`);
    return msg;
  } catch (err) {
    // Twilio daily limit hit
    if (err.message?.includes('daily messages limit')) {
      console.error('[WHATSAPP] ⚠️  DAILY LIMIT REACHED — resets at midnight UTC');
      console.error('[WHATSAPP] Pause testing and resume tomorrow or upgrade Twilio account');
      return null; // Fail silently — don't crash the server
    }
    console.error('[WHATSAPP] Send error:', err.message);
    throw err;
  }
};

const sendText = (to, text) => send(to, text);

// Sends numbered menu AND saves items to state for numeric reply resolution
const sendButtons = async (to, bodyText, buttons, headerText = null) => {
  if (!buttons?.length) return;

  const header   = headerText ? `*${headerText}*\n\n` : '';
  const btnList  = buttons.map((b, i) => `${i + 1}. ${b.title}`).join('\n');
  const fullText = `${header}${bodyText}\n\n${btnList}\n\n_Reply with a number to select_`;

  // Save menu context to state so numeric replies resolve
  try {
    const state = await getState(to);
    await setState(to, state.stage, {
      ...state.data,
      lastMenu: buttons.map((b, i) => ({ number: i + 1, id: b.id, title: b.title })),
    });
  } catch (e) {
    console.error('[WHATSAPP] Could not save menu state:', e.message);
  }

  return send(to, fullText);
};

const sendList = async (to, bodyText, buttonLabel, sections) => {
  let text    = `${bodyText}\n\n`;
  let counter = 1;
  const allItems = [];

  sections.forEach((section) => {
    if (section.title) text += `*${section.title}*\n`;
    section.rows.forEach((row) => {
      text += `${counter}. ${row.title}`;
      if (row.description) text += `\n   _${row.description}_`;
      text += '\n';
      allItems.push({ number: counter, id: row.id, title: row.title });
      counter++;
    });
    text += '\n';
  });

  text += `_Reply with a number to select_`;

  // Save menu context to state
  try {
    const state = await getState(to);
    await setState(to, state.stage, {
      ...state.data,
      lastMenu: allItems,
    });
  } catch (e) {
    console.error('[WHATSAPP] Could not save menu state:', e.message);
  }

  return send(to, text);
};

const sendDocument = (to, url, filename, caption = '') =>
  send(to, caption || filename, { mediaUrl: [url] });

const sendImage = (to, url, caption = '') =>
  send(to, caption, { mediaUrl: [url] });

const markRead = async () => {}; // Not supported in Twilio

module.exports = {
  sendText,
  sendButtons,
  sendList,
  sendDocument,
  sendImage,
  markRead,
};