// Parses a budget string and returns the estimated value in naira
const parseBudgetNaira = (budgetStr) => {
  if (!budgetStr) return 0;
  const s = budgetStr.toLowerCase().replace(/[,\s₦#]/g, '');
  const mMatch = s.match(/(\d+(?:\.\d+)?)(m(?:illion)?)/);
  if (mMatch) return parseFloat(mMatch[1]) * 1_000_000;
  const kMatch = s.match(/(\d+)(k|thousand)/);
  if (kMatch) return parseFloat(kMatch[1]) * 1_000;
  const raw = s.match(/(\d{6,})/);
  if (raw) return parseInt(raw[1]);
  return 0;
};

// Returns { lead_score: 'hot'|'warm'|'cold', completion: 0-100 }
const computeLeadScore = (data) => {
  const DOC_KEYS = ['passport', 'degree', 'transcript', 'cv'];
  const TOTAL_FIELDS = 10;

  const filledFields = [
    data.name,
    data.motivation,
    data.destination_country || data.destination,
    data.service_interested,
    data.program_level,
    data.urgency,
    data.age,
    data.budget_range || data.budget,
    data.work_experience,
    data.passport_status,
  ].filter(Boolean).length;

  const docs       = data.documents_checklist || {};
  const filledDocs = DOC_KEYS.filter(d => docs[d]).length;

  const completion = Math.round(
    (filledFields / TOTAL_FIELDS) * 90 + (filledDocs / DOC_KEYS.length) * 10
  );

  const urgencyHot  = /asap|immediately|urgent|right now|few months|this year/.test(
    (data.urgency || '').toLowerCase()
  );
  const hasPassport = data.passport_status === 'has';
  const budget      = parseBudgetNaira(data.budget_range || data.budget || '');
  const budgetHigh  = budget >= 2_000_000;

  let lead_score = 'cold';

  if (urgencyHot && hasPassport && budgetHigh) {
    lead_score = 'hot';
  } else if (
    (data.motivation || data.service_interested || data.destination_country) &&
    DOC_KEYS.some(d => docs[d])
  ) {
    lead_score = 'warm';
  } else if (data.motivation || data.urgency || data.destination_country || data.service_interested) {
    lead_score = 'warm';
  }

  return { lead_score, completion };
};

module.exports = { computeLeadScore };
