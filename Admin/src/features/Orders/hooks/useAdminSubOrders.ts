import { useQuery } from '@tanstack/react-query';
import {
  getAdminSubOrders,
  type GetAdminSubOrdersParams,
} from '../../../services/orders';

/**
 * Fetches paginated sub-orders from /admin/sub-orders.
 * Used on the Orders page when a vendorId URL param is present,
 * so vendor-specific orders show with proper server-side pagination.
 */
export const useAdminSubOrders = (
  params?: GetAdminSubOrdersParams,
  enabled: boolean = true
) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-sub-orders', params],
    queryFn: () => getAdminSubOrders(params),
    enabled,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  });

  return {
    subOrders: data?.items ?? [],
    pagination: data?.pagination,
    isLoading,
    error,
  };
};
