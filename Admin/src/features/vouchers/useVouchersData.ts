import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import i18n from '../../i18n';
import {
  getVouchersList,
  getVoucherByIdApi,
  getVoucherStatsApi,
  createVoucherApi,
  updateVoucherApi,
  deleteVoucherApi,
  deactivateVoucherApi,
  type VoucherApiData,
  type BackendVoucherItem,
  type VoucherStatsResponse,
} from '../../services/vouchers';
import { useVoucherStore } from './voucherStore';
import { getVoucherStatus } from './utils';
import type { VoucherItem, VoucherType } from './types';

export const mapBackendVoucherToItem = (v: any): VoucherItem => {
  const rawType = v.type || 'PERCENTAGE';
  const type: VoucherType =
    rawType === 'FIXED_AMOUNT' || rawType === 'AMOUNT' || rawType === 'Amount'
      ? 'Amount'
      : 'Percentage';

  const val = v.value !== undefined && v.value !== null ? v.value : v.discountValue;
  const discountText =
    type === 'Percentage'
      ? `${val ?? 0}%`
      : `SAR ${val ?? 0}`;

  const endsAtStr = v.endsAt || v.expiryDate;
  const expiryDate = endsAtStr ? String(endsAtStr).split('T')[0] : '—';

  const usedCount = v.usesCount ?? v.usedCount ?? 0;
  const maxUsage = v.maxTotalUses ?? v.maxUsage ?? 100;
  const minOrderNum = v.minOrderAmount ?? v.minOrder;
  const minOrderStr =
    minOrderNum !== undefined && minOrderNum !== null
      ? String(minOrderNum).startsWith('SAR')
        ? String(minOrderNum)
        : `SAR ${minOrderNum}`
      : 'SAR 0';

  const maxDiscNum = v.maxDiscountAmount ?? v.maxDiscount;
  const maxDiscStr =
    maxDiscNum !== undefined && maxDiscNum !== null && maxDiscNum !== ''
      ? String(maxDiscNum).startsWith('SAR')
        ? String(maxDiscNum)
        : `SAR ${maxDiscNum}`
      : '—';

  const limitOne =
    v.oneUsePerUser !== undefined
      ? Boolean(v.oneUsePerUser)
      : Boolean(v.limitOnePerCustomer);

  return {
    id: v.id || v._id || '',
    code: v.code || '',
    category: Array.isArray(v.categoryIds) && v.categoryIds.length > 0
      ? v.categoryIds
      : Array.isArray(v.categories) && v.categories.length > 0
      ? v.categories
      : Array.isArray(v.category)
      ? v.category
      : v.category
      ? [v.category]
      : [],
    scope: v.scope || 'ALL_ORDERS',
    type,
    discount: discountText,
    discountValue: val,
    minOrder: minOrderStr,
    maxDiscount: maxDiscStr,
    usage: `${usedCount}/${maxUsage}`,
    usedCount,
    maxUsage,
    expiryDate,
    status: getVoucherStatus(endsAtStr || expiryDate, v.isActive, usedCount, maxUsage),
    limitOnePerCustomer: limitOne,
  };
};

export const useSingleVoucherQuery = (id?: string) => {
  const vouchers = useVoucherStore((s) => s.vouchers);

  return useQuery({
    queryKey: ['admin-voucher', id],
    queryFn: async () => {
      if (!id) return null;
      try {
        const res = await getVoucherByIdApi(id);
        if (res && typeof res === 'object' && (res.id || res._id || res.code)) {
          return mapBackendVoucherToItem(res);
        }
      } catch (err) {
        console.warn('Single voucher query exception:', err);
      }
      return vouchers.find((v) => v.id === id || v.code === id) || null;
    },
    enabled: Boolean(id),
  });
};


export const useVoucherStatsQuery = () => {
  return useQuery({
    queryKey: ['admin-vouchers-stats'],
    queryFn: async (): Promise<VoucherStatsResponse | null> => {
      try {
        return await getVoucherStatsApi();
      } catch (err) {
        console.warn('Vouchers stats API fetch exception:', err);
        return null;
      }
    },
    refetchOnWindowFocus: false,
    retry: 1,
  });
};

const extractVouchersArray = (response: any): BackendVoucherItem[] => {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (typeof response === 'object') {
    if (Array.isArray(response.items)) return response.items;
    if (Array.isArray(response.vouchers)) return response.vouchers;
    if (Array.isArray(response.data)) return response.data;
    if (response.data && typeof response.data === 'object') {
      if (Array.isArray(response.data.items)) return response.data.items;
      if (Array.isArray(response.data.vouchers)) return response.data.vouchers;
    }
  }
  return [];
};

