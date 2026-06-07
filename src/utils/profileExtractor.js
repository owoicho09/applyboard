const { updateLead }          = require('../services/leadService');
const { updateData, getState } = require('./stateManager');
const { computeLeadScore }    = require('./leadScorer');

// Detects which document the AI just asked for — sets awaitingDoc so media handler
// knows how to label the next incoming photo/document.
const detectAwaitingDoc = (aiReply) => {
  const lower = aiReply.toLowerCase();
  const isAsking = /\b(send|share|photo|picture|upload|attach|forward)\b/.test(lower);
  if (!isAsking) return null;
  if (lower.includes('passport')) return 'passport';
  if (lower.includes('transcript')) return 'transcript';
  if (lower.includes('degree') || lower.includes('certificate')) return 'degree';
  if (lower.includes(' cv') || lower.includes('resume') || lower.includes('curriculum')) return 'cv';
  return null;
};

// Extracts structured profile fields from a free-text message.
// Runs in parallel with the AI call — saves to Redis + Supabase silently.
// Also recomputes lead_score and profile_completion_score on every save.
const extractProfileSignals = async (from, text, state) => {
  try {
    const lower   = text.toLowerCase();
    const updates = {};

    // SKIP — user explicitly skipping a field, mark it so the AI knows not to ask again
    if (lower.trim() === 'skip' || lower.trim() === 'skipped') {
      const awaitingDoc = state.data?.awaitingDoc;
      if (awaitingDoc) {
        const existing = state.data?.documents_checklist || {};
        updates.documents_checklist = { ...existing, [awaitingDoc]: 'skipped' };
        updates.awaitingDoc = null;
      }
      if (Object.keys(updates).length > 0) {
        await Promise.all([updateLead(from, updates), updateData(from, updates)]);
      }
      return;
    }

    // Motivation — why they want to move
    const motivationPatterns = [
      /\b(because|want to|trying to|looking to|hope to|dream|opportunity|better|future|child|family|career|job)\b/,
    ];
    if (motivationPatterns.some(p => p.test(lower)) && !state.data?.motivation) {
      // Store the raw message as motivation (keep it human)
      updates.motivation = text.slice(0, 300);
    }

    // Urgency
    if (!state.data?.urgency) {
      if (/\b(asap|immediately|urgent|as soon as|right now|this year|few months)\b/.test(lower)) {
        updates.urgency = 'ASAP';
      } else if (/\b(6 months|six months|before (the )?end of year)\b/.test(lower)) {
        updates.urgency = '6 months';
      } else if (/\b(next year|1 year|one year|12 months)\b/.test(lower)) {
        updates.urgency = '1 year';
      } else if (/\b(just (exploring|looking|checking)|not sure yet|sometime|eventually)\b/.test(lower)) {
        updates.urgency = 'exploring';
      }
    }

    // Passport status
    if (!state.data?.passport_status) {
      if (/\b(have (my |a )?passport|passport is ready|passport done|i got (my )?passport)\b/.test(lower)) {
        updates.passport_status = 'has';
      } else if (/\b(no passport|don.?t have (a |my )?passport|passport expired|applying for passport)\b/.test(lower)) {
        updates.passport_status = 'no';
      } else if (/\b(expired passport|renewing|renewal)\b/.test(lower)) {
        updates.passport_status = 'expired';
      }
    }

    // Work experience
    if (!state.data?.work_experience) {
      const workMatch = lower.match(/(\d+)\s*(?:years?|yrs?)\s*(?:of\s*)?(?:work|experience|working)/);
      if (workMatch) {
        updates.work_experience = `${workMatch[1]} years`;
      } else if (/\b(fresh graduate|nysc|no experience|just graduated|no work)\b/.test(lower)) {
        updates.work_experience = 'fresh graduate';
      } else if (/\b(work(ing|ed)|employed|employment|job|profession)\b/.test(lower)) {
        updates.work_experience = text.slice(0, 100);
      }
    }

    // Budget — look for Naira amounts or descriptive ranges
    if (!state.data?.budget_range && !state.data?.budget) {
      const nairaMatch = lower.match(/[₦#]?\s*(\d[\d,]*)\s*(?:k|thousand|million|m\b)/i);
      if (nairaMatch) {
        updates.budget_range = nairaMatch[0].trim();
      } else if (/\b(no budget|tight budget|can.?t afford|very limited|small budget)\b/.test(lower)) {
        updates.budget_range = 'budget_sensitive';
      } else if (/\b(budget.{0,20}₦|₦.{0,20}budget)\b/.test(lower)) {
        updates.budget_range = text.slice(0, 80);
      }
    }

    // Name — "I am X", "my name is X", "call me X"
    if (!state.data?.name) {
      const nameMatch = text.match(/(?:i(?:'m| am)|my name(?:'s| is)|call me)\s+([A-Z][a-z]{1,20}(?:\s+[A-Z][a-z]{1,20})?)/);
      if (nameMatch) {
        updates.name = nameMatch[1];
      }
    }

    // Program level
    if (!state.data?.program_level) {
      if (/\b(phd|doctorate|doctoral)\b/.test(lower))       updates.program_level = 'PhD';
      else if (/\b(master|msc|mba|postgrad)\b/.test(lower)) updates.program_level = 'Masters';
      else if (/\b(bachelor|bsc|beng|undergraduate|degree)\b/.test(lower)) updates.program_level = 'Bachelors';
      else if (/\b(diploma|certificate|hnd|ond)\b/.test(lower)) updates.program_level = 'Diploma';
    }

    if (Object.keys(updates).length === 0) return;

    // Merge with existing state data to score against the full profile
    const mergedData = { ...(state.data || {}), ...updates };
    const { lead_score, completion } = computeLeadScore(mergedData);
    updates.lead_score               = lead_score;
    updates.profile_completion_score = completion;

    await Promise.all([
      updateLead(from, updates),
      updateData(from, updates),
    ]);
  } catch (err) {
    console.error('[PROFILE EXTRACTOR] Error:', err.message);
  }
};

module.exports = { extractProfileSignals, detectAwaitingDoc };
