import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  getAdminOrders,
  getAdminOrderDetail,
  updateAdminSubOrderStatus,
  type GetAdminOrdersParams,
  type UpdateSubOrderStatusPayload,
} from '../../../services/orders';

export const useAdminOrders = (
  params?: GetAdminOrdersParams,
  enabled: boolean = true
) => {
  const queryClient = useQueryClient();
  const pageNum = params?.pageNum ?? 1;
  const pageSize = params?.pageSize ?? 20;

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-orders', params],
    queryFn: () => getAdminOrders(params),
    enabled,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  });

  // Prefetch the next page
  if (enabled && data?.pagination) {
    const totalPages = data.pagination.totalPages;

    if (pageNum + 1 <= totalPages) {
      queryClient.prefetchQuery({
        queryKey: ['admin-orders', { ...params, pageNum: pageNum + 1, pageSize }],
        queryFn: () => getAdminOrders({ ...params, pageNum: pageNum + 1, pageSize }),
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
