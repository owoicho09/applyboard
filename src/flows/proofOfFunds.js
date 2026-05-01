const { sendButtons, sendText } = require('../services/whatsapp');
const { setState }              = require('../utils/stateManager');
const { updateLead }            = require('../services/leadService');
const { STAGES, BTN }           = require('../config/constants');
const { startConsultation }     = require('./consultation');

const handlePoF = async (from, action, state) => {

  if (action === 'START') {
    await setState(from, STAGES.POF_ADVISORY, { service: 'Proof of Funds' });
    await updateLead(from, { service_interested: 'pof' });

    await sendText(
      from,
      `💵 *Proof of Funds (PoF) Advisory*\n\n` +
      `Most embassies require you to show sufficient funds before granting a visa.\n\n` +
      `*Minimum requirements by country:*\n` +
      `🇨🇦 Canada — CAD 10,000+\n` +
      `🇬🇧 UK — £1,334/month for up to 9 months\n` +
      `🇩🇪 Germany — €11,208 (Blocked Account)\n` +
      `🇪🇺 Schengen — €50–100/day of stay\n` +
      `🇦🇺 Australia — AUD 20,000+\n\n` +
      `*What we help with:*\n` +
      `✅ Determining the exact amount required\n` +
      `✅ Bank letter format accepted by embassies\n` +
      `✅ Blocked account setup (Germany)\n` +
      `✅ Sponsorship letter templates\n` +
      `✅ Financial document review`
    );

    return sendButtons(
      from,
      `Would you like expert guidance on your Proof of Funds?`,
      [
        { id: BTN.SVC_CONSULT, title: '✅ Get Expert Help' },
        { id: BTN.MENU_MAIN,   title: '🏠 Main Menu' },
      ]
    );
  }
};

module.exports = { handlePoF };