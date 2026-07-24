import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getVouchersList, createVoucherApi, updateVoucherApi, deleteVoucherApi, type VoucherApiData } from '../../services/vouchers';
import { useVoucherStore } from './voucherStore';
import { getVoucherStatus } from './utils';
import type { VoucherItem } from './types';

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
        if (Array.isArray(response)) {
          const mapped: VoucherItem[] = response.map((v: any, idx: number) => {
            const expiryDate = v.expiryDate || '2025-12-31';
            return {
              id: v.id || v._id || String(idx + 1),
              code: v.code || `VOUCHER-${idx + 1}`,
              type: v.type || 'Percentage',
              discount: v.discount || (v.type === 'Percentage' ? `${v.discountValue || 20}%` : `SAR ${v.discountValue || 50}`),
              discountValue: v.discountValue,
              minOrder: v.minOrder ? (v.minOrder.startsWith('SAR') ? v.minOrder : `SAR ${v.minOrder}`) : 'SAR 100',
              maxDiscount: v.maxDiscount ? (v.maxDiscount.startsWith('SAR') ? v.maxDiscount : `SAR ${v.maxDiscount}`) : '—',
              usage: v.usage || `0/${v.maxUsage || 100}`,
              usedCount: v.usedCount || 0,
              maxUsage: v.maxUsage || 100,
              expiryDate,
              status: getVoucherStatus(expiryDate, v.status),
              limitOnePerCustomer: Boolean(v.limitOnePerCustomer),
            };
          });
          setVouchers(mapped);
          return mapped;
        }
      } catch (e) {
        console.warn('Vouchers API fallback to initial data');
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
        variables.type === 'Percentage'
          ? `${variables.discountValue}%`
          : variables.type === 'Amount'
          ? `SAR ${variables.discountValue}`
          : '—';

      const expiryDate = variables.expiryDate || '2025-12-31';

      const newVoucher: VoucherItem = {
        id: String(Date.now()),
        code: variables.code || `VOUCHER-${Math.floor(Math.random() * 1000)}`,
        type: variables.type,
        discount: discountText,
        discountValue: variables.discountValue,
        minOrder: variables.minOrder ? `SAR ${variables.minOrder}` : 'SAR 0.00',
        maxDiscount: variables.maxDiscount ? `SAR ${variables.maxDiscount}` : '—',
        usage: `0/${variables.maxUsage || 100}`,
        usedCount: 0,
        maxUsage: variables.maxUsage || 100,
        expiryDate,
        status: getVoucherStatus(expiryDate),
        limitOnePerCustomer: variables.limitOnePerCustomer,
      };

      addVoucherToStore(newVoucher);
      toast.success('Voucher created successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-vouchers'] });
    },
    onError: () => {
      toast.error('Failed to create voucher');
    },
  });

  // ── Update Voucher Mutation ──
  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: VoucherApiData }) => {
      return await updateVoucherApi(id, payload);
    },
    onSuccess: (_, variables) => {
      const expiryDate = variables.payload.expiryDate;
      updateVoucherInStore(variables.id, {
        code: variables.payload.code,
        type: variables.payload.type,
        expiryDate,
        status: getVoucherStatus(expiryDate),
        limitOnePerCustomer: variables.payload.limitOnePerCustomer,
      });
      toast.success('Voucher updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-vouchers'] });
    },
    onError: () => {
      toast.error('Failed to update voucher');
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
