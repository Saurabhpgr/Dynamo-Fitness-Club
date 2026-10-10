// ============================================================================
// Unit Tests — Date Utilities
// ============================================================================
import { describe, it, expect } from 'vitest';
import { formatDate, calculateExpiryDate, isExpiringSoon } from '../src/lib/date-utils';

describe('Date Utilities', () => {
  it('formats dates in readable Indian DD MMM YYYY format', () => {
    const formatted = formatDate('2026-10-15');
    expect(formatted).toContain('2026');
    expect(formatted).toContain('Oct');
  });

  it('calculates plan expiration by adding duration days', () => {
    const expiry = calculateExpiryDate('2026-01-01', 30);
    expect(expiry).toBe('2026-01-31');
  });
});
