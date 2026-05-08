// ═══════════════════════════════════════════════════════════
// APPLYBOARD AFRICA — CENTRAL CONTENT & CONFIGURATION FILE
// Edit content here — never in individual flow files
// ═══════════════════════════════════════════════════════════

const COMPANY = {
  name:        'ApplyBoard Africa',
  tagline:     'Education for All — Your Gateway to Global Opportunities',
  phone:       '+234 706 345 9820',
  email:       'info@applyboardafrica.com',
  website:     'www.applyboardafrica.com',
  address:     '16 Abioye Plaza, Ikotun, Lagos, Nigeria',
  regNumber:   'RN: 8977085',
  experience:  '10+',
  clients:     '5,000+',
  successRate: '95%+',
  countries:   '50+',
};

const BANK = {
  bankName:    'GTBank',
  accountName: 'ApplyBoard Africa Ltd',
  accountNo:   'XXXXXXXXXX', // UPDATE before going live
};

// ─── REGISTRATION FEE ────────────────────────────────────────
// Charged for Study Abroad, Visa, Loans, Travel, Pilgrimage
// NOT charged for Test Prep — they pay class fee directly
const REGISTRATION_FEE = 10000; // ₦10,000

// ─── STAFF ROUTING ──────────────────────────────────────────
const STAFF_ROUTING = {
  study_abroad: 'admissions@applyboardafrica.com',
  visa:         'visa@applyboardafrica.com',
  test_prep:    'support@applyboardafrica.com',
  loan:         'admissions@applyboardafrica.com',
  travel:       'info@applyboardafrica.com',
  insurance:    'info@applyboardafrica.com',
  pilgrimage:   'info@applyboardafrica.com',
  pof:          'admissions@applyboardafrica.com',
  complaints:   'complaints@applyboardafrica.com',
  partnerships: 'partnerships@applyboardafrica.com',
  default:      'info@applyboardafrica.com',
};

// ─── COUNTRIES ───────────────────────────────────────────────
const COUNTRIES = {
  europe: [
    'United Kingdom', 'Germany', 'France', 'Ireland', 'Netherlands',
    'Italy', 'Spain', 'Belgium', 'Switzerland', 'Portugal', 'Austria',
    'Sweden', 'Norway', 'Denmark', 'Finland', 'Poland', 'Czech Republic',
  ],
  americas: [
    'Canada', 'USA', 'Brazil', 'Mexico', 'Argentina',
    'Colombia', 'Chile', 'Peru', 'Costa Rica',
  ],
  oceania: ['Australia', 'New Zealand'],
  asia:    ['Japan', 'South Korea', 'Singapore', 'Malaysia', 'UAE', 'Turkey'],
};

// ─── LOAN RULES ──────────────────────────────────────────────
const LOAN_RULES = {
  // Age above this — Canada and USA only
  ageLimit:             32,

  // Undergraduate/vocational loans — Canada only
  undergradCountry:     'Canada',
  undergradDuration:    '1 year',
  undergradClientPays:  '30%',
  undergradLoanCovers:  '70%',
  maxStudyGapYears:     5,

  // Masters loan destinations
  mastersDestinations: [
    'Canada', 'UK', 'Germany', 'France',
    'Spain', 'Italy', 'Belgium', 'Switzerland',
  ],

  // Eligible and ineligible programs
  eligiblePrograms:   ['MSc', 'MBA', 'MEng', 'MTech', 'MPH', 'Diploma', 'PGD'],
  ineligiblePrograms: ['MRes', 'PhD'],

  // Canada Masters loan fees
  canadaFees: {
    application:  'CAD 50',
    afterAdmission: 'CAD 50',
    afterApproval:  'CAD 250',
  },

  // Europe/UK Masters loan fees
  europeFees: {
    creditCheck:  '£50',
    processing:   '£250',
    approval:     '£500',
  },

  // Loan financial terms
  interestRate: '9.54% – 17% per annum',
  repayment:    '5–20 years, starts 6 months after graduation',
  earlyRepay:   'No penalty for early repayment',

  // Loan partners
  partners: ['Prodigy Finance', 'MPOWER', 'Passage Loan', 'ApplyBoard Financing'],
};

