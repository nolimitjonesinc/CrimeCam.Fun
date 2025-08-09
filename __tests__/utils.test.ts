import { describe, it, expect } from 'vitest';
import { generateCaseNumber } from '../lib/utils';

// Basic tests to ensure no regressions in utilities.

describe('generateCaseNumber', () => {
  it('returns a string like YYYYMMDD-HHMM', () => {
    const s = generateCaseNumber();
    expect(/^[0-9]{8}-[0-9]{4}$/.test(s)).toBe(true);
  });
});