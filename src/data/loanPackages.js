const loanPackages = {
  EUROPE: {
    title:    '🇪🇺 Study in Europe with a Study Loan',
    countries: 'Germany 🇩🇪 | France 🇫🇷 | Spain 🇪🇸 | Italy 🇮🇹 | Belgium 🇧🇪 | Switzerland 🇨🇭',
    benefits: [
      'Admission into accredited universities',
      'Tuition loan funding',
      'Visa support documentation',
      'End-to-end guidance',
    ],
    loanDetails: {
      covers:      'Tuition fees (Germany covers Blocked Account — tuition + living)',
      interestRate: '9.54% – 17% per annum',
      repayment:   '5–20 years (starts 6 months after graduation)',
      earlyRepay:  'No penalty for early repayment',
    },
    process: [
      { step: 1, label: 'Credit & Eligibility Check', fee: '£50'  },
      { step: 2, label: 'Admission & Loan Processing', fee: '£250' },
      { step: 3, label: 'Loan Approval + Service Charge', fee: '£500' },
      { step: 4, label: 'Visa Stage', fee: 'Applicant pays visa fees' },
    ],
    eligiblePrograms: 'MSc, MBA, MEng, MTech, MPH',
    notSupported:    'MRes',
    trigger:         'Europe Loan',
  },

  UK: {
    title:    '🇬🇧 Study in the UK with a Study Loan (Masters)',
    benefits: [
      'Admission into accredited UK universities',
      'Tuition loan funding',
      'Visa support letter',
      'Full application guidance',
    ],
    loanDetails: {
      covers:      'Tuition fees only',
      interestRate: '9.54% – 17% per annum',
      repayment:   '5–20 years (starts 6 months after graduation)',
    },
    process: [
      { step: 1, label: 'Credit & Eligibility Check',    fee: '£50'  },
      { step: 2, label: 'Admission & Loan Processing',   fee: '£250' },
      { step: 3, label: 'Loan Approval Service Charge',  fee: '£500' },
      { step: 4, label: 'Visa Stage', fee: 'Applicant handles visa fees' },
    ],
    eligiblePrograms: 'MSc, MBA, MEng, MTech, MPH',
    trigger:          'UK Loan',
  },

  CANADA: {
    title:    '🇨🇦 Study in Canada with Flexible Study Loan Options',
    options: [
      {
        label:     'Option 1 — Vocational Program Loan (Fast Track)',
        bestFor:   'Diploma / PGD',
        structure: 'Pay 30% → Loan covers 70%',
        fields:    'Engineering, Healthcare, Hospitality, Business, etc.',
        note:      'Study gap must not exceed 5 years',
      },
      {
        label:   'Option 2 — Standard Study Loan (Masters & PGD)',
        powered: 'MPOWER & ApplyBoard Financing',
      },
    ],
    process: [
      { step: 1, label: 'Application & Loan Processing', fee: '50 CAD'  },
      { step: 2, label: 'After Admission',               fee: '50 CAD'  },
      { step: 3, label: 'After Approval',                fee: '250 CAD' },
    ],
    trigger: 'Canada Loan',
  },
};

/**
 * Format a loan package as a WhatsApp-ready message string
 */
const formatLoanMessage = (key) => {
  const pkg = loanPackages[key];
  if (!pkg) return null;

  if (key === 'EUROPE') {
    const steps = pkg.process.map(p => `${p.step}️⃣ ${p.label} — ${p.fee}`).join('\n');
    const benefits = pkg.benefits.map(b => `✔ ${b}`).join('\n');
    return `${pkg.title}\n\n*Countries Covered:*\n${pkg.countries}\n\n*What You Get:*\n${benefits}\n\n*Loan Details:*\n• Interest Rate: ${pkg.loanDetails.interestRate}\n• Repayment: ${pkg.loanDetails.repayment}\n• ${pkg.loanDetails.earlyRepay}\n\n*Step-by-Step Process:*\n${steps}\n\n*Eligible Programs:* ${pkg.eligiblePrograms}\n*Not Supported:* ${pkg.notSupported}\n\n⚡ *Limited funding slots — serious applicants only*`;
  }

  if (key === 'UK') {
    const steps = pkg.process.map(p => `${p.step}️⃣ ${p.label} — ${p.fee}`).join('\n');
    const benefits = pkg.benefits.map(b => `✔ ${b}`).join('\n');
    return `${pkg.title}\n\n*What You Get:*\n${benefits}\n\n*Loan Details:*\n• Interest Rate: ${pkg.loanDetails.interestRate}\n• Repayment: ${pkg.loanDetails.repayment}\n\n*Process:*\n${steps}\n\n*Eligible Programs:* ${pkg.eligiblePrograms}\n\n⚡ *Limited slots available — apply now*`;
  }

  if (key === 'CANADA') {
    const steps = pkg.process.map(p => `${p.step}️⃣ ${p.label} — ${p.fee}`).join('\n');
    const opt1 = pkg.options[0];
    return `${pkg.title}\n\n*${opt1.label}*\nBest for: ${opt1.bestFor}\n${opt1.structure}\nFields: ${opt1.fields}\n_${opt1.note}_\n\n*${pkg.options[1].label}*\nPowered by ${pkg.options[1].powered}\n\n*Process & Fees:*\n${steps}\n\n⚡ *Limited slots — serious applicants only*`;
  }

  return null;
};

module.exports = { loanPackages, formatLoanMessage };