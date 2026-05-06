const { sendList }              = require('../services/messenger');
const { setState }              = require('../utils/stateManager');
const { STAGES, MESSAGES, BTN } = require('../config/constants');

const sendMainMenu = async (from) => {
  await setState(from, STAGES.MAIN_MENU);

  await sendList(
    from,
    MESSAGES.mainMenuHeader,
    'View Services',
    [
      {
        title: '🎓 Study & Visa',
        rows: [
          { id: BTN.SVC_STUDY,   title: '📚 Study Abroad',       description: 'Canada, UK, Germany & more' },
          { id: BTN.SVC_VISA,    title: '🛂 Visa Processing',     description: 'All visa types — fast processing' },
          { id: BTN.SVC_LOAN,    title: '💰 Study Loan & Scholarship', description: 'Fund your education abroad' },
        ],
      },
      {
        title: '📝 Test Prep & Travel',
        rows: [
          { id: BTN.SVC_TEST,   title: '📝 Test Prep & Language', description: 'IELTS, TOEFL, GRE, German...' },
          { id: BTN.SVC_TRAVEL, title: '✈️ Flights & Hotels',     description: 'Cheap flights + accommodation' },
          { id: BTN.SVC_INSURE, title: '🛡️ Travel Insurance',    description: 'Health & travel coverage' },
        ],
      },
      {
        title: '🕋 More Services',
        rows: [
          { id: BTN.SVC_HAJJ,    title: '🕋 Hajj & Umrah',       description: 'Pilgrimage & tour packages' },
          { id: BTN.SVC_POF,     title: '💵 Proof of Funds',      description: 'Bank letters & PoF prep' },
          { id: BTN.SVC_CONSULT, title: '📞 Free Consultation',   description: 'Speak with our counselor' },
        ],
      },
    ]
  );
};

module.exports = { sendMainMenu };
