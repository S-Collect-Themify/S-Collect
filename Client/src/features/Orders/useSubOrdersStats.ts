import { useQuery } from '@tanstack/react-query';
import {
  getVendorOrderStats,
  type VendorOrderStats,
} from '../../services/orders';

export const VENDOR_SUB_ORDERS_STATS_QUERY_KEY = ['vendorSubOrdersStats'];

export const useSubOrdersStats = () => {
  return useQuery<VendorOrderStats>({
    queryKey: VENDOR_SUB_ORDERS_STATS_QUERY_KEY,
    queryFn: getVendorOrderStats,
    refetchOnWindowFocus: false,
    retry: 1,
  });
};
