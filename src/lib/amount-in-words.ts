// ============================================================================
// Amount in Words — Indian numbering system
// e.g. 1,50,500.75 → "Rupees One Lakh Fifty Thousand Five Hundred and Paise Seventy Five Only"
// ============================================================================

const ones = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen',
];

const tens = [
  '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety',
];

function twoDigits(n: number): string {
  if (n < 20) return ones[n] ?? '';
  const t = Math.floor(n / 10);
  const o = n % 10;
  return `${tens[t]}${o ? ' ' + ones[o] : ''}`;
}

function threeDigits(n: number): string {
  if (n === 0) return '';
  const h = Math.floor(n / 100);
  const rest = n % 100;
  if (h === 0) return twoDigits(rest);
  return `${ones[h]} Hundred${rest ? ' ' + twoDigits(rest) : ''}`;
}

/**
 * Convert a number to Indian words (supports up to 99,99,99,999)
 */
function numberToIndianWords(num: number): string {
  if (num === 0) return 'Zero';
  if (num < 0) return 'Minus ' + numberToIndianWords(-num);

  const parts: string[] = [];
  
  // Crores (10,000,000+)
  const crores = Math.floor(num / 10000000);
  if (crores > 0) {
    parts.push(`${twoDigits(crores)} Crore`);
  }
  num %= 10000000;

  // Lakhs (100,000+)
  const lakhs = Math.floor(num / 100000);
  if (lakhs > 0) {
    parts.push(`${twoDigits(lakhs)} Lakh`);
  }
  num %= 100000;

  // Thousands (1,000+)
  const thousands = Math.floor(num / 1000);
  if (thousands > 0) {
    parts.push(`${twoDigits(thousands)} Thousand`);
  }
  num %= 1000;

  // Hundreds and remainder
  const remainder = threeDigits(num);
  if (remainder) {
    parts.push(remainder);
  }

  return parts.join(' ');
}

/**
 * Convert a monetary amount to Indian English words.
 * @param amount String like "1500.50" or "1500"
 * @returns "Rupees One Thousand Five Hundred and Paise Fifty Only"
 */
export function amountInWords(amount: string | number): string {
  const numStr = String(amount).replace(/,/g, '');
  const parts = numStr.split('.');
  const rupees = parseInt(parts[0] ?? '0', 10);
  const paiseStr = (parts[1] ?? '0').padEnd(2, '0').slice(0, 2);
  const paise = parseInt(paiseStr, 10);

  if (isNaN(rupees) || rupees < 0) return 'Invalid Amount';

  let result = `Rupees ${numberToIndianWords(rupees)}`;
  if (paise > 0) {
    result += ` and Paise ${numberToIndianWords(paise)}`;
  }
  result += ' Only';
  return result;
}
