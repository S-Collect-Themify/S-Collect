import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  getAdminOrders,
  getAdminOrderDetail,
  updateAdminSubOrderStatus,
  type UpdateSubOrderStatusPayload,
} from '../../../services/orders';

export const useAdminOrders = (pageNum: number = 1, pageSize: number = 20, enabled: boolean = true) => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-orders', pageNum, pageSize],
    queryFn: () => getAdminOrders({ pageNum, pageSize }),
    enabled,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  });

  // Prefetch the next two pages (pageNum + 1 & pageNum + 2) without useEffect
  if (enabled) {
    const totalPages = data?.pagination?.totalPages;

    if (!totalPages || pageNum + 1 <= totalPages) {
      queryClient.prefetchQuery({
        queryKey: ['admin-orders', pageNum + 1, pageSize],
        queryFn: () => getAdminOrders({ pageNum: pageNum + 1, pageSize }),
        staleTime: 5 * 60 * 1000,
      });
    }

    if (!totalPages || pageNum + 2 <= totalPages) {
      queryClient.prefetchQuery({
        queryKey: ['admin-orders', pageNum + 2, pageSize],
        queryFn: () => getAdminOrders({ pageNum: pageNum + 2, pageSize }),
        staleTime: 5 * 60 * 1000,
      });
    }
  }

  return { orders: data?.items, pagination: data?.pagination, isLoading, error };
};

export const useAdminOrderDetail = (id?: string) => {
  return useQuery({
    queryKey: ['admin-order-detail', id],
    queryFn: () => getAdminOrderDetail(id!),
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  });
};

export const useUpdateAdminSubOrderStatus = (orderId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ subOrderId, payload }: { subOrderId: string; payload: UpdateSubOrderStatusPayload }) =>
      updateAdminSubOrderStatus(subOrderId, payload),
    onSuccess: () => {
      toast.success('Sub-order updated successfully');
      if (orderId) {
        queryClient.invalidateQueries({ queryKey: ['admin-order-detail', orderId] });
      }
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message || err?.message || 'Failed to update sub-order';
      toast.error(message);
    },
  });
};
