const batches = {
  IELTS: {
    label:    'IELTS Plus (Intensive)',
    duration: '6 weeks',
    fee:      '₦85,000',
    includes: 'Mock tests, score guarantee, study materials',
    schedules: [
      { id: 'BATCH_MORNING',   label: 'Morning',   time: 'Mon–Fri  7:00am – 9:00am'  },
      { id: 'BATCH_EVENING',   label: 'Evening',   time: 'Mon–Fri  6:00pm – 8:00pm'  },
      { id: 'BATCH_WEEKEND',   label: 'Weekend',   time: 'Sat–Sun  9:00am – 1:00pm'  },
      { id: 'BATCH_INTENSIVE', label: 'Intensive', time: 'Mon–Sat  8:00am – 12:00pm' },
      { id: 'BATCH_ONLINE',    label: 'Online',    time: 'Flexible — self-paced'      },
    ],
  },
  TOEFL: {
    label:    'TOEFL Preparation',
    duration: '4 weeks',
    fee:      '₦75,000',
    includes: 'Practice tests, ETS materials, speaking drills',
    schedules: [
      { id: 'BATCH_MORNING', label: 'Morning', time: 'Mon–Fri  7:00am – 9:00am' },
      { id: 'BATCH_ONLINE',  label: 'Online',  time: 'Flexible — self-paced'    },
    ],
  },
  GRE: {
    label:    'GRE Preparation',
    duration: '6 weeks',
    fee:      '₦90,000',
    includes: 'Quantitative, verbal, AWA coaching',
    schedules: [
      { id: 'BATCH_WEEKEND', label: 'Weekend', time: 'Sat–Sun  10:00am – 2:00pm' },
      { id: 'BATCH_ONLINE',  label: 'Online',  time: 'Flexible — self-paced'     },
    ],
  },
  GMAT: {
    label:    'GMAT Preparation',
    duration: '6 weeks',
    fee:      '₦95,000',
    includes: 'Quant, verbal, IR, AWA — full coaching',
    schedules: [
      { id: 'BATCH_WEEKEND', label: 'Weekend', time: 'Sat–Sun  10:00am – 2:00pm' },
      { id: 'BATCH_ONLINE',  label: 'Online',  time: 'Flexible — self-paced'     },
    ],
  },
  SAT: {
    label:    'SAT Preparation',
    duration: '8 weeks',
    fee:      '₦80,000',
    includes: 'Math, reading, writing — College Board aligned',
    schedules: [
      { id: 'BATCH_MORNING', label: 'Morning', time: 'Mon–Fri  7:00am – 9:00am'  },
      { id: 'BATCH_WEEKEND', label: 'Weekend', time: 'Sat–Sun  9:00am – 1:00pm'  },
    ],
  },
  PTE: {
    label:    'PTE Academic',
    duration: '4 weeks',
    fee:      '₦70,000',
    includes: 'Speaking, writing, reading, listening modules',
    schedules: [
      { id: 'BATCH_ONLINE', label: 'Online', time: 'Flexible — self-paced' },
    ],
  },
  DUOLINGO: {
    label:    'Duolingo English Test',
    duration: '2 weeks',
    fee:      '₦45,000',
    includes: 'Fast-track prep, accepted by 4,000+ institutions',
    schedules: [
      { id: 'BATCH_ONLINE', label: 'Online', time: 'Flexible — self-paced' },
    ],
  },
  GERMAN: {
    label:    'German Language (A1–B2)',
    duration: '12 weeks per level',
    fee:      '₦120,000 per level',
    includes: 'Speaking, writing, Goethe exam prep',
    schedules: [
      { id: 'BATCH_MORNING',   label: 'Morning',   time: 'Mon–Fri  7:00am – 9:00am'  },
      { id: 'BATCH_EVENING',   label: 'Evening',   time: 'Mon–Fri  6:00pm – 8:00pm'  },
      { id: 'BATCH_WEEKEND',   label: 'Weekend',   time: 'Sat–Sun  9:00am – 1:00pm'  },
    ],
  },
  FRENCH: {
    label:    'French Language (A1+)',
    duration: '10 weeks per level',
    fee:      '₦100,000 per level',
    includes: 'Speaking, writing, DELF exam prep',
    schedules: [
      { id: 'BATCH_WEEKEND', label: 'Weekend', time: 'Sat–Sun  9:00am – 1:00pm' },
      { id: 'BATCH_ONLINE',  label: 'Online',  time: 'Flexible — self-paced'    },
    ],
  },
  JAPANESE: {
    label:    'Japanese Language',
    duration: '12 weeks',
    fee:      '₦110,000',
    includes: 'Hiragana, Katakana, basic Kanji, JLPT N5 prep',
    schedules: [
      { id: 'BATCH_WEEKEND', label: 'Weekend', time: 'Sat  10:00am – 2:00pm' },
      { id: 'BATCH_ONLINE',  label: 'Online',  time: 'Flexible — self-paced' },
    ],
  },
};

const getBatch      = (key)  => batches[key] || null;
const getAllBatches  = ()     => batches;
const getBatchKeys  = ()     => Object.keys(batches);

module.exports = { batches, getBatch, getAllBatches, getBatchKeys };