// Price ranges for bot responses.
// These are estimates only — actual invoices come from payment flow.
// Update these whenever pricing changes. All amounts in Naira (₦).

const pricing = {
  study_abroad: {
    label:   'Study Abroad Package',
    range:   '₦150,000 – ₦450,000',
    note:    'Depends on destination and program level',
    popular: 'Canada Full Package: ₦350,000',
  },
  visa: {
    label:   'Visa Processing',
    range:   '₦80,000 – ₦200,000',
    note:    'Excludes embassy fees paid directly to consulate',
    popular: 'UK Standard: ₦120,000',
  },
  test_prep: {
    label:   'Test Preparation',
    range:   '₦45,000 – ₦120,000',
    note:    'Depends on exam type and batch',
    popular: 'IELTS Intensive: ₦85,000',
  },
  flights: {
    label:   'Flight Tickets',
    range:   'Market rate — best deals sourced',
    note:    'Price varies by route and travel date',
    popular: 'Lagos to London from ₦850,000',
  },
  insurance: {
    label:   'Travel Insurance',
    range:   '₦15,000 – ₦80,000',
    note:    'Depends on destination and duration',
    popular: 'Schengen 30-day: ₦25,000',
  },
  pilgrimage: {
    label:   'Hajj & Umrah Packages',
    range:   '₦2,500,000 – ₦6,000,000',
    note:    'All-inclusive — varies by package tier',
    popular: 'Umrah Economy: ₦2,500,000',
  },
  pof: {
    label:   'Proof of Funds Advisory',
    range:   '₦30,000 – ₦80,000',
    note:    'Advisory and documentation service',
    popular: 'Standard Advisory: ₦30,000',
  },
};

/**
 * Returns a formatted price info string for the bot to share
 */
const getPriceInfo = (serviceKey) => {
  const p = pricing[serviceKey];
  if (!p) return null;
  return `💰 *${p.label}*\n\nPrice Range: ${p.range}\n_${p.note}_\n\nExample: ${p.popular}\n\n_Final pricing is confirmed during your free consultation._`;
};

module.exports = { pricing, getPriceInfo };