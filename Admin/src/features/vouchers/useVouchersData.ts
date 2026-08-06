import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  getVouchersList,
  createVoucherApi,
  updateVoucherApi,
  deleteVoucherApi,
  type VoucherApiData,
  type BackendVoucherItem,
} from '../../services/vouchers';
import { useVoucherStore } from './voucherStore';
import { getVoucherStatus } from './utils';
import type { VoucherItem, VoucherType } from './types';

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
              category: Array.isArray(v.categoryIds)
                ? v.categoryIds
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
              status: getVoucherStatus(endsAtStr || expiryDate, v.isActive),
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
        status: getVoucherStatus(expiryDate),
        limitOnePerCustomer: variables.limitOnePerCustomer ?? variables.oneUsePerUser ?? false,
      };

      addVoucherToStore(newVoucher);
      toast.success('Voucher created successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-vouchers'] });
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
      updateVoucherInStore(variables.id, {
        code: variables.payload.code,
        category: variables.payload.category,
        scope: variables.payload.scope,
        type: (variables.payload.type === 'PERCENTAGE' ? 'Percentage' : variables.payload.type === 'FIXED_AMOUNT' ? 'Amount' : variables.payload.type) as VoucherType,
        expiryDate,
        status: getVoucherStatus(expiryDate),
        limitOnePerCustomer: variables.payload.limitOnePerCustomer ?? variables.payload.oneUsePerUser,
      });
      toast.success('Voucher updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-vouchers'] });
    },
    onError: (err: any) => {
      console.error('Update voucher error:', err?.response?.data || err);
      const serverMsg = err?.response?.data?.message || err?.response?.data?.error || err?.message;
      const errorText = typeof serverMsg === 'string' ? serverMsg : Array.isArray(serverMsg) ? serverMsg.join(', ') : 'Failed to update voucher';
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
      toast.success('Voucher deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-vouchers'] });
    },
    onError: () => {
      toast.error('Failed to delete voucher');
    },
  });

  return {
    vouchersQuery,
    createMutation,
    updateMutation,
    deleteMutation,
  };
};
