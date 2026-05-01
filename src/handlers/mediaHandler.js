const { sendText } = require('../services/whatsapp');

const handleMedia = async (from, type, message, state) => {
  console.log(`[MEDIA] from=${from} type=${type}`);
  await sendText(from, `Thank you for sending that! If you have a question, please type it out and our team will assist you. 😊\n\nOr type *menu* to see our services.`);
};

module.exports = { handleMedia };