// ─── MESSAGES ───────────────────────────────────────────────
const MESSAGES = {

  // Natural opener — rotates to feel fresh, opens conversation
  // No service dump, no emoji overload, no corporate intro
  greeting: (name = '') => {
    const n = name && name !== 'there' ? ` ${name}` : '';
    const openers = [
      `Hey${n}, welcome.\n\nWhat's on your mind — studying abroad, relocating, visa, test prep, or something else entirely?`,
      `Hey${n}. Good to have you here.\n\nWhat are you trying to figure out today?`,
      `Hi${n}.\n\nAre you thinking about studying abroad, a visa, relocating, or something specific you need help sorting out?`,
      `Hey${n}.\n\nPeople come here for all kinds of things — studying abroad, visa processing, test prep, loans, travel. What's your situation?`,
      `Hey${n}, welcome to ApplyBoard Africa.\n\nWhat's the plan — are you trying to study abroad, sort a visa, prepare for a test, or something else?`,
    ];
    return openers[Math.floor(Math.random() * openers.length)];
  },

  fallback:
    `Something went wrong on my end. Give me a moment and try again, or reach us directly on ${'+234 706 345 9820'}`,

  rateLimit:
    `You are sending messages quite fast. Give me a second to catch up.`,

  bankTransfer: () =>
    `Bank details:\n\nBank: ${BANK.bankName}\nAccount Name: ${BANK.accountName}\nAccount Number: ${BANK.accountNo}\n\nAfter sending, type "I have paid" with your receipt and we confirm within the hour.\n\nUse your phone number as the payment description.`,

  paymentConfirmed: (amount, ref) =>
    `Payment confirmed.\n\nAmount: ₦${Number(amount).toLocaleString('en-NG')}\nReference: ${ref}\n\nYou are in the system. Someone from our team will be in touch shortly.`,

  escalation:
    `Understood. Flagging this for a senior team member right now.\n\nThey will reach out to you directly — usually within 30 minutes during business hours.\n\nAnything else you want me to note before they call?`,

  sessionExpired:
    `Hey, welcome back.\n\nWhat are you working on today?`,

  registrationPrompt: (name = '') => {
    const n = name ? `, ${name}` : '';
    return `Alright${n}, I have a clear picture of your situation.\n\nTo move this forward properly and get you matched with the right specialist on our team, there is a one-time registration fee of ₦10,000.\n\nThis gets you into the system and on the priority list — the team will be fully briefed on your case before they reach out.\n\nReady to proceed?`;
  },
};

// ─── BUTTON / LIST IDs ──────────────────────────────────────
const BTN = {
  // Navigation
  MENU_MAIN:    'MENU_MAIN',
  MENU_EXPLORE: 'MENU_EXPLORE',
  MENU_CONSULT: 'MENU_CONSULT',
  BACK:         'BACK',

  // Services
  SVC_STUDY:   'SVC_STUDY',
  SVC_VISA:    'SVC_VISA',
  SVC_LOAN:    'SVC_LOAN',
  SVC_TEST:    'SVC_TEST',
  SVC_TRAVEL:  'SVC_TRAVEL',
  SVC_INSURE:  'SVC_INSURE',
  SVC_HAJJ:    'SVC_HAJJ',
  SVC_POF:     'SVC_POF',
  SVC_CONSULT: 'SVC_CONSULT',

  // Study abroad destinations
  SA_CANADA:  'SA_CANADA',
  SA_UK:      'SA_UK',
  SA_USA:     'SA_USA',
  SA_GERMANY: 'SA_GERMANY',
  SA_AUS:     'SA_AUS',
  SA_IRELAND: 'SA_IRELAND',
  SA_NZ:      'SA_NZ',
  SA_BRAZIL:  'SA_BRAZIL',
  SA_OTHER:   'SA_OTHER',

  // Program levels
  SL_UG:      'SL_UG',
  SL_PG:      'SL_PG',
  SL_DIPLOMA: 'SL_DIPLOMA',

  // Timelines
  ST_NOW:   'ST_NOW',
  ST_MID:   'ST_MID',
  ST_LATER: 'ST_LATER',

  // Visa types
  VT_STUDY:    'VT_STUDY',
  VT_TOURIST:  'VT_TOURIST',
  VT_BUSINESS: 'VT_BUSINESS',
  VT_WORK:     'VT_WORK',
  VT_FAMILY:   'VT_FAMILY',

  // Test prep
  TP_IELTS:    'TP_IELTS',
  TP_TOEFL:    'TP_TOEFL',
  TP_GRE:      'TP_GRE',
  TP_GMAT:     'TP_GMAT',
  TP_SAT:      'TP_SAT',
  TP_PTE:      'TP_PTE',
  TP_DUOLINGO: 'TP_DUOLINGO',
  TP_GERMAN:   'TP_GERMAN',
  TP_FRENCH:   'TP_FRENCH',
  TP_JAPANESE: 'TP_JAPANESE',

  // Batches
  BATCH_MORNING:   'BATCH_MORNING',
  BATCH_EVENING:   'BATCH_EVENING',
  BATCH_WEEKEND:   'BATCH_WEEKEND',
  BATCH_INTENSIVE: 'BATCH_INTENSIVE',
  BATCH_ONLINE:    'BATCH_ONLINE',

  // Loans
  LOAN_EUR: 'LOAN_EUR',
  LOAN_UK:  'LOAN_UK',
  LOAN_CA:  'LOAN_CA',
  LOAN_SCH: 'LOAN_SCH',

  // Travel
  TV_FLIGHTS:   'TV_FLIGHTS',
  TV_HOTELS:    'TV_HOTELS',
  TV_INSURANCE: 'TV_INSURANCE',

  // Pilgrimage
  PG_HAJJ:  'PG_HAJJ',
  PG_UMRAH: 'PG_UMRAH',
  PG_TOURS: 'PG_TOURS',

  // Consultation times (kept for legacy compatibility)
  CT_MORNING:   'CT_MORNING',
  CT_AFTERNOON: 'CT_AFTERNOON',
  CT_EVENING:   'CT_EVENING',

  // Payment
  PAY_NOW:     'PAY_NOW',
  PAY_INSTALL: 'PAY_INSTALL',

  // Misc
  ESCALATE: 'ESCALATE',
};

