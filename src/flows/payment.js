const { sendText }           = require('../services/messenger');
const { setState, getState } = require('../utils/stateManager');
const { updateLead }         = require('../services/leadService');
const { MESSAGES, STAGES, BTN, REGISTRATION_FEE, COMPANY } = require('../config/constants');
const { formatCurrency }     = require('../utils/helpers');
const supabase               = require('../config/database');

const handlePayment = async (from, action, state) => {
  const amount  = action === 'REGISTRATION'
    ? REGISTRATION_FEE
    : (state.data?.payment_amount || REGISTRATION_FEE);
  const service = state.data?.service || 'ApplyBoard Africa';

  // ── Generate Paystack link immediately ────────────────
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

      await setState(from, STAGES.PAYMENT_AWAITING, { payment_ref: reference, payment_url: url });

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
        `Having a small issue generating the link right now. Reach us directly on ${process.env.BUSINESS_PHONE || COMPANY.phone} and we sort it immediately.`
      );
    }
  }

  // ── Bank transfer — Paystack handles it, no account number needed ─
  if (action === BTN.PAY_BANK) {
    const url = state.data?.payment_url;
    return sendText(from, MESSAGES.paystackTransfer(url));
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

    // ── Client confirmation message ───────────────────────
    // Isolated: a WhatsApp API failure (e.g. expired 24-hr session window,
    // transient Meta error) must NOT block the owner/staff notifications below.
    try {
      const { sendText: send } = require('../services/messenger');
      await send(
        phone,
        `Payment confirmed. You are in.\n\nReference: ${reference}\n\nNext step — book your session with our team directly here:\n\n${process.env.CALENDLY_URL || COMPANY.calendly}\n\nPick a time that works for you and they will be ready with everything they need about your case.`
      );
    } catch (sendErr) {
      console.error(
        '[PAYMENT] Client confirmation message failed — WhatsApp API rejected send.',
        '| phone:', phone,
        '| ref:', reference,
        '| reason:', sendErr.response?.data || sendErr.message
      );
      // Do NOT return — owner and staff notifications must still fire.
    }

    // ── Notify owner of confirmed payment ────────────────
    try {
      const { notifyOwner } = require('../services/notifyOwner');
      const { getLead }     = require('../services/leadService');
      const lead            = await getLead(phone);
      await notifyOwner(
        `💰 *Payment Confirmed*\n\nName: ${lead?.name || 'Unknown'}\nPhone: ${phone}\nAmount: ₦${Number(amount).toLocaleString('en-NG')}\nReference: ${reference}\nTime: ${new Date().toLocaleTimeString('en-NG', { timeZone: 'Africa/Lagos' })} WAT`
      );
    } catch (e) {
      console.error('[PAYMENT] notify error:', e.message);
    }

    // ── Route to the right staff member with full brief ──
    // Isolated: a staff routing failure must NOT block the state reset below.
    try {
      const { notifyStaff } = require('../services/notificationService');
      const state           = await getState(phone);
      await notifyStaff(phone, state);
    } catch (staffErr) {
      console.error('[PAYMENT] Staff notification failed:', staffErr.message, '| phone:', phone);
    }

    // ── Clear payment-awaiting state ──────────────────────
    try {
      const { clearState } = require('../utils/stateManager');
      await clearState(phone);
      await setState(phone, STAGES.FREE_TEXT_AI, {});
    } catch (e) {
      console.error('[PAYMENT] State reset error:', e.message);
    }

  } catch (err) {
    console.error('[PAYMENT] Post-confirmation error:', err.message);
  }
};

module.exports = { handlePayment, onPaymentConfirmed };