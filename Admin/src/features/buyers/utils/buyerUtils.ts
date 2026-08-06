/**
 * Extract 1 or 2 uppercase initials from a person's full name.
 * e.g. "Ahmed Al-Mansour" -> "AA", "Sarah" -> "S", "---" -> "---"
 */
export function getInitials(name: string): string {
  if (!name || name === '---' || name === '--') return '---';
  const clean = name.trim();
  if (!clean || clean === '---' || clean === '--') return '---';

  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '---';

  return parts
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

/**
 * Returns `---` for null, undefined, or empty/whitespace-only values.
 */
export function formatValue<T>(val: T | null | undefined): T | string {
  if (val === null || val === undefined) return '---';
  if (typeof val === 'string' && !val.trim()) return '---';
  return val;
}

/**
 * Formats a buyer's full name from firstName and lastName.
 * Returns '---' if both are missing or empty.
 */
export function formatBuyerName(
  firstName?: string | null,
  lastName?: string | null
): string {
  const first = firstName?.trim() || '';
  const last = lastName?.trim() || '';
  const fullName = `${first} ${last}`.trim();
  return fullName || '---';
}

/**
 * Formats ISO date string to readable format or returns '---'.
 */
export function formatBuyerDate(dateStr?: string | null): string {
  if (!dateStr || !dateStr.trim()) return '---';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '---';
  }
}

/**
 * Formats order count safely. Returns '---' if null or undefined.
 */
export function formatOrderCount(orders?: number | null): number | string {
  if (orders === null || orders === undefined) return '---';
  return orders;
}
