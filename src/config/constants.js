// ═══════════════════════════════════════════════════════════
// APPLYBOARD AFRICA — CENTRAL CONTENT & CONFIGURATION FILE
// All bot copy lives here. Edit content here, never in flows.
// ═══════════════════════════════════════════════════════════

const COMPANY = {
  name:        'ApplyBoard Africa',
  tagline:     'Education for All – Your Gateway to Global Opportunities',
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
  bankName:    'GTBank',               // UPDATE before going live
  accountName: 'ApplyBoard Africa Ltd',
  accountNo:   'XXXXXXXXXX',           // UPDATE before going live
};

// ─── MESSAGES ───────────────────────────────────────────────

const MESSAGES = {
  greeting: (name = 'there') =>
    `🌍 *Welcome to ApplyBoard Africa!*\n\nHello ${name}! 👋\n\nWe are your trusted partner for:\n✅ Study Abroad & Visa Processing\n✅ Test Prep (IELTS, TOEFL, GRE & more)\n✅ Flights, Hotels & Travel Insurance\n✅ Hajj, Umrah & Tour Packages\n✅ Study Loans & Scholarships\n\n📊 *Trusted by ${COMPANY.clients} clients | ${COMPANY.successRate} Visa Success Rate | ${COMPANY.experience} Years Experience*\n\nHow can we help you today?`,

  mainMenuHeader:
    `🏆 *ApplyBoard Africa — Main Menu*\n\n${COMPANY.experience} Years | ${COMPANY.clients} Clients | ${COMPANY.countries} Countries\n\nSelect a service to get started:`,

  consultationPush:
    `📞 *Let's Book Your FREE Consultation*\n\nOur senior counselors have helped ${COMPANY.clients} clients achieve their dreams.\n\n✅ 100% Free — No obligations\n✅ Personalised advice for your profile\n✅ Same-day response\n\nWhat is your *full name* please?`,

  consultationConfirmed: (name, time, service) =>
    `✅ *Consultation Booked Successfully!*\n\n👤 Name: ${name}\n🕐 Preferred Time: ${time}\n📋 Topic: ${service || 'General Enquiry'}\n\nOur counselor will call you at this WhatsApp number.\n\n⏰ *Response time: Within 2 hours during business hours (8am–8pm WAT)*\n\nThank you for choosing ApplyBoard Africa! 🌍`,

  escalation:
    `👤 *Connecting You to a Senior Counselor*\n\nI've noted your request and alerted our team.\n\nA senior counselor will reach out to you shortly at this number.\n\n⏰ *Response time: Within 30 minutes (8am–8pm WAT)*\n\nFor urgent matters:\n📞 ${COMPANY.phone}\n📧 ${COMPANY.email}`,

  paymentConfirmed: (amount, ref) =>
    `🎉 *Payment Confirmed!*\n\nAmount: ₦${Number(amount).toLocaleString('en-NG')}\nReference: *${ref}*\n\nYour application is now *active*! Our team will contact you within 24 hours to begin processing.\n\nThank you for choosing ApplyBoard Africa! 🌍`,

  bankTransfer: () =>
    `🏦 *Bank Transfer Details*\n\nBank: ${BANK.bankName}\nAccount Name: *${BANK.accountName}*\nAccount Number: *${BANK.accountNo}*\n\nAfter transfer, please send your receipt/screenshot here.\nOur team confirms within *1 hour* during business hours.\n\n_Reference: Include your WhatsApp number as payment description_`,

  rateLimit:
    `⏳ You're sending messages very quickly. Please wait a moment and try again.`,

  fallback:
    `I'm having a brief technical moment. 😅\n\nPlease type *menu* to see all our services, or reply *agent* to speak with a counselor directly.`,

  sessionExpired:
    `👋 Welcome back to ApplyBoard Africa!\n\nYour previous session has expired. Let's start fresh — how can we help you today?`,
};

// ─── BUTTON / LIST IDs ──────────────────────────────────────
// Single source of truth for all button IDs used in flows and handlers

