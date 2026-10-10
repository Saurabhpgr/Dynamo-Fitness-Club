// ============================================================================
// Unit Tests — Amount in Words (Indian numbering convention)
// ============================================================================
import { describe, it, expect } from 'vitest';
import { amountInWords } from '../src/lib/amount-in-words';

describe('Amount in Words Utility', () => {
  it('converts round figures in Rupees correctly', () => {
    expect(amountInWords('1500')).toBe('Rupees One Thousand Five Hundred Only');
    expect(amountInWords('4000')).toBe('Rupees Four Thousand Only');
    expect(amountInWords('13500')).toBe('Rupees Thirteen Thousand Five Hundred Only');
  });

  it('handles Lakhs correctly according to Indian numbering', () => {
    expect(amountInWords('100000')).toBe('Rupees One Lakh Only');
    expect(amountInWords('150000')).toBe('Rupees One Lakh Fifty Thousand Only');
  });

  it('converts decimals / paise correctly', () => {
    expect(amountInWords('1500.50')).toBe('Rupees One Thousand Five Hundred and Paise Fifty Only');
    expect(amountInWords('7500.25')).toBe('Rupees Seven Thousand Five Hundred and Paise Twenty Five Only');
  });

  it('handles zero gracefully', () => {
    expect(amountInWords('0')).toBe('Rupees Zero Only');
  });
});
