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

export const createVoucherApi = async (voucherData: VoucherApiData) => {
  try {
    const scope =
      voucherData.scope === 'All' || !voucherData.scope
        ? 'ALL_ORDERS'
        : voucherData.scope;

    // startsAt is creation time as ISO 8601 string
    const startsAt = voucherData.startsAt
      ? new Date(voucherData.startsAt).toISOString()
      : new Date().toISOString();

    // format endsAt as ISO 8601 string
    let endsAt: string;
    if (voucherData.endsAt) {
      endsAt = new Date(voucherData.endsAt).toISOString();
    } else if (voucherData.expiryDate) {
      const d = voucherData.expiryDate.includes('T')
        ? new Date(voucherData.expiryDate)
        : new Date(`${voucherData.expiryDate}T23:59:59.000Z`);
      endsAt = !isNaN(d.getTime()) ? d.toISOString() : new Date().toISOString();
    } else {
      endsAt = new Date().toISOString();
    }

    const payload: Record<string, any> = {
      code: voucherData.code,
      type: mapTypeToBackend(voucherData.type),
      value: Number(voucherData.value ?? voucherData.discountValue ?? 0),
      scope,
      startsAt,
      endsAt,
    };

    if (scope === 'Category') {
      const catIds = Array.isArray(voucherData.category)
        ? voucherData.category
        : voucherData.categoryIds || null;
      if (catIds && catIds.length > 0) {
        payload.categoryIds = catIds;
      }
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

    const { data } = await api.post('/admin/vouchers', payload);
    return data;
  } catch (err) {
    console.error('Failed to create voucher via API:', err);
    throw err;
  }
};

export const updateVoucherApi = async (id: string, voucherData: VoucherApiData) => {
  try {
    const scope =
      voucherData.scope === 'All' || !voucherData.scope
        ? 'ALL_ORDERS'
        : voucherData.scope;

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

    if (scope === 'Category') {
      const catIds = Array.isArray(voucherData.category)
        ? voucherData.category
        : voucherData.categoryIds || null;
      if (catIds && catIds.length > 0) {
        payload.categoryIds = catIds;
      }
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

    const { data } = await api.put(`/admin/vouchers/${id}`, payload);
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
