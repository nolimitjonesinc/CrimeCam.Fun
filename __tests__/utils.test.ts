import { describe, it, expect } from 'vitest';
import { generateCaseNumber, formatReport, formatShortReport } from '../lib/utils';

// Basic tests to ensure no regressions in utilities.

describe('generateCaseNumber', () => {
  it('returns a string like YYYYMMDD-HHMM', () => {
    const s = generateCaseNumber();
    expect(/^[0-9]{8}-[0-9]{4}$/.test(s)).toBe(true);
  });
});

describe('formatReport', () => {
  it('includes required sections and case number', () => {
    const txt = formatReport('20250101-1234', '• Exhibit A: Test', 'Notes here.');
    expect(txt).toContain('CASE #20250101-1234');
    expect(txt).toContain('EVIDENCE LOG');
    expect(txt).toContain('DETECTIVE NOTES');
  });
});

describe('formatShortReport', () => {
  it('includes case number and stays under or equal to 260 chars', () => {
    const longNotes = 'This is a very long sentence designed to test the 260-character limit for short social captions. It keeps going because suspects never stop talking, do they? Anyway, this should still be short.';
    const s = formatShortReport('20250101-1234', '• Exhibit A: Test', longNotes, 260);
    expect(s).toMatch(/CASE #20250101-1234/);
    expect(s.length).toBeLessThanOrEqual(260);
  });
});