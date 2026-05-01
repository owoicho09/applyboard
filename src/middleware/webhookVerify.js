const twilio = require('twilio');

// Twilio GET verification is not used — Twilio does not do hub challenge.
// This is kept for compatibility but not called by Twilio.
const verifyWebhook = (req, res) => {
  res.status(200).send('Webhook endpoint active');
};

// Validate that a POST request genuinely came from Twilio
const validateTwilioRequest = (req) => {
  try {
    const authToken  = process.env.WHATSAPP_TOKEN;
    const webhookUrl = `${process.env.BASE_URL}/webhook`;
    return twilio.validateRequest(authToken, req.headers['x-twilio-signature'], webhookUrl, req.body);
  } catch (err) {
    console.error('[WEBHOOK] Twilio validation error:', err.message);
    return false; // Fail safe
  }
};

module.exports = { verifyWebhook, validateTwilioRequest };