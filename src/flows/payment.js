const { sendText }           = require('../services/messenger');
const { setState, getState } = require('../utils/stateManager');
const { updateLead }         = require('../services/leadService');
const { MESSAGES, STAGES, BTN, REGISTRATION_FEE } = require('../config/constants');
const { formatCurrency }     = require('../utils/helpers');
const supabase               = require('../config/database');

const handlePayment = async (from, action, state) => {
  const amount  = action === 'REGISTRATION'
    ? REGISTRATION_FEE
    : (state.data?.payment_amount || REGISTRATION_FEE);
  const service = state.data?.service || 'ApplyBoard Africa';

  // ── Generate Paystack link immediately ────────────────
  // No method selection — Paystack handles card, bank, USSD etc
  if (action === 'REGISTRATION' || action === 'START' || action === BTN.PAY_NOW) {
    try {
      const { initializePayment } = require('../services/paystack');
      const email = state.data?.email
           || `user${from.replace('tg_', '').replace('+', '')}@applyboardafrica.com`;
      const { url, reference } = await initializePayment(email, amount, {
        phone_number: from,
        service,
        name:         state.data?.name || '',
      });

      await setState(from, STAGES.PAYMENT_AWAITING, { payment_ref: reference });

      // Save pending payment record
      try {
        const { error } = await supabase.from('payments').insert({
          phone_number: from,
          reference,
          amount,
          method:       'paystack',
          service_desc: service,
          status:       'pending',
        });
        if (error) console.error('[PAYMENT] DB insert error:', error.message);
      } catch (err) {
        console.error('[PAYMENT] DB insert error:', err.message);
      }

      await updateLead(from, {
        payment_status: 'pending',
        payment_method: 'paystack',
      });

      return sendText(
        from,
        `Here is your secure payment link:\n\n${url}\n\nPay with card, bank transfer, USSD — whatever works for you. Once it goes through you will get a confirmation here automatically.`
      );

    } catch (err) {
      console.error('[PAYMENT] Paystack init error:', err.message);
      return sendText(
        from,
        `Having a small issue generating the link right now. Reach us directly on ${process.env.BUSINESS_PHONE || '+234 706 345 9820'} and we sort it immediately.`
      );
    }
  }

  // ── Installment plan ──────────────────────────────────
  if (action === BTN.PAY_INSTALL) {
    return sendText(
      from,
      `Installment plans are available for some services. Let me flag this for the team and they will reach out with a custom plan that works for your budget.\n\nWhat is a good time to reach you?`
    );
  }
};

// ── Called by Paystack webhook after successful payment ──
const onPaymentConfirmed = async (phone, amount, reference) => {
  try {
    await updateLead(phone, {
      payment_status:     'paid',
      payment_reference:  reference,
      conversation_stage: 'registered',
    });

    const { sendText: send } = require('../services/messenger');
    await send(
      phone,
      `Payment confirmed. You are in.\n\nReference: ${reference}\n\nSomeone from our team will be in touch shortly. Welcome to the ApplyBoard Africa family.`
    );

    // Route to the right staff member with full brief
    const { getState }    = require('../utils/stateManager');
    const { notifyStaff } = require('../services/notificationService');
    const state           = await getState(phone);
    await notifyStaff(phone, state);

  } catch (err) {
    console.error('[PAYMENT] Post-confirmation error:', err.message);
  }
};

module.exports = { handlePayment, onPaymentConfirmed };