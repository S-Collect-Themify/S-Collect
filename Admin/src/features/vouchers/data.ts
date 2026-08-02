import type { VoucherItem } from './types';
import { getVoucherStatus } from './utils';

export const VOUCHERS_PER_PAGE = 20;

const RAW_INITIAL_VOUCHERS: VoucherItem[] = [
  {
    id: '1',
    code: '--',
    category: ['--'],
    scope: '--',
    type: 'Percentage',
    discount: '--',
    discountValue: '--',
    minOrder: '--',
    maxDiscount: '--',
    usage: '--',
    usedCount: 0,
    maxUsage: '--',
    expiryDate: '--',
    status: 'Active',
    limitOnePerCustomer: false,
  },
];

export const INITIAL_VOUCHERS: VoucherItem[] = RAW_INITIAL_VOUCHERS.map((v) => ({
  ...v,
  status: getVoucherStatus(v.expiryDate, v.status),
}));
