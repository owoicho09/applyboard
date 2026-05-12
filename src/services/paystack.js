const crypto = require('crypto');
const axios  = require('axios');

const PAYSTACK_BASE = 'https://api.paystack.co';
const headers = () => ({
  Authorization:  `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
  'Content-Type': 'application/json',
});

const initializePayment = async (email, amountNaira, metadata = {}) => {
  const { generateReference } = require('../utils/helpers');
  const reference = generateReference();

  const res = await axios.post(
    `${PAYSTACK_BASE}/transaction/initialize`,
    {
      email,
      amount:       amountNaira * 100,
      reference,
      metadata,
      callback_url: `${process.env.BASE_URL}/payment/callback`,
    },
    { headers: headers() }
  ).catch((err) => {
    console.error('[PAYSTACK] Full error:', JSON.stringify(err.response?.data));
    console.error('[PAYSTACK] Request body sent:', JSON.stringify({
      email, amount: amountNaira * 100, reference,
    }));
    throw err;
  });

  return { url: res.data.data.authorization_url, reference };
};

// ── Verify a transaction directly with Paystack ───────────
// Used when user says "I have paid" as a fallback check
const verifyPayment = async (reference) => {
  try {
    const res = await axios.get(
      `${PAYSTACK_BASE}/transaction/verify/${reference}`,
      { headers: headers() }
    );
    const data = res.data?.data;
    if (data?.status === 'success') return data;
    return null;
  } catch (err) {
    console.error('[PAYSTACK] Verify error:', err.message);
    return null;
  }
};

const verifySignature = (rawBody, signature) => {
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
    .update(rawBody)
    .digest('hex');
  return hash === signature;
};

const handlePaystackWebhook = async (req, res) => {
  const sig = req.headers['x-paystack-signature'];

  if (!verifySignature(req.body, sig)) {
    console.warn('[PAYSTACK] Invalid webhook signature — rejected');
    return res.sendStatus(400);
  }

  res.sendStatus(200);

  try {
    const event = JSON.parse(req.body);
    if (event.event !== 'charge.success') return;

    const { reference, metadata, amount } = event.data;
    const phone = metadata?.phone_number;

    const supabase = require('../config/database');
    await supabase
      .from('payments')
      .update({ status: 'success', paystack_data: event.data })
      .eq('reference', reference);

    if (phone) {
      const { onPaymentConfirmed } = require('../flows/payment');
      await onPaymentConfirmed(phone, amount / 100, reference);
    }
  } catch (err) {
    console.error('[PAYSTACK] Webhook processing error:', err.message);
  }
};

module.exports = {
  initializePayment,
  verifyPayment,
  verifySignature,
  handlePaystackWebhook,
};