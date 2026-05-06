const { sendButtons, sendText } = require('../services/messenger');
const { setState, getState }    = require('../utils/stateManager');
const { updateLead }            = require('../services/leadService');
const { MESSAGES, STAGES, BTN } = require('../config/constants');
const { formatCurrency }        = require('../utils/helpers');
const supabase                  = require('../config/database');

const handlePayment = async (from, action, state) => {
  const amount  = state.data?.payment_amount || 50000;
  const service = state.data?.service        || 'ApplyBoard Africa Service';

  // ── Show invoice ──────────────────────────────────────
  if (action === 'START' || action === BTN.PAY_NOW || action === BTN.PAY_BANK || action === BTN.PAY_INSTALL) {

    if (action === 'START') {
      await setState(from, STAGES.PAYMENT_INVOICE);
      const { paymentSummary } = require('../utils/messageTemplates');
      await sendText(from, paymentSummary(service, formatCurrency(amount)));

      return sendButtons(
        from,
        'Choose your payment method:',
        [
          { id: BTN.PAY_NOW,     title: '💳 Pay with Card' },
          { id: BTN.PAY_BANK,    title: '🏦 Bank Transfer' },
          { id: BTN.PAY_INSTALL, title: '📋 Installment Plan' },
        ]
      );
    }

    // ── Paystack card payment ─────────────────────────
    if (action === BTN.PAY_NOW) {
      try {
        const { initializePayment } = require('../services/paystack');
        const email = state.data?.email || `${from.replace('+', '')}@applyboard.temp`;

        const { url, reference } = await initializePayment(email, amount, {
          phone_number: from,
          service,
          name: state.data?.name || '',
        });

        await setState(from, STAGES.PAYMENT_AWAITING, { payment_ref: reference });

        // Save pending payment record
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
        await updateLead(from, { payment_status: 'pending', payment_method: 'paystack' });

        return sendText(
          from,
          `💳 *Secure Payment Link*\n\nAmount: ${formatCurrency(amount)}\nService: ${service}\n\n👇 Click to pay securely:\n${url}\n\n🔒 _Powered by Paystack. SSL secured._\n\nOnce payment is complete, you will receive an automatic confirmation here.`
        );
      } catch (err) {
        console.error('[PAYMENT] Paystack init error:', err.message);
        return sendText(from, `Sorry, we couldn't generate your payment link right now. Please try bank transfer or contact us directly.\n\n📞 ${process.env.BUSINESS_PHONE || ''}`);
      }
    }

    // ── Bank transfer ─────────────────────────────────
    if (action === BTN.PAY_BANK) {
      await setState(from, STAGES.PAYMENT_AWAITING, { payment_method: 'bank_transfer' });
      await updateLead(from, { payment_status: 'pending', payment_method: 'bank_transfer' });

      await sendText(from, MESSAGES.bankTransfer());
      return sendText(
        from,
        `After sending, please type:\n*"I have paid"* and our team will confirm within 1 hour. ✅`
      );
    }

    // ── Installment plan ──────────────────────────────
    if (action === BTN.PAY_INSTALL) {
      return sendButtons(
        from,
        `📋 *Installment Plan Available*\n\nWe offer flexible payment plans tailored to your budget.\n\nOur counselor will create a custom plan for you on your free consultation call.`,
        [
          { id: BTN.SVC_CONSULT, title: '📞 Book Consultation' },
          { id: BTN.MENU_MAIN,   title: '🏠 Main Menu' },
        ]
      );
    }
  }
};

module.exports = { handlePayment };
