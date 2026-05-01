const { sendMainMenu }      = require('../flows/mainMenu');
const { sendGreeting }      = require('../flows/greeting');
const { handleStudyAbroad } = require('../flows/studyAbroad');
const { handleVisa }        = require('../flows/visaProcessing');
const { handleTestPrep }    = require('../flows/testPrep');
const { handleLoan }        = require('../flows/loanScholarship');
const { handleTravel }      = require('../flows/travelServices');
const { handlePilgrimage }  = require('../flows/pilgrimage');
const { handlePoF }         = require('../flows/proofOfFunds');
const { startConsultation } = require('../flows/consultation');
const { handlePayment }     = require('../flows/payment');
const { escalate }          = require('../flows/escalation');
const { sendText }          = require('../services/whatsapp');
const { BTN, STAGES }       = require('../config/constants');

// ── Master route map — every button ID mapped to its handler
const ROUTE_MAP = {
  // Navigation
  [BTN.MENU_MAIN]:    (f, s) => sendMainMenu(f),
  [BTN.MENU_EXPLORE]: (f, s) => sendMainMenu(f),
  [BTN.MENU_CONSULT]: (f, s) => startConsultation(f, s),
  [BTN.BACK]:         (f, s) => sendMainMenu(f),

  // Services — entry points
  [BTN.SVC_STUDY]:   (f, s) => handleStudyAbroad(f, 'START', s),
  [BTN.SVC_VISA]:    (f, s) => handleVisa(f, 'START', s),
  [BTN.SVC_LOAN]:    (f, s) => handleLoan(f, 'START', s),
  [BTN.SVC_TEST]:    (f, s) => handleTestPrep(f, 'START', s),
  [BTN.SVC_TRAVEL]:  (f, s) => handleTravel(f, 'START', s),
  [BTN.SVC_INSURE]:  (f, s) => handleTravel(f, 'INSURANCE', s),
  [BTN.SVC_HAJJ]:    (f, s) => handlePilgrimage(f, 'START', s),
  [BTN.SVC_POF]:     (f, s) => handlePoF(f, 'START', s),
  [BTN.SVC_CONSULT]: (f, s) => startConsultation(f, s),

  // Study abroad destinations
  [BTN.SA_CANADA]:  (f, s) => handleStudyAbroad(f, BTN.SA_CANADA, s),
  [BTN.SA_UK]:      (f, s) => handleStudyAbroad(f, BTN.SA_UK, s),
  [BTN.SA_USA]:     (f, s) => handleStudyAbroad(f, BTN.SA_USA, s),
  [BTN.SA_GERMANY]: (f, s) => handleStudyAbroad(f, BTN.SA_GERMANY, s),
  [BTN.SA_AUS]:     (f, s) => handleStudyAbroad(f, BTN.SA_AUS, s),
  [BTN.SA_IRELAND]: (f, s) => handleStudyAbroad(f, BTN.SA_IRELAND, s),
  [BTN.SA_NZ]:      (f, s) => handleStudyAbroad(f, BTN.SA_NZ, s),
  [BTN.SA_OTHER]:   (f, s) => handleStudyAbroad(f, BTN.SA_OTHER, s),

  // Program levels
  [BTN.SL_UG]:      (f, s) => handleStudyAbroad(f, BTN.SL_UG, s),
  [BTN.SL_PG]:      (f, s) => handleStudyAbroad(f, BTN.SL_PG, s),
  [BTN.SL_DIPLOMA]: (f, s) => handleStudyAbroad(f, BTN.SL_DIPLOMA, s),

  // Timelines
  [BTN.ST_NOW]:   (f, s) => handleStudyAbroad(f, BTN.ST_NOW, s),
  [BTN.ST_MID]:   (f, s) => handleStudyAbroad(f, BTN.ST_MID, s),
  [BTN.ST_LATER]: (f, s) => handleStudyAbroad(f, BTN.ST_LATER, s),

  // Visa types
  [BTN.VT_STUDY]:    (f, s) => handleVisa(f, BTN.VT_STUDY, s),
  [BTN.VT_TOURIST]:  (f, s) => handleVisa(f, BTN.VT_TOURIST, s),
  [BTN.VT_BUSINESS]: (f, s) => handleVisa(f, BTN.VT_BUSINESS, s),
  [BTN.VT_WORK]:     (f, s) => handleVisa(f, BTN.VT_WORK, s),
  [BTN.VT_FAMILY]:   (f, s) => handleVisa(f, BTN.VT_FAMILY, s),

  // Visa destinations
  'UK_VISA':  (f, s) => handleVisa(f, 'UK_VISA', s),
  'CA_VISA':  (f, s) => handleVisa(f, 'CA_VISA', s),
  'US_VISA':  (f, s) => handleVisa(f, 'US_VISA', s),
  'SCH_VISA': (f, s) => handleVisa(f, 'SCH_VISA', s),
  'AU_VISA':  (f, s) => handleVisa(f, 'AU_VISA', s),
  'UAE_VISA': (f, s) => handleVisa(f, 'UAE_VISA', s),
  'OTH_VISA': (f, s) => handleVisa(f, 'OTH_VISA', s),

  // Test prep
  [BTN.TP_IELTS]:    (f, s) => handleTestPrep(f, BTN.TP_IELTS, s),
  [BTN.TP_TOEFL]:    (f, s) => handleTestPrep(f, BTN.TP_TOEFL, s),
  [BTN.TP_GRE]:      (f, s) => handleTestPrep(f, BTN.TP_GRE, s),
  [BTN.TP_GMAT]:     (f, s) => handleTestPrep(f, BTN.TP_GMAT, s),
  [BTN.TP_SAT]:      (f, s) => handleTestPrep(f, BTN.TP_SAT, s),
  [BTN.TP_PTE]:      (f, s) => handleTestPrep(f, BTN.TP_PTE, s),
  [BTN.TP_DUOLINGO]: (f, s) => handleTestPrep(f, BTN.TP_DUOLINGO, s),
  [BTN.TP_GERMAN]:   (f, s) => handleTestPrep(f, BTN.TP_GERMAN, s),
  [BTN.TP_FRENCH]:   (f, s) => handleTestPrep(f, BTN.TP_FRENCH, s),
  [BTN.TP_JAPANESE]: (f, s) => handleTestPrep(f, BTN.TP_JAPANESE, s),

  // Batches
  [BTN.BATCH_MORNING]:   (f, s) => handleTestPrep(f, BTN.BATCH_MORNING, s),
  [BTN.BATCH_EVENING]:   (f, s) => handleTestPrep(f, BTN.BATCH_EVENING, s),
  [BTN.BATCH_WEEKEND]:   (f, s) => handleTestPrep(f, BTN.BATCH_WEEKEND, s),
  [BTN.BATCH_INTENSIVE]: (f, s) => handleTestPrep(f, BTN.BATCH_INTENSIVE, s),
  [BTN.BATCH_ONLINE]:    (f, s) => handleTestPrep(f, BTN.BATCH_ONLINE, s),

  // Loans
  [BTN.LOAN_EUR]: (f, s) => handleLoan(f, BTN.LOAN_EUR, s),
  [BTN.LOAN_UK]:  (f, s) => handleLoan(f, BTN.LOAN_UK, s),
  [BTN.LOAN_CA]:  (f, s) => handleLoan(f, BTN.LOAN_CA, s),
  [BTN.LOAN_SCH]: (f, s) => handleLoan(f, BTN.LOAN_SCH, s),

  // Travel
  [BTN.TV_FLIGHTS]:   (f, s) => handleTravel(f, BTN.TV_FLIGHTS, s),
  [BTN.TV_HOTELS]:    (f, s) => handleTravel(f, BTN.TV_HOTELS, s),
  [BTN.TV_INSURANCE]: (f, s) => handleTravel(f, BTN.TV_INSURANCE, s),

  // Pilgrimage
  [BTN.PG_HAJJ]:   (f, s) => handlePilgrimage(f, BTN.PG_HAJJ, s),
  [BTN.PG_UMRAH]:  (f, s) => handlePilgrimage(f, BTN.PG_UMRAH, s),
  [BTN.PG_TOURS]:  (f, s) => handlePilgrimage(f, BTN.PG_TOURS, s),
  'TOUR_DUBAI':    (f, s) => handlePilgrimage(f, 'TOUR_DUBAI', s),
  'TOUR_TURKEY':   (f, s) => handlePilgrimage(f, 'TOUR_TURKEY', s),
  'TOUR_EUROPE':   (f, s) => handlePilgrimage(f, 'TOUR_EUROPE', s),

  // Consultation times
  [BTN.CT_MORNING]:   (f, s) => startConsultation(f, s, BTN.CT_MORNING),
  [BTN.CT_AFTERNOON]: (f, s) => startConsultation(f, s, BTN.CT_AFTERNOON),
  [BTN.CT_EVENING]:   (f, s) => startConsultation(f, s, BTN.CT_EVENING),

  // Payment
  [BTN.PAY_NOW]:     (f, s) => handlePayment(f, BTN.PAY_NOW, s),
  [BTN.PAY_BANK]:    (f, s) => handlePayment(f, BTN.PAY_BANK, s),
  [BTN.PAY_INSTALL]: (f, s) => handlePayment(f, BTN.PAY_INSTALL, s),
  [BTN.PAY_CONSULT]: (f, s) => startConsultation(f, s),

  // Escalation
  [BTN.ESCALATE]: (f, s) => escalate(f, s),
};

const handleButton = async (from, btnId, state, message) => {
  console.log(`[BUTTON] from=${from} btnId=${btnId} stage=${state.stage}`);

  const handler = ROUTE_MAP[btnId];
  if (handler) {
    return handler(from, state);
  }

  // Unknown button — route by current state as fallback
  console.warn(`[BUTTON] Unknown btnId: ${btnId} — routing by stage: ${state.stage}`);

  if (state.stage?.startsWith('STUDY_'))   return handleStudyAbroad(from, btnId, state);
  if (state.stage?.startsWith('VISA_'))    return handleVisa(from, btnId, state);
  if (state.stage?.startsWith('TEST_'))    return handleTestPrep(from, btnId, state);
  if (state.stage?.startsWith('LOAN_'))    return handleLoan(from, btnId, state);
  if (state.stage?.startsWith('TRAVEL_'))  return handleTravel(from, btnId, state);
  if (state.stage?.startsWith('CONSULT_')) return startConsultation(from, state, btnId);
  if (state.stage?.startsWith('PAYMENT_')) return handlePayment(from, btnId, state);

  // Final fallback
  return sendMainMenu(from);
};

module.exports = { handleButton };