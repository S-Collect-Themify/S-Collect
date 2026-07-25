/**
 * Extract 1 or 2 uppercase initials from a person's full name.
 * e.g. "Ahmed Al-Mansour" -> "AA", "Sarah" -> "S"
 */
export function getInitials(name: string): string {
  if (!name) return '';
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}
