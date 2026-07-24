import type { VoucherStatus } from './types';

export const checkVoucherExpired = (expiryDate?: string): boolean => {
  if (!expiryDate) return false;
  const expiry = new Date(expiryDate);
  if (isNaN(expiry.getTime())) return false;

  // Set expiry to the end of day (23:59:59.999) on the specified date
  expiry.setHours(23, 59, 59, 999);
  return new Date() > expiry;
};

export const getVoucherStatus = (
  expiryDate?: string,
  currentStatus?: string
): VoucherStatus => {
  if (checkVoucherExpired(expiryDate)) {
    return 'Expired';
  }
  return currentStatus === 'Expired' ? 'Expired' : 'Active';
};