export const useVouchersData = () => {
  const queryClient = useQueryClient();
  const setVouchers = useVoucherStore((s) => s.setVouchers);
  const addVoucherToStore = useVoucherStore((s) => s.addVoucher);
  const updateVoucherInStore = useVoucherStore((s) => s.updateVoucher);
  const removeVoucherFromStore = useVoucherStore((s) => s.removeVoucher);
  const closeDeleteModal = useVoucherStore((s) => s.closeDeleteModal);

  // ── Fetch Vouchers Query ──
  const vouchersQuery = useQuery({
    queryKey: ['admin-vouchers'],
    queryFn: async () => {
      try {
        const response = await getVouchersList();
        const itemsArray = extractVouchersArray(response);

        if (itemsArray.length > 0) {
          const mapped: VoucherItem[] = itemsArray.map((v: any, idx: number) => {
            const rawType = v.type || 'PERCENTAGE';
            const type: VoucherType =
              rawType === 'FIXED_AMOUNT' || rawType === 'AMOUNT' || rawType === 'Amount'
                ? 'Amount'
                : 'Percentage';

            const val = v.value !== undefined && v.value !== null ? v.value : v.discountValue;
            const discountText =
              type === 'Percentage'
                ? `${val ?? 0}%`
                : `SAR ${val ?? 0}`;

            const endsAtStr = v.endsAt || v.expiryDate;
            const expiryDate = endsAtStr ? String(endsAtStr).split('T')[0] : '—';

            const usedCount = v.usesCount ?? v.usedCount ?? 0;
            const maxUsage = v.maxTotalUses ?? v.maxUsage ?? 100;
            const minOrderNum = v.minOrderAmount ?? v.minOrder;
            const minOrderStr =
              minOrderNum !== undefined && minOrderNum !== null
                ? String(minOrderNum).startsWith('SAR')
                  ? String(minOrderNum)
                  : `SAR ${minOrderNum}`
                : 'SAR 0';

            const maxDiscNum = v.maxDiscountAmount ?? v.maxDiscount;
            const maxDiscStr =
              maxDiscNum !== undefined && maxDiscNum !== null && maxDiscNum !== ''
                ? String(maxDiscNum).startsWith('SAR')
                  ? String(maxDiscNum)
                  : `SAR ${maxDiscNum}`
                : '—';

            const limitOne =
              v.oneUsePerUser !== undefined
                ? Boolean(v.oneUsePerUser)
                : Boolean(v.limitOnePerCustomer);

            return {
              id: v.id || v._id || String(idx + 1),
              code: v.code || `VOUCHER-${idx + 1}`,
              category: Array.isArray(v.categoryIds) && v.categoryIds.length > 0
                ? v.categoryIds
                : Array.isArray(v.categories) && v.categories.length > 0
                ? v.categories
                : Array.isArray(v.category)
                ? v.category
                : v.category
                ? [v.category]
                : [],
              scope: v.scope || 'ALL_ORDERS',
              type,
              discount: discountText,
              discountValue: val,
              minOrder: minOrderStr,
              maxDiscount: maxDiscStr,
              usage: `${usedCount}/${maxUsage}`,
              usedCount,
              maxUsage,
              expiryDate,
              status: getVoucherStatus(endsAtStr || expiryDate, v.isActive, usedCount, maxUsage),
              limitOnePerCustomer: limitOne,
            };
          });

          setVouchers(mapped);
          return mapped;
        }
      } catch (e) {
        console.warn('Vouchers API fetch exception:', e);
      }
      return null;
    },
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // ── Voucher Stats Query ──
  const statsQuery = useVoucherStatsQuery();

  // ── Create Voucher Mutation ──
  const createMutation = useMutation({
    mutationFn: async (payload: VoucherApiData) => {
      return await createVoucherApi(payload);
    },
    onSuccess: (_data: any, variables: VoucherApiData) => {
      const discountText =
        variables.type === 'Percentage' || variables.type === 'PERCENTAGE'
          ? `${variables.discountValue || variables.value || 0}%`
          : `SAR ${variables.discountValue || variables.value || 0}`;

      const expiryDate = variables.expiryDate || (variables.endsAt ? String(variables.endsAt).split('T')[0] : '2026-12-31');

      const newVoucher: VoucherItem = {
        id: String(Date.now()),
        code: variables.code || `VOUCHER-${Math.floor(Math.random() * 1000)}`,
        category: Array.isArray(variables.category) ? variables.category : (variables.category ? [variables.category] : []),
        scope: variables.scope || 'ALL_ORDERS',
        type: (variables.type === 'PERCENTAGE' ? 'Percentage' : variables.type === 'FIXED_AMOUNT' ? 'Amount' : variables.type) as VoucherType,
        discount: discountText,
        discountValue: variables.discountValue || variables.value,
        minOrder: variables.minOrder ? `SAR ${variables.minOrder}` : 'SAR 0',
        maxDiscount: variables.maxDiscount ? `SAR ${variables.maxDiscount}` : '—',
        usage: `0/${variables.maxUsage || variables.maxTotalUses || 100}`,
        usedCount: 0,
        maxUsage: variables.maxUsage || variables.maxTotalUses || 100,
        expiryDate,
        status: getVoucherStatus(expiryDate, true, 0, variables.maxUsage || variables.maxTotalUses || 100),
        limitOnePerCustomer: variables.limitOnePerCustomer ?? variables.oneUsePerUser ?? false,
      };

      addVoucherToStore(newVoucher);
      toast.success(
        i18n.language === 'ar' ? 'تم إنشاء القسيمة بنجاح' : 'Voucher created successfully'
      );
      queryClient.invalidateQueries({ queryKey: ['admin-vouchers'] });
      queryClient.invalidateQueries({ queryKey: ['admin-vouchers-stats'] });
    },
    onError: (err: any) => {
      console.error('Create voucher error:', err?.response?.data || err);
      const serverMsg = err?.response?.data?.message || err?.response?.data?.error || err?.message;
      const errorText = typeof serverMsg === 'string' ? serverMsg : Array.isArray(serverMsg) ? serverMsg.join(', ') : 'Failed to create voucher';
      toast.error(errorText);
    },
  });

  // ── Update Voucher Mutation ──
  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: VoucherApiData }) => {
      return await updateVoucherApi(id, payload);
    },
    onSuccess: (_, variables) => {
      const expiryDate = variables.payload.expiryDate || (variables.payload.endsAt ? String(variables.payload.endsAt).split('T')[0] : '—');
      const maxUsageVal = variables.payload.maxUsage || variables.payload.maxTotalUses;
      updateVoucherInStore(variables.id, {
        code: variables.payload.code,
        category: variables.payload.category,
        scope: variables.payload.scope,
        type: (variables.payload.type === 'PERCENTAGE' ? 'Percentage' : variables.payload.type === 'FIXED_AMOUNT' ? 'Amount' : variables.payload.type) as VoucherType,
        expiryDate,
        status: getVoucherStatus(expiryDate, true, 0, maxUsageVal),
        limitOnePerCustomer: variables.payload.limitOnePerCustomer ?? variables.payload.oneUsePerUser,
      });
      toast.success(
        i18n.language === 'ar' ? 'تم تحديث القسيمة بنجاح' : 'Voucher updated successfully'
      );
      queryClient.invalidateQueries({ queryKey: ['admin-vouchers'] });
      queryClient.invalidateQueries({ queryKey: ['admin-vouchers-stats'] });
    },
    onError: (err: any) => {
      console.error('Update voucher error:', err?.response?.data || err);
      const serverMsg = err?.response?.data?.message || err?.response?.data?.error || err?.message;
      const errorText = typeof serverMsg === 'string' ? serverMsg : Array.isArray(serverMsg) ? serverMsg.join(', ') : 'Failed to update voucher';
      toast.error(errorText);
    },
  });

  // ── Deactivate Voucher Mutation ──
  const deactivateMutation = useMutation({
    mutationFn: async (voucherId: string) => {
      return await deactivateVoucherApi(voucherId);
    },
    onSuccess: (_, voucherId) => {
      updateVoucherInStore(voucherId, { status: 'Expired' });
      toast.success(
        i18n.language === 'ar' ? 'تم إلغاء تفعيل القسيمة بنجاح' : 'Voucher deactivated successfully'
      );
      queryClient.invalidateQueries({ queryKey: ['admin-vouchers'] });
      queryClient.invalidateQueries({ queryKey: ['admin-vouchers-stats'] });
    },
    onError: (err: any) => {
      console.error('Deactivate voucher error:', err?.response?.data || err);
      const serverMsg = err?.response?.data?.message || err?.response?.data?.error || err?.message;
      const errorText = typeof serverMsg === 'string' ? serverMsg : 'Failed to deactivate voucher';
      toast.error(errorText);
    },
  });

  // ── Delete Voucher Mutation ──
  const deleteMutation = useMutation({
    mutationFn: async (voucherId: string) => {
      return await deleteVoucherApi(voucherId);
    },
    onMutate: (voucherId: string) => {
      removeVoucherFromStore(voucherId);
      closeDeleteModal();
    },
    onSuccess: () => {
      toast.success(
        i18n.language === 'ar' ? 'تم حذف القسيمة بنجاح' : 'Voucher deleted successfully'
      );
      queryClient.invalidateQueries({ queryKey: ['admin-vouchers'] });
      queryClient.invalidateQueries({ queryKey: ['admin-vouchers-stats'] });
    },
    onError: (err: any) => {
      console.error('Delete voucher error:', err?.response?.data || err);
      const serverMsg = err?.response?.data?.message || err?.response?.data?.error || err?.message;
      const errorText = typeof serverMsg === 'string' ? serverMsg : 'Failed to delete voucher';
      toast.error(errorText);
    },
  });

  return {
    vouchersQuery,
    statsQuery,
    createMutation,
    updateMutation,
    deactivateMutation,
    deleteMutation,
  };
};
