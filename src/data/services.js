const services = {
  study_abroad: {
    title:       '📚 Study Abroad',
    description: 'Undergraduate, Postgraduate, and Diploma programs worldwide.',
    countries:   ['Canada', 'UK', 'USA', 'Germany', 'Australia', 'Ireland', 'New Zealand'],
    keyPoints: [
      'University selection matched to your profile',
      'Full application management',
      'Student visa processing',
      'Pre-departure orientation',
    ],
  },
  visa: {
    title:       '🛂 Visa Processing',
    description: 'All visa categories processed with 95%+ success rate.',
    types:       ['Study', 'Tourist/Visit', 'Business', 'Work', 'Family Reunion'],
    keyPoints: [
      'Document checklist tailored to your destination',
      'Application review before submission',
      'Embassy appointment booking',
      'Biometrics scheduling support',
    ],
  },
  test_prep: {
    title:       '📝 Test Preparation & Language Classes',
    description: 'IELTS, TOEFL, GRE, GMAT, SAT, PTE, Duolingo + German, French, Japanese.',
    keyPoints: [
      'Expert tutors with proven track records',
      'Mock tests and score improvement guarantee',
      'Morning, Evening, Weekend, and Online batches',
      'Study materials included',
    ],
  },
  loan: {
    title:       '💰 Study Loan & Scholarship',
    description: 'Tuition loans for Europe, UK, and Canada. Partial scholarships available.',
    partners:    ['Prodigy Finance', 'MPOWER', 'Passage Loan', 'ApplyBoard Financing'],
    keyPoints: [
      'Loans covering 80–100% of tuition fees',
      'Interest rate: 9.54% – 17% per annum',
      'Repayment starts 6 months after graduation',
      'No penalty for early repayment',
    ],
  },
  travel: {
    title:       '✈️ Flights & Hotels',
    description: 'Cheap flights and hotel reservations to any destination worldwide.',
    keyPoints: [
      'Best fares from Nigerian departure airports',
      'Group bookings available',
      'Hotel reservations for visa interview trips',
      'Flexible rebooking options',
    ],
  },
  insurance: {
    title:       '🛡️ Travel & Health Insurance',
    description: 'Comprehensive coverage for international travel and student health.',
    keyPoints: [
      'Accepted by Schengen embassies',
      'Student health insurance for all countries',
      'Emergency medical evacuation coverage',
      'Instant policy issuance',
    ],
  },
  pilgrimage: {
    title:       '🕋 Hajj, Umrah & Tours',
    description: 'Spiritual journeys and leisure tour packages worldwide.',
    destinations: ['Saudi Arabia (Hajj & Umrah)', 'Dubai', 'Turkey', 'Europe'],
    keyPoints: [
      'All-inclusive Hajj and Umrah packages',
      'Group and private tour options',
      'Visa, flights, and accommodation bundled',
      'Experienced tour coordinators',
    ],
  },
  pof: {
    title:       '💵 Proof of Funds',
    description: 'Bank letter advisory and PoF preparation for visa applications.',
    keyPoints: [
      'Guidance on required PoF amounts per country',
      'Bank letter templates accepted by embassies',
      'Blocked account setup for Germany',
      'Sponsorship letter templates',
    ],
  },
};

const getService    = (key)  => services[key] || null;
const getAllServices = ()     => services;

module.exports = { services, getService, getAllServices };