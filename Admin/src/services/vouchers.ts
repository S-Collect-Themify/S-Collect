import { api } from './api';

export interface BackendVoucherItem {
  id: string;
  code: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT' | string;
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
  status?: string;
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
  if (!type) return 'PERCENTAGE';
  const upper = type.toUpperCase();
  if (upper === 'FIXED_AMOUNT' || upper === 'AMOUNT' || upper === 'FIXED') return 'FIXED_AMOUNT';
  return 'PERCENTAGE';
};

export const getVouchersList = async (params?: any) => {
  try {
    const { data } = await api.get('/admin/vouchers', { params });
    return data;
  } catch (err) {
    console.warn('API getVouchersList fallback to local data', err);
    return null;
  }
};

export const getVoucherByIdApi = async (id: string) => {
  try {
    const { data } = await api.get(`/admin/vouchers/${id}`);
    return data?.data || data?.voucher || data?.item || data;
  } catch (err) {
    console.warn(`API getVoucherByIdApi (${id}) fallback`, err);
    return null;
  }
};


const parseToISOString = (dateInput: any, isEnd = false): string => {
  if (!dateInput) {
    const fallback = new Date();
    if (isEnd) fallback.setFullYear(fallback.getFullYear() + 1);
    return fallback.toISOString();
  }

  if (dateInput instanceof Date) {
    return dateInput.toISOString();
  }

  const str = String(dateInput).trim();
  let d = new Date(str);

  if (isNaN(d.getTime())) {
    const parts = str.split(/[-/T ]/);
    if (parts.length >= 3) {
      if (parts[0].length === 4) {
        // YYYY-MM-DD
        d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      } else if (parts[2].length === 4) {
        // MM/DD/YYYY
        d = new Date(Number(parts[2]), Number(parts[0]) - 1, Number(parts[1]));
      }
    }
  }

  if (isNaN(d.getTime())) {
    d = new Date();
    if (isEnd) d.setFullYear(d.getFullYear() + 1);
  } else if (isEnd) {
    d.setHours(23, 59, 59, 999);
  }

  return d.toISOString();
};

export const createVoucherApi = async (voucherData: VoucherApiData) => {
  try {
    const isCategory =
      voucherData.scope === 'SPECIFIC_CATEGORIES' ||
      voucherData.scope === 'Category';

    const scope = isCategory ? 'SPECIFIC_CATEGORIES' : (voucherData.scope || 'ALL_ORDERS');
    const type = mapTypeToBackend(voucherData.type);

    const startsAt = parseToISOString(voucherData.startsAt || new Date());
    const endsAt = parseToISOString(voucherData.endsAt || voucherData.expiryDate, true);

    const payload: Record<string, any> = {
      code: voucherData.code,
      type,
      value: Number(voucherData.value ?? voucherData.discountValue ?? 0),
      scope,
      startsAt,
      endsAt,
    };

    const catIds = Array.isArray(voucherData.category)
      ? voucherData.category
      : Array.isArray(voucherData.categoryIds)
      ? voucherData.categoryIds
      : null;

    if (catIds && catIds.length > 0) {
      payload.categoryIds = catIds;
    }

    const minOrder = voucherData.minOrderAmount ?? voucherData.minOrder;
    if (minOrder !== undefined && minOrder !== '' && minOrder !== null) {
      const val = Number(minOrder);
      if (!isNaN(val) && val > 0) payload.minOrderAmount = val;
    }

    const maxDisc = voucherData.maxDiscountAmount ?? voucherData.maxDiscount;
    if (maxDisc !== undefined && maxDisc !== '' && maxDisc !== null) {
      const val = Number(maxDisc);
      if (!isNaN(val) && val > 0) payload.maxDiscountAmount = val;
    }

    const maxUses = voucherData.maxTotalUses ?? voucherData.maxUsage;
    if (maxUses !== undefined && maxUses !== '' && maxUses !== null) {
      const val = Number(maxUses);
      if (!isNaN(val) && val > 0) payload.maxTotalUses = val;
    }

    const oneUse = voucherData.oneUsePerUser ?? voucherData.limitOnePerCustomer;
    if (oneUse !== undefined && oneUse !== null) {
      payload.oneUsePerUser = Boolean(oneUse);
    }

    console.log('POST /admin/vouchers payload:', JSON.stringify(payload, null, 2));

    const { data } = await api.post('/admin/vouchers', payload);
    return data;
  } catch (err) {
    console.error('Failed to create voucher via API:', err);
    throw err;
  }
};