// ─── CONVERSATION STAGES ────────────────────────────────────
const STAGES = {
  GREETING:          'GREETING',
  MAIN_MENU:         'MAIN_MENU',
  FREE_TEXT_AI:      'FREE_TEXT_AI',
  STUDY_DESTINATION: 'STUDY_DESTINATION',
  STUDY_LEVEL:       'STUDY_LEVEL',
  STUDY_TIMELINE:    'STUDY_TIMELINE',
  VISA_TYPE:         'VISA_TYPE',
  VISA_DESTINATION:  'VISA_DESTINATION',
  TEST_EXAM_SELECT:  'TEST_EXAM_SELECT',
  TEST_BATCH_SELECT: 'TEST_BATCH_SELECT',
  LOAN_COUNTRY:      'LOAN_COUNTRY',
  TRAVEL_TYPE:       'TRAVEL_TYPE',
  PILGRIMAGE_TYPE:   'PILGRIMAGE_TYPE',
  POF_ADVISORY:      'POF_ADVISORY',
  CONSULT_NAME:      'CONSULT_NAME',
  CONSULT_TIME:      'CONSULT_TIME',
  CONSULT_CONFIRMED: 'CONSULT_CONFIRMED',
  PAYMENT_INVOICE:   'PAYMENT_INVOICE',
  PAYMENT_AWAITING:  'PAYMENT_AWAITING',
  PAYMENT_CONFIRMED: 'PAYMENT_CONFIRMED',
  ESCALATED:         'ESCALATED',
};

// ─── REDIS KEYS ──────────────────────────────────────────────
const REDIS_KEYS = {
  state:     (phone) => `state:${phone}`,
  rateLimit: (phone) => `rl:${phone}`,
  msgSeen:   (msgId) => `seen:${msgId}`,
};

// ─── TTLs (seconds) ──────────────────────────────────────────
const TTL = {
  STATE:      60 * 60 * 24, // 24 hours
  RATE_LIMIT: 60,
  MSG_DEDUP:  60,
};

// ─── RATE LIMITS ─────────────────────────────────────────────
const RATE = {
  MAX_MESSAGES_PER_MINUTE: 30,
};

// ─── SERVICE LABELS (CRM display) ────────────────────────────
const SERVICE_LABELS = {
  study_abroad: 'Study Abroad',
  visa:         'Visa Processing',
  test_prep:    'Test Preparation',
  loan:         'Study Loan & Scholarship',
  travel:       'Travel Services',
  insurance:    'Travel Insurance',
  pilgrimage:   'Hajj / Umrah / Tours',
  pof:          'Proof of Funds',
  consultation: 'Consultation',
};

module.exports = {
  COMPANY,
  BANK,
  REGISTRATION_FEE,
  STAFF_ROUTING,
  COUNTRIES,
  LOAN_RULES,
  MESSAGES,
  BTN,
  STAGES,
  REDIS_KEYS,
  TTL,
  RATE,
  SERVICE_LABELS,
};