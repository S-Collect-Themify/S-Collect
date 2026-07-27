import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  getRefunds,
  getRefundDetail,
  createRefund,
  updateRefund,
  approveRefund,
  rejectRefund,
  processRefund,
  type RefundItem,
} from '../services/refunds';
import { getErrorMessage } from '../types/api';

/**
 * Custom Query Hook: Fetch vendor refunds with pagination/filters
 * Pure React Query implementation - zero useEffect or manual state management.
 */
export function useRefunds(params?: {
  status?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['vendor-refunds', params],
    queryFn: () => getRefunds(params),
    staleTime: 10_000,
  });
}

/**
 * Custom Query Hook: Fetch single refund details by ID
 */
export function useRefundDetail(id: string) {
  return useQuery({
    queryKey: ['vendor-refund-detail', id],
    queryFn: () => getRefundDetail(id),
    enabled: Boolean(id),
  });
}

/**
 * Custom Mutation Hook: Create a new refund request
 * Pure React Query useMutation - no useEffect or useState required.
 */
export function useCreateRefundMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { orderId: string; amount: number; reason?: string }) =>
      createRefund(data),
    onSuccess: (data) => {
      toast.success(`Refund created successfully (ID: ${data.id})`);
      queryClient.invalidateQueries({ queryKey: ['vendor-refunds'] });
      queryClient.invalidateQueries({ queryKey: ['return-requests'] });
    },
    onError: (err: unknown) => {
      const msg = getErrorMessage(err, 'Failed to create refund');
      toast.error(msg);
    },
  });
}

/**
 * Custom Mutation Hook: Update refund data
 */
export function useUpdateRefundMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<{
        status: RefundItem['status'];
        amount: number;
        reason: string;
      }>;
    }) => updateRefund(id, data),
    onSuccess: (_, variables) => {
      toast.success('Refund updated successfully');
      queryClient.invalidateQueries({ queryKey: ['vendor-refunds'] });
      queryClient.invalidateQueries({
        queryKey: ['vendor-refund-detail', variables.id],
      });
    },
    onError: (err: unknown) => {
      const msg = getErrorMessage(err, 'Failed to update refund');
      toast.error(msg);
    },
  });
}

/**
 * Custom Mutation Hook: Approve a refund request
 */
export function useApproveRefundMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) =>
      approveRefund(id, { note }),
    onSuccess: (_, variables) => {
      toast.success('Refund approved successfully');
      queryClient.invalidateQueries({ queryKey: ['vendor-refunds'] });
      queryClient.invalidateQueries({
        queryKey: ['vendor-refund-detail', variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ['return-requests'] });
    },
    onError: (err: unknown) => {
      const msg = getErrorMessage(err, 'Failed to approve refund');
      toast.error(msg);
    },
  });
}

/**
 * Custom Mutation Hook: Reject a refund request
 */
export function useRejectRefundMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      rejectRefund(id, { reason }),
    onSuccess: (_, variables) => {
      toast.success('Refund rejected');
      queryClient.invalidateQueries({ queryKey: ['vendor-refunds'] });
      queryClient.invalidateQueries({
        queryKey: ['vendor-refund-detail', variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ['return-requests'] });
    },
    onError: (err: unknown) => {
      const msg = getErrorMessage(err, 'Failed to reject refund');
      toast.error(msg);
    },
  });
}

/**
 * Custom Mutation Hook: Process refund payout
 */
export function useProcessRefundMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      amount,
      notes,
    }: {
      id: string;
      amount?: number;
      notes?: string;
    }) => processRefund(id, { amount, notes }),
    onSuccess: (_, variables) => {
      toast.success('Refund processed successfully');
      queryClient.invalidateQueries({ queryKey: ['vendor-refunds'] });
      queryClient.invalidateQueries({
        queryKey: ['vendor-refund-detail', variables.id],
      });
    },
    onError: (err: unknown) => {
      const msg = getErrorMessage(err, 'Failed to process refund');
      toast.error(msg);
    },
  });
}
