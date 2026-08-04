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
  isActive?: boolean | string
): VoucherStatus => {
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
    return cat.map((item) => (typeof item === 'string' ? item.trim() : String(item))).filter(Boolean);
  if (typeof cat === 'string') {
    return cat.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return [];
};
