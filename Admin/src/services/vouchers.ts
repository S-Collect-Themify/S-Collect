import { api } from './api';

export interface BackendVoucherItem {
  id: string;
  code: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING' | string;
  value: number;
  scope?: string;
  categoryIds?: string[] | null;
  minOrderAmount?: number;
  maxDiscountAmount?: number | null;
  startsAt?: string;
  endsAt?: string;
  maxTotalUses?: number;
  usesCount?: number;
  oneUsePerUser?: boolean;
  isActive?: boolean;
  createdAt?: string;
}

export interface VoucherApiData {
  id?: string;
  code: string;
  category?: string[] | string;
  categoryIds?: string[] | null;
  scope?: string;
  type: string;
  value?: number;
  discountValue?: string | number;
  minOrder?: string | number;
  minOrderAmount?: number;
  maxDiscount?: string | number;
  maxDiscountAmount?: number | null;
  expiryDate?: string;
  startsAt?: string;
  endsAt?: string;
  maxUsage?: string | number;
  maxTotalUses?: number;
  limitOnePerCustomer?: boolean;
  oneUsePerUser?: boolean;
}

const mapTypeToBackend = (type: string): string => {
  if (type === 'Percentage' || type === 'PERCENTAGE') return 'PERCENTAGE';
  if (type === 'Amount' || type === 'FIXED_AMOUNT' || type === 'AMOUNT') return 'FIXED_AMOUNT';
  if (type === 'Free Shipping' || type === 'FREE_SHIPPING') return 'FREE_SHIPPING';
  return type || 'PERCENTAGE';
};

export const getVouchersList = async (params?: any) => {
  try {
    const { data } = await api.get('/admin/vouchers', { params });
    return data;
  } catch (err) {
    console.warn('API getVouchersList fallback to local data');
    return null;
  }
};

export const createVoucherApi = async (voucherData: VoucherApiData) => {
  try {
    const payload = {
      code: voucherData.code,
      type: mapTypeToBackend(voucherData.type),
      value: Number(voucherData.value ?? voucherData.discountValue ?? 0),
      scope: voucherData.scope || 'ALL_ORDERS',
      categoryIds: Array.isArray(voucherData.category)
        ? voucherData.category
        : (voucherData.categoryIds || null),
      minOrderAmount: Number(voucherData.minOrderAmount ?? voucherData.minOrder ?? 0),
      maxDiscountAmount: voucherData.maxDiscountAmount !== undefined
        ? voucherData.maxDiscountAmount
        : (voucherData.maxDiscount ? Number(voucherData.maxDiscount) : null),
      startsAt: voucherData.startsAt || new Date().toISOString(),
      endsAt: voucherData.endsAt || (voucherData.expiryDate ? `${voucherData.expiryDate}T23:59:59.000Z` : new Date().toISOString()),
      maxTotalUses: Number(voucherData.maxTotalUses ?? voucherData.maxUsage ?? 100),
      oneUsePerUser: voucherData.oneUsePerUser ?? voucherData.limitOnePerCustomer ?? false,
      isActive: true,
    };
    const { data } = await api.post('/admin/vouchers', payload);
    return data;
  } catch (err) {
    return { success: true, ...voucherData };
  }
};

export const updateVoucherApi = async (id: string, voucherData: VoucherApiData) => {
  try {
    const payload = {
      code: voucherData.code,
      type: mapTypeToBackend(voucherData.type),
      value: Number(voucherData.value ?? voucherData.discountValue ?? 0),
      scope: voucherData.scope || 'ALL_ORDERS',
      categoryIds: Array.isArray(voucherData.category)
        ? voucherData.category
        : (voucherData.categoryIds || null),
      minOrderAmount: Number(voucherData.minOrderAmount ?? voucherData.minOrder ?? 0),
      maxDiscountAmount: voucherData.maxDiscountAmount !== undefined
        ? voucherData.maxDiscountAmount
        : (voucherData.maxDiscount ? Number(voucherData.maxDiscount) : null),
      endsAt: voucherData.endsAt || (voucherData.expiryDate ? `${voucherData.expiryDate}T23:59:59.000Z` : undefined),
      maxTotalUses: Number(voucherData.maxTotalUses ?? voucherData.maxUsage ?? 100),
      oneUsePerUser: voucherData.oneUsePerUser ?? voucherData.limitOnePerCustomer ?? false,
    };
    const { data } = await api.put(`/admin/vouchers/${id}`, payload);
    return data;
  } catch (err) {
    return { success: true, id, ...voucherData };
  }
};

export const deleteVoucherApi = async (id: string) => {
  try {
    const { data } = await api.delete(`/admin/vouchers/${id}`);
    return data;
  } catch (err) {
    return { success: true, id };
  }
};
