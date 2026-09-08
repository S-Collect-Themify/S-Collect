/**
 * Utility for resolving color names (English and Arabic) into valid CSS color strings.
 */

// Arabic color name translations to hex
export const ARABIC_COLOR_MAP: Record<string, string> = {
  أسود: '#111827',
  اسود: '#111827',
  أبيض: '#FFFFFF',
  ابيض: '#FFFFFF',
  كحلي: '#1E3A8A',
  رمادي: '#6B7280',
  رصاصي: '#6B7280',
  فضي: '#9CA3AF',
  بيج: '#E5D3B3',
  بني: '#78350F',
  أزرق: '#3B82F6',
  ازرق: '#3B82F6',
  أحمر: '#EF4444',
  احمر: '#EF4444',
  أخضر: '#10B981',
  اخضر: '#10B981',
  وردي: '#EC4899',
  زهري: '#EC4899',
  أصفر: '#FBBF24',
  اصفر: '#FBBF24',
  أرجواني: '#8B5CF6',
  ارجواني: '#8B5CF6',
  بنفسجي: '#8B5CF6',
  برتقالي: '#F97316',
  ذهبي: '#D97706',
  عنابي: '#800000',
  خمري: '#800020',
  زيتوني: '#65A30D',
  سماوي: '#06B6D4',
  فيروزي: '#40E0D0',
  نيلي: '#4F46E5',
  خاكي: '#C3B091',
};

/**
 * Checks if a string is a valid native CSS color recognized by the browser
 * (supports all 148 standard CSS color keywords like orange, red, navy, coral, etc.)
 */
export function isNativeCssColor(color: string): boolean {
  if (typeof window === 'undefined' || !color) return false;
  const s = new Option().style;
  s.color = color;
  return s.color !== '';
}

/**
 * Resolves any color representation (hex, English name, Arabic name, or custom text)
 * into a valid CSS color string.
 */
export function resolveColorHex(
  name: string,
  nameAr?: string,
  existingHex?: string
): string {
  // 1. If explicit hex/rgb is already provided
  if (
    existingHex &&
    (existingHex.startsWith('#') || existingHex.startsWith('rgb'))
  ) {
    return existingHex;
  }

  const cleanName = name ? name.trim().toLowerCase() : '';

  // 2. Check Arabic dictionary
  if (nameAr) {
    const cleanAr = nameAr.trim().toLowerCase();
    if (ARABIC_COLOR_MAP[cleanAr]) return ARABIC_COLOR_MAP[cleanAr];
  }
  if (ARABIC_COLOR_MAP[cleanName]) {
    return ARABIC_COLOR_MAP[cleanName];
  }

  // 3. Check native browser CSS color names (all 148 standard CSS colors)
  if (isNativeCssColor(cleanName)) {
    return cleanName;
  }

  // 4. Deterministic pleasant pastel color for arbitrary custom labels (e.g. test data)
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 65%, 55%)`;
}
