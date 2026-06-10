const { sendButtons, sendText } = require('../services/messenger');
const { setState, updateData }  = require('../utils/stateManager');
const { updateLead }            = require('../services/leadService');
const { STAGES }                = require('../config/stages');
const { BTN }                   = require('../config/buttons');
const { formatLoanMessage }     = require('../data/loanPackages');
const { stripWhatsAppMarkdown } = require('../utils/validators');

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
    await updateData(from, { loan_region: 'Europe/UK', service: 'loan' });
    await updateLead(from, { loan_interest: true });
    await setState(from, STAGES.FREE_TEXT_AI);

    const msg = formatLoanMessage('EUROPE');
    await sendText(from, msg);

    const { askAI } = require('../services/ai');
    const aiReply   = await askAI(
      from,
      'Europe/UK Masters loan.',
      { stage: STAGES.FREE_TEXT_AI, data: { ...state.data, loan_region: 'Europe/UK', service: 'loan' } },
      `The user is interested in a Masters loan for Europe or UK. The loan details message was just sent above. Your job now: ask one natural qualifying question — either their age (loan has a 32+ age restriction), which country specifically, or what Masters program they are targeting. Keep it conversational and warm. One question only.`
    );
    const clean = !from.startsWith('tg_') ? stripWhatsAppMarkdown(aiReply) : aiReply;
    return sendText(from, clean);
  }

  // ── Step 3: Canada loan ───────────────────────────────
  if (action === BTN.LOAN_CA) {
    await updateData(from, { loan_region: 'Canada', service: 'loan' });
    await updateLead(from, { loan_interest: true });
    await setState(from, STAGES.FREE_TEXT_AI);

    const msg = formatLoanMessage('CANADA');
    await sendText(from, msg);

    const { askAI } = require('../services/ai');
    const aiReply   = await askAI(
      from,
      'Canada study loan.',
      { stage: STAGES.FREE_TEXT_AI, data: { ...state.data, loan_region: 'Canada', service: 'loan' } },
      `The user is interested in the Canada study loan. The loan details message was just sent above. Ask one natural qualifying question — their age (important for eligibility since 32+ limits options), or what program they are targeting (undergrad or masters). One question, warm and direct.`
    );
    const clean = !from.startsWith('tg_') ? stripWhatsAppMarkdown(aiReply) : aiReply;
    return sendText(from, clean);
  }

  // ── Step 4: Scholarships ──────────────────────────────
  if (action === BTN.LOAN_SCH) {
    await updateData(from, { loan_region: 'Scholarship', service: 'loan' });
    await updateLead(from, { loan_interest: true });
    await setState(from, STAGES.FREE_TEXT_AI);

    const { askAI } = require('../services/ai');
    const aiReply   = await askAI(
      from,
      'Scholarships.',
      { stage: STAGES.FREE_TEXT_AI, data: { ...state.data, loan_region: 'Scholarship', service: 'loan' } },
      `The user is interested in scholarships. Share one specific, surprising insight about how scholarships actually work for Nigerian students — either the 6–12 month deadline reality, merit vs need-based split, or the fact that partner schools offer 10–50% tuition reductions that most people miss. Then ask one qualifying question about their program or target country to help identify the best match. Under 4 sentences. No bullet points. Sound like Ade.`
    );
    const clean = !from.startsWith('tg_') ? stripWhatsAppMarkdown(aiReply) : aiReply;
    return sendText(from, clean);
  }
};

module.exports = { handleLoan };