export interface VoucherStatsResponse {
  totalActiveVouchers: number;
  totalUsagesThisMonth: number;
  totalCostSavedThisMonth: number;
}

export const getVoucherStatsApi = async (): Promise<VoucherStatsResponse | null> => {
  try {
    const { data } = await api.get('/admin/vouchers/stats');
    return data?.data || data;
  } catch (err) {
    console.warn('API getVoucherStatsApi fallback', err);
    return null;
  }
};

export const updateVoucherApi = async (id: string, voucherData: VoucherApiData) => {
  try {
    const isCategory =
      voucherData.scope === 'SPECIFIC_CATEGORIES' ||
      voucherData.scope === 'Category';

    const scope = isCategory ? 'SPECIFIC_CATEGORIES' : (voucherData.scope || 'ALL_ORDERS');

    let endsAt: string | undefined;
    if (voucherData.endsAt) {
      endsAt = new Date(voucherData.endsAt).toISOString();
    } else if (voucherData.expiryDate) {
      const d = voucherData.expiryDate.includes('T')
        ? new Date(voucherData.expiryDate)
        : new Date(`${voucherData.expiryDate}T23:59:59.000Z`);
      endsAt = !isNaN(d.getTime()) ? d.toISOString() : undefined;
    }

    const payload: Record<string, any> = {
      code: voucherData.code,
      type: mapTypeToBackend(voucherData.type),
      value: Number(voucherData.value ?? voucherData.discountValue ?? 0),
      scope,
    };

    if (endsAt) {
      payload.endsAt = endsAt;
    }

    const catIds = Array.isArray(voucherData.category)
      ? voucherData.category
      : Array.isArray(voucherData.categoryIds)
      ? voucherData.categoryIds
      : null;

    if (catIds && catIds.length > 0) {
      payload.categoryIds = catIds;
    }

    const minOrder = voucherData.minOrderAmount ?? voucherData.minOrder;
    if (minOrder !== undefined && minOrder !== '' && minOrder !== null) {
      const val = Number(minOrder);
      if (!isNaN(val)) payload.minOrderAmount = val;
    }

    const maxDisc = voucherData.maxDiscountAmount ?? voucherData.maxDiscount;
    if (maxDisc !== undefined && maxDisc !== '' && maxDisc !== null) {
      const val = Number(maxDisc);
      if (!isNaN(val)) payload.maxDiscountAmount = val;
    }

    const maxUses = voucherData.maxTotalUses ?? voucherData.maxUsage;
    if (maxUses !== undefined && maxUses !== '' && maxUses !== null) {
      const val = Number(maxUses);
      if (!isNaN(val)) payload.maxTotalUses = val;
    }

    const oneUse = voucherData.oneUsePerUser ?? voucherData.limitOnePerCustomer;
    if (oneUse !== undefined && oneUse !== null) {
      payload.oneUsePerUser = Boolean(oneUse);
    }

    const { data } = await api.patch(`/admin/vouchers/${id}`, payload);
    return data;
  } catch (err) {
    console.error(`Failed to update voucher ${id} via API:`, err);
    throw err;
  }
};

export const deleteVoucherApi = async (id: string) => {
  try {
    const { data } = await api.delete(`/admin/vouchers/${id}`);
    return data;
  } catch (err) {
    console.error(`Failed to delete voucher ${id} via API:`, err);
    throw err;
  }
};

export const deactivateVoucherApi = async (id: string) => {
  try {
    const { data } = await api.patch(`/admin/vouchers/${id}/deactivate`);
    return data;
  } catch (err) {
    console.error(`Failed to deactivate voucher ${id} via API:`, err);
    throw err;
  }
};
