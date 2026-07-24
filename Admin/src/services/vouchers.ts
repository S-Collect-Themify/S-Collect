import { api } from './api';

export interface VoucherApiData {
  id?: string;
  code: string;
  type: 'Percentage' | 'Amount' | 'Free Shipping';
  discountValue: string;
  minOrder: string;
  maxDiscount: string;
  expiryDate: string;
  maxUsage: string;
  limitOnePerCustomer?: boolean;
}

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
    const { data } = await api.post('/admin/vouchers', voucherData);
    return data;
  } catch (err) {
    return { success: true, ...voucherData };
  }
};

export const updateVoucherApi = async (id: string, voucherData: VoucherApiData) => {
  try {
    const { data } = await api.put(`/admin/vouchers/${id}`, voucherData);
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
