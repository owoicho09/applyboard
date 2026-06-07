const {
  formatCurrency,
  getFirstName,
  generateReference,
  truncateText,
  safeJsonParse,
  isNonEmptyString,
  formatDate,
} = require('../../src/utils/helpers');

describe('formatCurrency', () => {
  test('formats a round number', () => {
    expect(formatCurrency(10000)).toBe('₦10,000');
  });

  test('formats zero', () => {
    expect(formatCurrency(0)).toBe('₦0');
  });

  test('returns ₦0 for NaN input', () => {
    expect(formatCurrency('abc')).toBe('₦0');
  });

  test('formats large amount', () => {
    expect(formatCurrency(85000)).toBe('₦85,000');
  });

  test('handles string number input', () => {
    expect(formatCurrency('50000')).toBe('₦50,000');
  });
});

describe('getFirstName', () => {
  test('extracts first name from full name', () => {
    expect(getFirstName('Chidi Okeke')).toBe('Chidi');
  });

  test('returns single name unchanged', () => {
    expect(getFirstName('Amara')).toBe('Amara');
  });

  test('returns "there" for null', () => {
    expect(getFirstName(null)).toBe('there');
  });

  test('returns "there" for empty string', () => {
    expect(getFirstName('')).toBe('there');
  });

  test('trims leading whitespace before splitting', () => {
    expect(getFirstName('  Tobi Adeyemi')).toBe('Tobi');
  });
});

describe('generateReference', () => {
  test('starts with APB-', () => {
    expect(generateReference()).toMatch(/^APB-/);
  });

  test('generates unique references each time', () => {
    const ref1 = generateReference();
    const ref2 = generateReference();
    expect(ref1).not.toBe(ref2);
  });

  test('has correct format APB-timestamp-random', () => {
    expect(generateReference()).toMatch(/^APB-\d+-[A-Z0-9]+$/);
  });
});

describe('truncateText', () => {
  test('returns text unchanged when within limit', () => {
    expect(truncateText('hello', 10)).toBe('hello');
  });

  test('truncates text exceeding limit', () => {
    const out = truncateText('hello world', 8);
    expect(out).toBe('hello...');
    expect(out.length).toBe(8);
  });

  test('returns empty string for null', () => {
    expect(truncateText(null)).toBe('');
  });

  test('uses default limit of 100', () => {
    const long = 'a'.repeat(150);
    expect(truncateText(long).length).toBe(100);
    expect(truncateText(long)).toMatch(/\.\.\.$/);
  });
});

describe('safeJsonParse', () => {
  test('parses valid JSON object', () => {
    expect(safeJsonParse('{"key":"value"}')).toEqual({ key: 'value' });
  });

  test('parses valid JSON array', () => {
    expect(safeJsonParse('[1,2,3]')).toEqual([1, 2, 3]);
  });

  test('returns null for invalid JSON', () => {
    expect(safeJsonParse('{bad json')).toBeNull();
  });

  test('returns null for empty string', () => {
    expect(safeJsonParse('')).toBeNull();
  });

  test('returns null for undefined', () => {
    expect(safeJsonParse(undefined)).toBeNull();
  });
});

describe('isNonEmptyString', () => {
  test('returns true for non-empty string', () => {
    expect(isNonEmptyString('hello')).toBe(true);
  });

  test('returns false for empty string', () => {
    expect(isNonEmptyString('')).toBe(false);
  });

  test('returns false for whitespace-only string', () => {
    expect(isNonEmptyString('   ')).toBe(false);
  });

  test('returns false for number', () => {
    expect(isNonEmptyString(42)).toBe(false);
  });

  test('returns false for null', () => {
    expect(isNonEmptyString(null)).toBe(false);
  });
});

describe('formatDate', () => {
  test('formats valid ISO date string', () => {
    const out = formatDate('2024-05-01T10:00:00Z');
    expect(typeof out).toBe('string');
    expect(out.length).toBeGreaterThan(0);
    expect(out).toMatch(/2024/);
  });

  test('returns input unchanged for invalid date', () => {
    const bad = 'not-a-date';
    expect(formatDate(bad)).toBe(bad);
  });
});
