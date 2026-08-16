import type { VoucherStatus } from './types';

export const checkVoucherExpired = (expiryDate?: string): boolean => {
  if (!expiryDate || expiryDate === '—') return false;
  const expiry = new Date(expiryDate);
  if (isNaN(expiry.getTime())) return false;

  // Set expiry to the end of day (23:59:59.999) on the specified date
  expiry.setHours(23, 59, 59, 999);
  return new Date() > expiry;
};

export const getVoucherStatus = (
  expiryDate?: string,
  isActive?: boolean | string,
  usedCount?: number,
  maxUsage?: number | string
): VoucherStatus => {
  const max = Number(maxUsage);
  const used = Number(usedCount);
  if (!isNaN(max) && !isNaN(used) && max > 0 && used >= max) {
    return 'Limit Reached';
  }
  if (isActive === false) {
    return 'Expired';
  }
  if (checkVoucherExpired(expiryDate)) {
    return 'Expired';
  }
  return isActive === 'Expired' ? 'Expired' : 'Active';
};

export const parseCategories = (cat?: any): string[] => {
  if (!cat) return [];
  if (Array.isArray(cat))
    return cat.map((item) => (typeof item === 'string' ? item.trim() : typeof item === 'object' && item !== null ? item.id || item._id || item.name || item.nameEn || item.nameAr || JSON.stringify(item) : String(item))).filter(Boolean);
  if (typeof cat === 'string') {
    try {
      const parsed = JSON.parse(cat);
      if (Array.isArray(parsed)) return parseCategories(parsed);
    } catch {
      // not json
    }
    return cat.split(',').map((s) => s.trim()).filter(Boolean);
  }
  if (typeof cat === 'object' && cat !== null) {
    const val = cat.id || cat._id || cat.name || cat.nameEn || cat.nameAr;
    return val ? [String(val)] : [];
  }
  return [];
};

export const resolveCategoryName = (
  idOrCat: any,
  categoriesList: any[] = [],
  language: string = 'en'
): string => {
  if (!idOrCat) return '';

  // If idOrCat is an object itself
  if (typeof idOrCat === 'object' && idOrCat !== null) {
    if (language === 'ar') {
      return (
        idOrCat.nameAr ||
        idOrCat.name_ar ||
        idOrCat.name?.ar ||
        idOrCat.nameEn ||
        idOrCat.name_en ||
        idOrCat.name ||
        idOrCat.title ||
        idOrCat.slug ||
        ''
      );
    }
    return (
      idOrCat.nameEn ||
      idOrCat.name_en ||
      idOrCat.name?.en ||
      idOrCat.name ||
      idOrCat.title ||
      idOrCat.nameAr ||
      idOrCat.name_ar ||
      idOrCat.slug ||
      ''
    );
  }

  const raw = String(idOrCat).trim();
  if (!raw) return '';

  // Try to find the category in categoriesList by ID, name, nameAr, nameEn, slug (case-insensitive)
  const normalizedRaw = raw.toLowerCase();
  const found = categoriesList.find((c) => {
    if (!c) return false;
    const id = String(c.id || c._id || '').trim();
    const name = typeof c.name === 'string' ? c.name.trim() : '';
    const nameAr = String(c.nameAr || c.name_ar || c.name?.ar || '').trim();
    const nameEn = String(c.nameEn || c.name_en || c.name?.en || '').trim();
    const slug = String(c.slug || '').trim();

    return (
      id === raw ||
      (name && name.toLowerCase() === normalizedRaw) ||
      (nameAr && nameAr.toLowerCase() === normalizedRaw) ||
      (nameEn && nameEn.toLowerCase() === normalizedRaw) ||
      (slug && slug.toLowerCase() === normalizedRaw)
    );
  });

  if (found) {
    const nameObj = typeof found.name === 'object' && found.name !== null ? found.name : null;
    const strName = typeof found.name === 'string' ? found.name : '';
    const nameEn = found.nameEn || found.name_en || nameObj?.en;
    const nameAr = found.nameAr || found.name_ar || nameObj?.ar;

    if (language === 'ar') {
      return nameAr || strName || nameEn || found.slug || raw;
    }
    // English or other languages
    return nameEn || strName || nameAr || found.slug || raw;
  }

  return raw;
};
