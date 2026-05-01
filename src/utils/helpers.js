const crypto = require('crypto');
const uuidv4 = () => crypto.randomUUID();

/**
 * Format a number as Nigerian Naira
 * e.g. 50000 → ₦50,000
 */
const formatCurrency = (amount) => {
  const num = Number(amount);
  if (isNaN(num)) return '₦0';
  return `₦${num.toLocaleString('en-NG')}`;
};

/**
 * Extract first name from full name
 * "John Doe" → "John"
 */
const getFirstName = (fullName) => {
  if (!fullName || typeof fullName !== 'string') return 'there';
  return fullName.trim().split(/\s+/)[0] || 'there';
};

/**
 * Generate a unique payment reference
 * e.g. APB-1714500000000-A3F2B1
 */
const generateReference = () => {
  const ts   = Date.now();
  const rand = Math.random().toString(36).toUpperCase().slice(2, 8);
  return `APB-${ts}-${rand}`;
};

/**
 * Pause execution for ms milliseconds
 * Used for rate-limiting broadcast sends (1 msg/sec)
 */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Truncate text to maxLength, appending '...' if cut
 */
const truncateText = (text, maxLength = 100) => {
  if (!text || typeof text !== 'string') return '';
  return text.length <= maxLength ? text : text.slice(0, maxLength - 3) + '...';
};

/**
 * Safely parse JSON — returns null instead of throwing
 */
const safeJsonParse = (str) => {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
};

/**
 * Check if a value is a non-empty string
 */
const isNonEmptyString = (val) => typeof val === 'string' && val.trim().length > 0;

/**
 * Format a date for display in WhatsApp messages
 * e.g. 2024-05-01T10:00:00Z → "1 May 2024, 10:00 WAT"
 */
const formatDate = (isoString) => {
  try {
    return new Date(isoString).toLocaleString('en-NG', {
      timeZone:    'Africa/Lagos',
      day:         'numeric',
      month:       'long',
      year:        'numeric',
      hour:        '2-digit',
      minute:      '2-digit',
    });
  } catch {
    return isoString;
  }
};

module.exports = {
  formatCurrency,
  getFirstName,
  generateReference,
  delay,
  truncateText,
  safeJsonParse,
  isNonEmptyString,
  formatDate,
};