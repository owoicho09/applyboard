/**
 * Validates and sanitizes all user input before
 * it touches the database or gets used in messages.
 */

const isValidPhone = (phone) => {
  if (!phone || typeof phone !== 'string') return false;
  // WhatsApp numbers: digits only, 7–15 chars, may start with +
  return /^\+?[0-9]{7,15}$/.test(phone.trim());
};

const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim().toLowerCase());
};

/**
 * Removes characters that could cause issues in DB writes
 * or be used for injection. Keeps normal text intact.
 */
const sanitizeText = (text) => {
  if (!text || typeof text !== 'string') return '';
  return text
    .trim()
    .replace(/[<>{}[\]\\]/g, '')          // Remove HTML/JSON special chars
    .replace(/(\b)(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|--)\b/gi, '') // SQL keywords
    // Strip prompt-injection patterns — phrases that attempt to override system instructions
    .replace(/\b(INSTRUCTION|SYSTEM|PROMPT|OVERRIDE|IGNORE PREVIOUS|FORGET EVERYTHING|NEW ROLE|YOUR NEW|DISREGARD)(\s*:|\s+ABOVE|\s+INSTRUCTIONS?|\s+RULES?)/gi, '')
    .replace(/\[Known context[^\]]*\]/gi, '')   // Strip fake context injections like [Known context: ...]
    .replace(/\[\[.*?\]\]/g, '')                // Strip double-bracket tags like [[SEND_PAYMENT_LINK]]
    .slice(0, 2000);                            // Cap at 2000 chars
};

/**
 * Sanitize a name — only letters, spaces, hyphens, apostrophes
 */
const sanitizeName = (name) => {
  if (!name || typeof name !== 'string') return '';
  return name
    .trim()
    .replace(/[^a-zA-Z\s'\-\.]/g, '')
    .slice(0, 100);
};

const isWithinLength = (text, max = 500) => {
  return typeof text === 'string' && text.trim().length > 0 && text.length <= max;
};

const isEmpty = (val) => {
  return val === null || val === undefined || String(val).trim() === '';
};

module.exports = {
  isValidPhone,
  isValidEmail,
  sanitizeText,
  sanitizeName,
  isWithinLength,
  isEmpty,
};