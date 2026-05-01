const { sendButtons, sendList, sendText } = require('../services/whatsapp');
const { setState, updateData }            = require('../utils/stateManager');
const { updateLead }                      = require('../services/leadService');
const { STAGES, BTN }                     = require('../config/constants');
const { startConsultation }               = require('./consultation');

const VISA_TYPES = {
  [BTN.VT_STUDY]:    'Study Visa',
  [BTN.VT_TOURIST]:  'Tourist / Visit Visa',
  [BTN.VT_BUSINESS]: 'Business Visa',
  [BTN.VT_WORK]:     'Work Visa',
  [BTN.VT_FAMILY]:   'Family Reunion Visa',
};

const VISA_DESTINATIONS = {
  'UK_VISA':  'United Kingdom',
  'CA_VISA':  'Canada',
  'US_VISA':  'United States',
  'SCH_VISA': 'Schengen (Europe)',
  'AU_VISA':  'Australia',
  'UAE_VISA': 'Dubai / UAE',
  'OTH_VISA': 'Other',
};

const handleVisa = async (from, action, state) => {

  // ── Step 1: Select visa type ──────────────────────────
  if (action === 'START') {
    await setState(from, STAGES.VISA_TYPE, { service: 'Visa Processing' });
    await updateLead(from, { service_interested: 'visa' });

    return sendButtons(
      from,
      `🛂 *Visa Processing — ApplyBoard Africa*\n\n${95}%+ success rate across all visa categories.\n\nWhat type of visa do you need?`,
      [
        { id: BTN.VT_STUDY,   title: '🎓 Study Visa' },
        { id: BTN.VT_TOURIST, title: '🏖️ Tourist Visa' },
        { id: BTN.VT_BUSINESS, title: '💼 Business Visa' },
      ]
    );
  }

  // Show work and family options as follow-up
  if (action === 'MORE_VISA') {
    return sendButtons(
      from,
      'More visa types:',
      [
        { id: BTN.VT_WORK,   title: '👷 Work Visa' },
        { id: BTN.VT_FAMILY, title: '👨‍👩‍👧 Family Visa' },
        { id: BTN.MENU_MAIN, title: '🏠 Main Menu' },
      ]
    );
  }

  // ── Step 2: Visa type selected → ask destination ──────
  if (VISA_TYPES[action]) {
    const visaType = VISA_TYPES[action];
    await updateData(from, { visa_type: visaType });
    await updateLead(from, { service_interested: 'visa' });
    await setState(from, STAGES.VISA_DESTINATION);

    return sendList(
      from,
      `*${visaType}* — Which country are you applying to?`,
      'Select Country',
      [{
        title: 'Destinations',
        rows: [
          { id: 'UK_VISA',  title: '🇬🇧 United Kingdom',  description: 'BRP + 90-day entry' },
          { id: 'CA_VISA',  title: '🇨🇦 Canada',          description: 'TRV / eTA' },
          { id: 'US_VISA',  title: '🇺🇸 United States',   description: 'B1/B2 Visa' },
          { id: 'SCH_VISA', title: '🇪🇺 Schengen Europe', description: 'France, Germany, Italy...' },
          { id: 'AU_VISA',  title: '🇦🇺 Australia',       description: 'Visitor / Student' },
          { id: 'UAE_VISA', title: '🇦🇪 Dubai / UAE',     description: 'Tourist / Business' },
          { id: 'OTH_VISA', title: '🌍 Other Country',    description: 'Tell us your destination' },
        ],
      }]
    );
  }

  // ── Step 3: Destination → info + push consult ─────────
  if (VISA_DESTINATIONS[action]) {
    const destination = VISA_DESTINATIONS[action];
    const visaType    = state.data?.visa_type || 'Visa';

    await updateData(from, { destination });
    await updateLead(from, { destination_country: destination, conversation_stage: 'qualified' });

    await sendText(
      from,
      `✅ *${visaType} — ${destination}*\n\n` +
      `What we handle for you:\n` +
      `✔ Document checklist & review\n` +
      `✔ Application form completion\n` +
      `✔ Embassy appointment booking\n` +
      `✔ Biometrics scheduling\n` +
      `✔ Interview preparation (if required)\n\n` +
      `📊 *95%+ success rate | 10+ years experience*\n\n` +
      `Let's book your FREE consultation to get started!`
    );

    return startConsultation(from, state);
  }
};

module.exports = { handleVisa };