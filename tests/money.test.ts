// ============================================================================
// Unit Tests — Money calculations & formatting
// ============================================================================
import { describe, it, expect } from 'vitest';
import { parseMoney, formatMoney, formatCurrency, calculateBalance } from '../src/lib/money';

describe('Money Utilities', () => {
  it('parses formatted strings with commas correctly without float errors', () => {
    expect(parseMoney('1,50,000.50').toString()).toBe('150000.5');
    expect(parseMoney('1500').toString()).toBe('1500');
    expect(parseMoney('').toString()).toBe('0');
  });

  it('calculates balance due accurately', () => {
    // 1500 charged, 200 discount, 1000 received => 300 due
    const bal1 = calculateBalance('1500', '200', '1000');
    expect(bal1.toString()).toBe('300');

    // 13500 charged, 500 discount, 13000 received => 0 due
    const bal2 = calculateBalance('13500', '500', '13000');
    expect(bal2.toString()).toBe('0');
  });

  it('formats currency with Indian rupee formatting', () => {
    const formatted = formatCurrency('1500.00');
    expect(formatted).toContain('1,500.00');
  });
});
