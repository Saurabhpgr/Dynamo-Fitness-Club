// ============================================================================
// Money Utilities — No floats allowed for money operations
// Uses string-based decimal math via Decimal.js
// Display uses Indian numbering system via Intl.NumberFormat
// ============================================================================
import Decimal from 'decimal.js';

// Configure Decimal.js for financial precision
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

/**
 * Parse a money string into a Decimal. Returns Decimal(0) for empty/invalid input.
 */
export function parseMoney(value: string | number | null | undefined): Decimal {
  if (value === null || value === undefined || value === '') return new Decimal(0);
  try {
    // Remove commas from formatted strings like "1,00,000.00"
    const cleaned = String(value).replace(/,/g, '');
    return new Decimal(cleaned);
  } catch {
    return new Decimal(0);
  }
}

/**
 * Format money as Indian Rupees string: ₹1,50,000.00
 */
export function formatMoney(value: string | number | Decimal): string {
  const num = value instanceof Decimal ? value.toNumber() : parseMoney(String(value)).toNumber();
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

export const formatCurrency = formatMoney;

/**
 * Format money without currency symbol: 1,50,000.00
 */
export function formatMoneyPlain(value: string | number | Decimal): string {
  const num = value instanceof Decimal ? value.toNumber() : parseMoney(String(value)).toNumber();
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Calculate balance due: amount_charged - discount - amount_received
 */
export function calculateBalance(
  amountCharged: string,
  discount: string,
  amountReceived: string
): Decimal {
  const charged = parseMoney(amountCharged);
  const disc = parseMoney(discount);
  const received = parseMoney(amountReceived);
  return charged.minus(disc).minus(received);
}

/**
 * Determine payment status from balance
 */
export function derivePaymentStatus(
  amountCharged: string,
  discount: string,
  amountReceived: string
): 'paid' | 'partial' | 'pending' {
  const received = parseMoney(amountReceived);
  if (received.isZero()) return 'pending';
  const balance = calculateBalance(amountCharged, discount, amountReceived);
  if (balance.lte(0)) return 'paid';
  return 'partial';
}

/**
 * Convert money to Decimal string for DB storage (2 decimal places)
 */
export function toDbMoney(value: string | number | Decimal): string {
  const dec = value instanceof Decimal ? value : parseMoney(String(value));
  return dec.toFixed(2);
}
