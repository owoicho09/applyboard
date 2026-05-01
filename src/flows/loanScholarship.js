const { sendButtons, sendText } = require('../services/whatsapp');
const { setState, updateData }  = require('../utils/stateManager');
const { updateLead }            = require('../services/leadService');
const { STAGES, BTN }           = require('../config/constants');
const { formatLoanMessage }     = require('../data/loanPackages');
const { startConsultation }     = require('./consultation');

const handleLoan = async (from, action, state) => {

  // ── Step 1: Show loan options ─────────────────────────
  if (action === 'START') {
    await setState(from, STAGES.LOAN_COUNTRY, { service: 'Study Loan & Scholarship' });
    await updateLead(from, { service_interested: 'loan', loan_interest: true });

    return sendButtons(
      from,
      `💰 *Study Loan & Scholarship Support*\n\n` +
      `We partner with *Prodigy Finance, MPOWER, Passage Loan* and *ApplyBoard Financing* to fund your education.\n\n` +
      `✅ Loans covering up to 100% of tuition\n` +
      `✅ Repayment starts 6 months after graduation\n` +
      `✅ No penalty for early repayment\n\n` +
      `⚡ *Limited funding slots — serious applicants only*\n\n` +
      `Which region are you interested in?`,
      [
        { id: BTN.LOAN_EUR, title: '🇪🇺 Europe (UK/EU)' },
        { id: BTN.LOAN_CA,  title: '🇨🇦 Canada' },
        { id: BTN.LOAN_SCH, title: '🎓 Scholarships' },
      ]
    );
  }

  // ── Step 2: Europe loan ───────────────────────────────
  if (action === BTN.LOAN_EUR) {
    await updateData(from, { loan_region: 'Europe/UK' });
    const msg = formatLoanMessage('EUROPE');
    await sendText(from, msg);

    await sendButtons(
      from,
      `Ready to check your eligibility? It starts with a simple credit check.`,
      [
        { id: BTN.SVC_CONSULT, title: '✅ Check Eligibility' },
        { id: BTN.MENU_MAIN,   title: '🏠 Main Menu' },
      ]
    );
    return startConsultation(from, { ...state, data: { ...state.data, service: 'Europe Study Loan' } });
  }

  // ── Step 3: Canada loan ───────────────────────────────
  if (action === BTN.LOAN_CA) {
    await updateData(from, { loan_region: 'Canada' });
    const msg = formatLoanMessage('CANADA');
    await sendText(from, msg);

    return startConsultation(from, { ...state, data: { ...state.data, service: 'Canada Study Loan' } });
  }

  // ── Step 4: Scholarships ──────────────────────────────
  if (action === BTN.LOAN_SCH) {
    await updateData(from, { loan_region: 'Scholarship' });

    await sendText(
      from,
      `🎓 *Scholarship Opportunities*\n\n` +
      `Most of our partner universities offer *10–50% tuition scholarships*.\n\n` +
      `✅ We identify the best scholarship match for your profile\n` +
      `✅ We handle your scholarship application alongside your admission\n` +
      `✅ Merit-based and need-based options available\n\n` +
      `*Our scholarship partners include schools in:*\n` +
      `🇨🇦 Canada | 🇬🇧 UK | 🇩🇪 Germany | 🇮🇪 Ireland | 🇦🇺 Australia\n\n` +
      `⚡ Scholarship deadlines are often 6–12 months before intake. Apply early!`
    );

    return startConsultation(from, { ...state, data: { ...state.data, service: 'Scholarship' } });
  }
};

module.exports = { handleLoan };