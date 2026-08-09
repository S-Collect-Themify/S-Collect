import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  getAdminRefunds,
  getAdminRefundDetail,
  approveAdminRefund,
  rejectAdminRefund,
  updateAdminRefundNotes,
  type GetAdminRefundsParams,
} from '../../../services/refunds';

/**
 * Fetch list of admin refunds with caching and next-page prefetching
 */
export const useAdminRefunds = (params?: GetAdminRefundsParams, enabled: boolean = true) => {
  const queryClient = useQueryClient();

  const queryResult = useQuery({
    queryKey: ['admin-refunds', params],
    queryFn: () => getAdminRefunds(params),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes cache stale time
    gcTime: 10 * 60 * 1000,   // 10 minutes garbage collection time
    refetchOnWindowFocus: false,
    retry: 2,
  });

  // Next page prefetching for seamless pagination UX
  if (enabled && queryResult.data) {
    const pageNum = params?.pageNum ?? 1;
    const pageSize = params?.pageSize ?? 25;
    const totalPages = queryResult.data.pagination?.totalPages;

    if (!totalPages || pageNum + 1 <= totalPages) {
      queryClient.prefetchQuery({
        queryKey: ['admin-refunds', { ...params, pageNum: pageNum + 1, pageSize }],
        queryFn: () => getAdminRefunds({ ...params, pageNum: pageNum + 1, pageSize }),
        staleTime: 5 * 60 * 1000,
      });
    }
  }

  return queryResult;
};

/**
 * Fetch detail for a single refund request by ID with caching
 */
export const useAdminRefundDetail = (id?: string) => {
  return useQuery({
    queryKey: ['admin-refund-detail', id],
    queryFn: () => getAdminRefundDetail(id!),
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  });
};

/**
 * Approve refund request mutation with direct cache updates & invalidations
 */
export const useApproveAdminRefund = (refundId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => approveAdminRefund(id),
    onSuccess: (updatedRefund, targetId) => {
      const activeId = refundId || targetId;
      toast.success('Refund request approved successfully');

      if (activeId) {
        queryClient.setQueryData(['admin-refund-detail', activeId], updatedRefund);
        queryClient.invalidateQueries({ queryKey: ['admin-refund-detail', activeId] });
      }
      queryClient.invalidateQueries({ queryKey: ['admin-refunds'] });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    },
    onError: (err: unknown) => {
      const errObj = err as { response?: { data?: { message?: string } }; message?: string };
      const message = errObj?.response?.data?.message || errObj?.message || 'Failed to approve refund';
      toast.error(message);
    },
  });
};

/**
 * Reject refund request mutation with direct cache updates & invalidations
 */
export const useRejectAdminRefund = (refundId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => rejectAdminRefund(id, reason),
    onSuccess: (updatedRefund, variables) => {
      const activeId = refundId || variables.id;
      toast.success('Refund request rejected successfully');

      if (activeId) {
        queryClient.setQueryData(['admin-refund-detail', activeId], updatedRefund);
        queryClient.invalidateQueries({ queryKey: ['admin-refund-detail', activeId] });
      }
      queryClient.invalidateQueries({ queryKey: ['admin-refunds'] });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    },
    onError: (err: unknown) => {
      const errObj = err as { response?: { data?: { message?: string } }; message?: string };
      const message = errObj?.response?.data?.message || errObj?.message || 'Failed to reject refund';
      toast.error(message);
    },
  });
};

/**
 * Update internal notes mutation with direct cache updates & invalidations
 */
export const useUpdateAdminRefundNotes = (refundId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) => updateAdminRefundNotes(id, notes),
    onSuccess: (updatedRefund, variables) => {
      const activeId = refundId || variables.id;
      toast.success('Internal notes updated');

      if (activeId) {
        queryClient.setQueryData(['admin-refund-detail', activeId], updatedRefund);
        queryClient.invalidateQueries({ queryKey: ['admin-refund-detail', activeId] });
      }
      queryClient.invalidateQueries({ queryKey: ['admin-refunds'] });
    },
    onError: (err: unknown) => {
      const errObj = err as { response?: { data?: { message?: string } }; message?: string };
      const message = errObj?.response?.data?.message || errObj?.message || 'Failed to update notes';
      toast.error(message);
    },
  });
};
