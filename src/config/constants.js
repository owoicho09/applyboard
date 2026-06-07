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
  calendly:    'https://calendly.com/applyboardafrica-info/new-meeting',
};

// ─── REGISTRATION FEE ────────────────────────────────────────
// Charged for Study Abroad, Visa, Loans, Travel, Pilgrimage
// NOT charged for Test Prep — they pay class fee directly
const REGISTRATION_FEE = 10000; // ₦10,000

// ─── CONVERSION RATES (NGN per 1 unit of foreign currency) ──
const CONVERSION_RATES = {
  CAD: 1000,
  USD: 1400,
  AUD:  800,
  NZD:  828,
  GBP: 1863,
};

// ─── PRICES ─────────────────────────────────────────────────
// Single source of truth — update here, never in prompt text
const PRICES = {
  testPrep: {
    IELTS:    { naira:  85000, weeks:  6 },
    TOEFL:    { naira:  75000, weeks:  4 },
    PTE:      { naira:  70000, weeks:  4 },
    DUOLINGO: { naira:  45000, weeks:  2 },
    GRE:      { naira:  90000, weeks:  6 },
    GMAT:     { naira:  95000, weeks:  6 },
    SAT:      { naira:  80000, weeks:  8 },
    GERMAN:   { naira: 120000, weeks: 12 },
    FRENCH:   { naira: 100000, weeks: 10 },
    JAPANESE: { naira: 110000, weeks: 12 },
  },
  officialExams: {
    IELTS_ACADEMIC:  { usd: 200, naira: 299000 },
    IELTS_UKVI:      { usd: 211, naira: 315500 },
    GRE:             { usd: 220, nairaMin: 270000, nairaMax: 380000 },
    TOEFL:           { usd: 170, nairaMin: 220000, nairaMax: 240000 },
    DUOLINGO_SINGLE: { usd:  70, naira: 105000 },
    DUOLINGO_BUNDLE: { usd: 118, naira: 177000 },
    PTE:             { usd: 150, nairaMin:  80000, nairaMax: 250000 },
  },
  membership: {
    card: 140000,
  },
  coachingClass: {
    nonMember: 50000,
  },
  workRoute: {
    level1: { min:  1500, max:  3500, currency: 'USD' },
    level2: { min:  3000, max:  6000, currency: 'EUR' },
    level3: { min:  5000, max: 12000, currency: 'EUR' },
    level4: { min: 10000,             currency: 'USD' },
  },
  loanFees: {
    europe: { creditCheck: 50, processing: 250, approval: 500 },
    canada: { application: 50, afterAdmission: 50, afterApproval: 250 },
  },
};

// ─── EXAM AMOUNTS (derived — single source of truth is PRICES.testPrep) ────
const EXAM_AMOUNTS = Object.fromEntries(
  Object.entries(PRICES.testPrep).map(([k, v]) => [k.toLowerCase(), v.naira])
);

// ─── STAFF MEMBERS (CRM assignment + WhatsApp notifications) ─
const STAFF_MEMBERS = [
  { name: 'Gift',    phone: '2349061371251' },
  { name: 'Tomiwa', phone: '2347082502913' },
  { name: 'Hermine', phone: '2348103788950' },
  { name: 'Paulain', phone: '2347042520259' },
];

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
  REGISTRATION_FEE,
  CONVERSION_RATES,
  PRICES,
  EXAM_AMOUNTS,
  STAFF_MEMBERS,
  STAFF_ROUTING,
  LOAN_RULES,
  SERVICE_LABELS,
};
