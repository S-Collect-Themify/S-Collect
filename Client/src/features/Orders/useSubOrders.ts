import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSubOrders, getSubOrderById, updateSubOrder } from '../../services/orders';
import type { SubOrderStatus, UpdateSubOrderDto } from './types/subOrder';
import toast from 'react-hot-toast';

// ────────────────────────────────────────────────────────────────────────────
// List (with automatic next-page prefetching)
// ────────────────────────────────────────────────────────────────────────────
export const useSubOrders = (params?: {
  pageNum?: number;
  pageSize?: number;
  status?: SubOrderStatus;
}) => {
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: ['sub-orders', params],
    queryFn: () => getSubOrders(params),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const currentPage = params?.pageNum ?? 1;
  const totalPages = query.data?.pagination?.totalPages ?? 0;

  useEffect(() => {
    if (currentPage < totalPages) {
      const nextParams = {
        ...params,
        pageNum: currentPage + 1,
      };
      queryClient.prefetchQuery({
        queryKey: ['sub-orders', nextParams],
        queryFn: () => getSubOrders(nextParams),
        staleTime: 5 * 60 * 1000,
      });
    }
  }, [currentPage, totalPages, params, queryClient]);

  return query;
};

// ────────────────────────────────────────────────────────────────────────────
// Single
// ────────────────────────────────────────────────────────────────────────────
export const useSubOrder = (id: string | null) => {
  return useQuery({
    queryKey: ['sub-orders', id],
    queryFn: () => getSubOrderById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

// ────────────────────────────────────────────────────────────────────────────
// Update (advance status / set tracking number)
// ────────────────────────────────────────────────────────────────────────────
import { getErrorMessage } from '../../types/api';

export const useUpdateSubOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateSubOrderDto }) =>
      updateSubOrder(id, body),
    onSuccess: (updated) => {
      // Invalidate the list and the individual order
      queryClient.invalidateQueries({ queryKey: ['sub-orders'] });
      // Optimistically push the updated record into cache
      queryClient.setQueryData(['sub-orders', updated.id], updated);
      toast.success('Order updated successfully!');
    },
    onError: (err: unknown) => {
      const msg = getErrorMessage(err, 'Failed to update order.');
      toast.error(msg);
    },
  });
};
