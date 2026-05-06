const { sendButtons, sendList, sendText } = require('../services/messenger');
const { setState, updateData }            = require('../utils/stateManager');
const { updateLead }                      = require('../services/leadService');
const { STAGES, BTN }                     = require('../config/constants');
const { startConsultation }               = require('./consultation');
const { documentChecklist, statsBlock }   = require('../utils/messageTemplates');

const DESTINATIONS = {
  [BTN.SA_CANADA]:  'Canada',
  [BTN.SA_UK]:      'United Kingdom',
  [BTN.SA_USA]:     'United States',
  [BTN.SA_GERMANY]: 'Germany',
  [BTN.SA_AUS]:     'Australia',
  [BTN.SA_IRELAND]: 'Ireland',
  [BTN.SA_NZ]:      'New Zealand',
  [BTN.SA_OTHER]:   'Other',
};

const LEVELS = {
  [BTN.SL_UG]:      'Undergraduate',
  [BTN.SL_PG]:      'Postgraduate',
  [BTN.SL_DIPLOMA]: 'Diploma / PGD',
};

const TIMELINES = {
  [BTN.ST_NOW]:   '0–3 months',
  [BTN.ST_MID]:   '3–6 months',
  [BTN.ST_LATER]: '6–12 months',
};

const handleStudyAbroad = async (from, action, state) => {

  // ── Step 1: Show country list ─────────────────────────
  if (action === 'START') {
    await setState(from, STAGES.STUDY_DESTINATION, { service: 'Study Abroad' });
    await updateLead(from, { service_interested: 'study_abroad' });

    return sendList(
      from,
      `📚 *Study Abroad — ApplyBoard Africa*\n\nWe have helped ${5000}+ students get admitted to top universities worldwide. 🎓\n\nWhich country are you interested in?`,
      'Select Country',
      [{
        title: '🌍 Popular Destinations',
        rows: [
          { id: BTN.SA_CANADA,  title: '🇨🇦 Canada',          description: 'SDS Visa — Fast track' },
          { id: BTN.SA_UK,      title: '🇬🇧 United Kingdom',   description: 'Tier 4 Student Visa' },
          { id: BTN.SA_USA,     title: '🇺🇸 United States',    description: 'F-1 Student Visa' },
          { id: BTN.SA_GERMANY, title: '🇩🇪 Germany',          description: 'Tuition-free universities' },
          { id: BTN.SA_AUS,     title: '🇦🇺 Australia',        description: 'Subclass 500 Visa' },
          { id: BTN.SA_IRELAND, title: '🇮🇪 Ireland',          description: 'EU access, affordable' },
          { id: BTN.SA_NZ,      title: '🇳🇿 New Zealand',      description: 'Safe & scenic' },
          { id: BTN.SA_OTHER,   title: '🌍 Other Country',     description: 'Schengen & more' },
        ],
      }]
    );
  }

  // ── Step 2: Country selected → ask level ─────────────
  if (DESTINATIONS[action]) {
    const destination = DESTINATIONS[action];
    await updateData(from, { destination });
    await updateLead(from, { destination_country: destination });
    await setState(from, STAGES.STUDY_LEVEL);

    return sendButtons(
      from,
      `Great choice! 🎓 *${destination}* is an excellent destination.\n\nWhat level of study are you pursuing?`,
      [
        { id: BTN.SL_UG,      title: '🎓 Undergraduate' },
        { id: BTN.SL_PG,      title: '🏫 Postgraduate' },
        { id: BTN.SL_DIPLOMA, title: '📜 Diploma / PGD' },
      ]
    );
  }

  // ── Step 3: Level selected → ask timeline ────────────
  if (LEVELS[action]) {
    const level = LEVELS[action];
    await updateData(from, { program_level: level });
    await updateLead(from, { program_level: level });
    await setState(from, STAGES.STUDY_TIMELINE);

    return sendButtons(
      from,
      `Perfect! *${level}* in *${state.data?.destination || 'your chosen country'}*.\n\nWhen are you looking to start?`,
      [
        { id: BTN.ST_NOW,   title: '🔥 ASAP (0–3 months)' },
        { id: BTN.ST_MID,   title: '📅 3–6 months' },
        { id: BTN.ST_LATER, title: '🗓️ 6–12 months' },
      ]
    );
  }

  // ── Step 4: Timeline → send checklist + push consult ─
  if (TIMELINES[action]) {
    const timeline    = TIMELINES[action];
    const destination = state.data?.destination || 'your destination';
    const level       = state.data?.program_level || 'your program';

    await updateData(from, { timeline });
    await updateLead(from, { timeline, conversation_stage: 'qualified' });

    await sendText(
      from,
      `✅ *Excellent! Here is your profile:*\n\n` +
      `📌 Destination: *${destination}*\n` +
      `📌 Level: *${level}*\n` +
      `📌 Timeline: *${timeline}*\n\n` +
      `Our counselors will:\n` +
      `1️⃣ Identify the best universities for your profile\n` +
      `2️⃣ Guide your application end-to-end\n` +
      `3️⃣ Prepare all your documents\n` +
      `4️⃣ Process your student visa\n\n` +
      statsBlock()
    );

    // Send document checklist
    const countryKey = destination.split(' ')[0]; // "United Kingdom" → "United"
    const checklistCountry = destination === 'United Kingdom' ? 'UK' : countryKey;
    await sendText(from, documentChecklist(checklistCountry));

    // Push to consultation
    return startConsultation(from, state);
  }
};

module.exports = { handleStudyAbroad };
