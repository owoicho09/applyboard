const { sendButtons, sendList, sendText } = require('../services/whatsapp');
const { setState, updateData }            = require('../utils/stateManager');
const { updateLead }                      = require('../services/leadService');
const { STAGES, BTN }                     = require('../config/constants');
const { getBatch }                        = require('../data/batches');
const { startConsultation }               = require('./consultation');

const EXAM_MAP = {
  [BTN.TP_IELTS]:    'IELTS',
  [BTN.TP_TOEFL]:    'TOEFL',
  [BTN.TP_GRE]:      'GRE',
  [BTN.TP_GMAT]:     'GMAT',
  [BTN.TP_SAT]:      'SAT',
  [BTN.TP_PTE]:      'PTE',
  [BTN.TP_DUOLINGO]: 'DUOLINGO',
  [BTN.TP_GERMAN]:   'GERMAN',
  [BTN.TP_FRENCH]:   'FRENCH',
  [BTN.TP_JAPANESE]: 'JAPANESE',
};

const handleTestPrep = async (from, action, state) => {

  // ── Step 1: Show exam categories ─────────────────────
  if (action === 'START') {
    await setState(from, STAGES.TEST_EXAM_SELECT, { service: 'Test Preparation' });
    await updateLead(from, { service_interested: 'test_prep' });

    return sendList(
      from,
      `📝 *Test Preparation & Language Classes*\n\nExpert tutors | Mock tests | Score guarantee\n\nWhich exam or language are you preparing for?`,
      'Select Exam',
      [
        {
          title: '🌐 English Proficiency',
          rows: [
            { id: BTN.TP_IELTS,    title: 'IELTS Plus (Intensive)', description: 'Band guarantee — 6 weeks' },
            { id: BTN.TP_TOEFL,    title: 'TOEFL Preparation',      description: '4 weeks — all modules' },
            { id: BTN.TP_PTE,      title: 'PTE Academic',           description: '4 weeks online/offline' },
            { id: BTN.TP_DUOLINGO, title: 'Duolingo English Test',  description: '2 weeks fast track' },
          ],
        },
        {
          title: '📊 Graduate Admissions',
          rows: [
            { id: BTN.TP_GRE,  title: 'GRE Preparation', description: '6 weeks — Quant + Verbal' },
            { id: BTN.TP_GMAT, title: 'GMAT Preparation', description: '6 weeks — full coaching' },
            { id: BTN.TP_SAT,  title: 'SAT Preparation',  description: '8 weeks — College Board' },
          ],
        },
        {
          title: '🗣️ Language Classes',
          rows: [
            { id: BTN.TP_GERMAN,   title: 'German Language A1–B2', description: '12 weeks per level' },
            { id: BTN.TP_FRENCH,   title: 'French Language A1+',   description: '10 weeks per level' },
            { id: BTN.TP_JAPANESE, title: 'Japanese Language',     description: 'JLPT N5 prep — 12 weeks' },
          ],
        },
      ]
    );
  }

  // ── Step 2: Exam selected → show batches ─────────────
  if (EXAM_MAP[action]) {
    const examKey  = EXAM_MAP[action];
    const batch    = getBatch(examKey);
    if (!batch) return sendText(from, 'Details coming soon. Please contact us directly.');

    await updateData(from, { exam: examKey, service: `Test Prep — ${batch.label}` });
    await updateLead(from, { test_prep_exam: examKey });
    await setState(from, STAGES.TEST_BATCH_SELECT);

    const scheduleText = batch.schedules
      .map((s, i) => `${i + 1}. *${s.label}* — ${s.time}`)
      .join('\n');

    await sendText(
      from,
      `📚 *${batch.label}*\n\n` +
      `⏱ Duration: ${batch.duration}\n` +
      `💰 Fee: ${batch.fee}\n` +
      `✅ Includes: ${batch.includes}\n\n` +
      `*Available Batches:*\n${scheduleText}\n\n` +
      `Reply with the batch number to register.`
    );

    return sendButtons(
      from,
      'Choose your preferred batch:',
      [
        { id: BTN.BATCH_MORNING,   title: '🌅 Morning' },
        { id: BTN.BATCH_WEEKEND,   title: '📅 Weekend' },
        { id: BTN.BATCH_ONLINE,    title: '💻 Online' },
      ]
    );
  }

  // ── Step 3: Batch selected → register ────────────────
  const BATCH_LABELS = {
    [BTN.BATCH_MORNING]:   'Morning Batch',
    [BTN.BATCH_EVENING]:   'Evening Batch',
    [BTN.BATCH_WEEKEND]:   'Weekend Batch',
    [BTN.BATCH_INTENSIVE]: 'Intensive Batch',
    [BTN.BATCH_ONLINE]:    'Online (Self-paced)',
  };

  if (BATCH_LABELS[action]) {
    const batchLabel = BATCH_LABELS[action];
    const exam       = state.data?.exam || 'Test Prep';
    await updateData(from, { batch: batchLabel });
    await updateLead(from, { conversation_stage: 'qualified' });

    await sendText(
      from,
      `✅ *Registration: ${exam} — ${batchLabel}*\n\n` +
      `Next step: Book your FREE consultation to confirm your spot and get your study materials.\n\n` +
      `⚡ *Limited seats available — secure yours now!*`
    );

    return startConsultation(from, state);
  }
};

module.exports = { handleTestPrep };