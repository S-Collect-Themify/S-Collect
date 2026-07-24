export type VoucherType = 'Percentage' | 'Amount' | 'Free Shipping';
export type VoucherStatus = 'Active' | 'Expired';
export type VoucherTab = 'active' | 'expired' | 'all';

export interface VoucherItem {
  id: string;
  code: string;
  type: VoucherType;
  discount: string; // e.g. '20%' or 'SAR 50' or '—'
  discountValue?: number | string;
  minOrder: string; // e.g. 'SAR 100'
  maxDiscount: string; // e.g. 'SAR 50' or '—'
  usage: string; // e.g. '145/500'
  usedCount?: number;
  maxUsage?: number | string;
  expiryDate: string; // e.g. '2025-12-31'
  status: VoucherStatus;
  limitOnePerCustomer?: boolean;
}

export interface VoucherFormInput {
  code: string;
  type: VoucherType;
  discountValue: string;
  minOrder: string;
  maxDiscount: string;
  expiryDate: string;
  maxUsage: string;
  limitOnePerCustomer: boolean;
}

export interface DeleteVoucherModalState {
  open: boolean;
  voucher: VoucherItem | null;
}