const BTN = {
  // Main menu
  MENU_MAIN:    'MENU_MAIN',
  MENU_EXPLORE: 'MENU_EXPLORE',
  MENU_CONSULT: 'MENU_CONSULT',

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

  // Study abroad
  SA_CANADA:  'SA_CANADA',
  SA_UK:      'SA_UK',
  SA_USA:     'SA_USA',
  SA_GERMANY: 'SA_GERMANY',
  SA_AUS:     'SA_AUS',
  SA_IRELAND: 'SA_IRELAND',
  SA_NZ:      'SA_NZ',
  SA_OTHER:   'SA_OTHER',

  // Program level
  SL_UG:      'SL_UG',
  SL_PG:      'SL_PG',
  SL_DIPLOMA: 'SL_DIPLOMA',

  // Timeline
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
  PG_HAJJ:   'PG_HAJJ',
  PG_UMRAH:  'PG_UMRAH',
  PG_TOURS:  'PG_TOURS',

  // Consultation times
  CT_MORNING:   'CT_MORNING',
  CT_AFTERNOON: 'CT_AFTERNOON',
  CT_EVENING:   'CT_EVENING',

  // Payment
  PAY_NOW:      'PAY_NOW',
  PAY_BANK:     'PAY_BANK',
  PAY_INSTALL:  'PAY_INSTALL',
  PAY_CONSULT:  'PAY_CONSULT',

  // Misc
  ESCALATE: 'ESCALATE',
  BACK:     'BACK',
};

// ─── CONVERSATION STAGES ────────────────────────────────────

const STAGES = {
  GREETING:            'GREETING',
  MAIN_MENU:           'MAIN_MENU',
  STUDY_DESTINATION:   'STUDY_DESTINATION',
  STUDY_LEVEL:         'STUDY_LEVEL',
  STUDY_TIMELINE:      'STUDY_TIMELINE',
  VISA_TYPE:           'VISA_TYPE',
  VISA_DESTINATION:    'VISA_DESTINATION',
  TEST_EXAM_SELECT:    'TEST_EXAM_SELECT',
  TEST_BATCH_SELECT:   'TEST_BATCH_SELECT',
  LOAN_COUNTRY:        'LOAN_COUNTRY',
  TRAVEL_TYPE:         'TRAVEL_TYPE',
  PILGRIMAGE_TYPE:     'PILGRIMAGE_TYPE',
  POF_ADVISORY:        'POF_ADVISORY',
  CONSULT_NAME:        'CONSULT_NAME',
  CONSULT_TIME:        'CONSULT_TIME',
  CONSULT_CONFIRMED:   'CONSULT_CONFIRMED',
  PAYMENT_INVOICE:     'PAYMENT_INVOICE',
  PAYMENT_AWAITING:    'PAYMENT_AWAITING',
  PAYMENT_CONFIRMED:   'PAYMENT_CONFIRMED',
  ESCALATED:           'ESCALATED',
  FREE_TEXT_AI:        'FREE_TEXT_AI',
};

// ─── REDIS KEY PREFIXES ─────────────────────────────────────

const REDIS_KEYS = {
  state:     (phone) => `state:${phone}`,
  rateLimit: (phone) => `rl:${phone}`,
  msgSeen:   (msgId) => `seen:${msgId}`,
};

// ─── TTLs (seconds) ─────────────────────────────────────────

const TTL = {
  STATE:      60 * 60 * 24,  // 24 hours — conversation session
  RATE_LIMIT: 60,             // 1 minute window for rate limiting
  MSG_DEDUP:  60,             // 60s deduplication window
};

// ─── RATE LIMITS ────────────────────────────────────────────

const RATE = {
  MAX_MESSAGES_PER_MINUTE: 30,
};

// ─── SERVICE LABELS (for CRM display) ───────────────────────

const SERVICE_LABELS = {
  study_abroad: 'Study Abroad',
  visa:         'Visa Processing',
  test_prep:    'Test Preparation',
  loan:         'Study Loan & Scholarship',
  travel:       'Travel Services',
  insurance:    'Travel Insurance',
  pilgrimage:   'Hajj / Umrah / Tours',
  pof:          'Proof of Funds',
  consultation: 'Free Consultation',
};

module.exports = {
  COMPANY,
  BANK,
  MESSAGES,
  BTN,
  STAGES,
  REDIS_KEYS,
  TTL,
  RATE,
  SERVICE_LABELS,
};