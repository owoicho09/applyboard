const { COMPANY }            = require('../config/constants');
const { getRandomTestimonial } = require('../data/testimonials');

/**
 * Company stats block — inject at key conversion points
 */
const statsBlock = () =>
  `📊 *Why Choose ApplyBoard Africa?*\n\n✅ ${COMPANY.experience} Years Experience\n✅ ${COMPANY.clients} Happy Clients\n✅ ${COMPANY.successRate} Visa Success Rate\n✅ ${COMPANY.countries} Countries Served`;

/**
 * How it works — 4-step process
 */
const howItWorks = () =>
  `🔄 *How It Works — 4 Simple Steps*\n\n1️⃣ *Free Consultation* — We assess your profile\n2️⃣ *Document Prep* — We guide every document\n3️⃣ *Application* — We submit on your behalf\n4️⃣ *Success & Travel* — You get your visa and go! ✈️`;

/**
 * Random testimonial + stats combo (use at closing stage)
 */
const socialProof = () =>
  `${getRandomTestimonial()}\n\n${statsBlock()}`;

/**
 * Document checklist by destination country
 */
const documentChecklist = (country) => {
  const checklists = {
    Canada: [
      'Valid international passport (6+ months validity)',
      'IELTS/TOEFL result (band 6.0+ for most programs)',
      'Academic transcripts and certificates',
      'Statement of Purpose (SOP)',
      'Two reference letters',
      'Proof of funds (CAD 10,000+)',
      'Medical examination results',
      'Police clearance certificate',
    ],
    UK: [
      'Valid passport (6+ months validity)',
      'CAS number from your university',
      'IELTS result (band 6.0+)',
      'Academic transcripts',
      'Proof of funds (£1,334/month for up to 9 months)',
      'TB test result (Nigerian applicants)',
      'IHS surcharge payment receipt',
    ],
    Germany: [
      'Valid passport',
      'University admission letter',
      'Blocked account proof (€11,208/year)',
      'Academic transcripts (translated to German or English)',
      'Language certificate (German B2 or English proof)',
      'Motivation letter',
      'Passport photos (biometric)',
      'Health insurance proof',
    ],
    Australia: [
      'Valid passport',
      'CoE (Confirmation of Enrolment) from institution',
      'IELTS result (band 6.0+)',
      'Overseas Student Health Cover (OSHC)',
      'Financial capacity evidence',
      'Genuine Temporary Entrant (GTE) statement',
      'Academic transcripts',
    ],
    default: [
      'Valid international passport (6+ months validity)',
      'Academic transcripts and certificates',
      'Language proficiency certificate (IELTS/TOEFL)',
      'Proof of funds',
      'Acceptance letter from institution',
      'Statement of Purpose',
      'Reference letters (2)',
      'Passport photographs (biometric)',
    ],
  };

  const list = checklists[country] || checklists.default;
  const items = list.map((item, i) => `${i + 1}. ${item}`).join('\n');
  return `📋 *Document Checklist — ${country || 'Study Abroad'}*\n\n${items}\n\n_Our counselors will review your documents before submission._`;
};

/**
 * Payment summary block
 */
const paymentSummary = (service, amount, installmentAvailable = true) =>
  `💼 *Your Package Summary*\n\n📌 Service: ${service}\n💰 Total: ${amount}${installmentAvailable ? ' _(installment available)_' : ''}\n\nWould you like to proceed with payment?`;

/**
 * Contact info block
 */
const contactInfo = () =>
  `📍 *Find Us*\n\n📞 WhatsApp: ${COMPANY.phone}\n📧 Email: ${COMPANY.email}\n🌐 Website: ${COMPANY.website}\n📌 Address: ${COMPANY.address}\n\n🕐 *Business Hours:* Monday – Saturday, 8:00am – 8:00pm WAT`;

module.exports = {
  statsBlock,
  howItWorks,
  socialProof,
  documentChecklist,
  paymentSummary,
  contactInfo,
};