// ============================================================================
// Date Utilities — All timestamps stored as UTC, displayed in configured timezone
// Business dates are date-only (no timezone conversion needed)
// ============================================================================

const DEFAULT_TIMEZONE = 'Asia/Kolkata';

/**
 * Format a timestamptz for display: "11 Oct 2026, 01:30 AM"
 */
export function formatDateTime(
  isoString: string | null | undefined,
  timezone: string = DEFAULT_TIMEZONE
): string {
  if (!isoString) return '—';
  try {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: timezone,
    }).format(new Date(isoString));
  } catch {
    return isoString;
  }
}

/**
 * Format a date for display: "11 Oct 2026"
 */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString + 'T00:00:00');
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

/**
 * Format a date for input fields: "2026-10-11"
 */
export function toInputDate(dateString: string | null | undefined): string {
  if (!dateString) return '';
  return dateString.slice(0, 10);
}

/**
 * Get today's date as YYYY-MM-DD in the configured timezone
 */
export function todayISO(timezone: string = DEFAULT_TIMEZONE): string {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: timezone,
  });
  return formatter.format(now);
}

/**
 * Calculate expiry date: start_date + duration_days
 */
export function calculateExpiryDate(startDate: string, durationDays: number): string {
  const parts = startDate.split('-').map(Number);
  const year = parts[0] ?? 2026;
  const month = parts[1] ?? 1;
  const day = parts[2] ?? 1;
  const start = new Date(Date.UTC(year, month - 1, day));
  start.setUTCDate(start.getUTCDate() + durationDays);
  return start.toISOString().slice(0, 10);
}

/**
 * Calculate days remaining from today to expiry
 */
export function daysRemaining(expiryDate: string | null | undefined, timezone: string = DEFAULT_TIMEZONE): number | null {
  if (!expiryDate) return null;
  const today = new Date(todayISO(timezone) + 'T00:00:00');
  const expiry = new Date(expiryDate + 'T00:00:00');
  const diff = expiry.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Check if a membership is expiring within N days
 */
export function isExpiringSoon(expiryDate: string | null | undefined, withinDays: number = 7): boolean {
  const remaining = daysRemaining(expiryDate);
  if (remaining === null) return false;
  return remaining >= 0 && remaining <= withinDays;
}

/**
 * Get a relative date description: "3 days left", "Expired 2 days ago", etc.
 */
export function expiryDescription(expiryDate: string | null | undefined): string {
  const remaining = daysRemaining(expiryDate);
  if (remaining === null) return 'No expiry';
  if (remaining < 0) return `Expired ${Math.abs(remaining)} day${Math.abs(remaining) === 1 ? '' : 's'} ago`;
  if (remaining === 0) return 'Expires today';
  if (remaining === 1) return '1 day left';
  return `${remaining} days left`;
}

/**
 * Get the start of month/year/week for date ranges
 */
export function startOfMonth(timezone: string = DEFAULT_TIMEZONE): string {
  const today = todayISO(timezone);
  return today.slice(0, 8) + '01';
}

export function startOfYear(timezone: string = DEFAULT_TIMEZONE): string {
  const today = todayISO(timezone);
  return today.slice(0, 5) + '01-01';
}

/**
 * Format a date range for display
 */
export function formatDateRange(from: string, to: string): string {
  return `${formatDate(from)} – ${formatDate(to)}`;
}
