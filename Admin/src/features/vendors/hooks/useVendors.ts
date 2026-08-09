import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  getVendors,
  getVendorById,
  approveVendor,
  rejectVendor,
  deactivateVendor,
  reactivateVendor,
  getVendorPayouts,
  getVendorPayoutSummary,
  getVendorPayoutStats,
  featureVendor,
  unfeatureVendor,
  type GetVendorsParams,
} from '../../../services/vendors';
import { getAdminProducts } from '../../../services/products';
import { getAdminSubOrders } from '../../../services/orders';
import { getAdminCategories } from '../../../services/categories';
import {
  mapBackendVendorToVendor,
  mapBackendVendorDetailToVendor,
} from '../utils/vendorMapper';

export function useVendorCategories() {
  return useQuery({
    queryKey: ['vendor-categories'],
    queryFn: async () => {
      try {
        const items = await getAdminCategories({ pageNum: 1, pageSize: 100 });
        return (items || [])
          .map((c) => c.nameEn || c.name || c.nameAr)
          .filter((name): name is string => Boolean(name));
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useVendors(params?: string | GetVendorsParams) {
  const queryParams: GetVendorsParams =
    typeof params === 'string' ? { status: params } : params || {};

  return useQuery({
    queryKey: ['vendors', queryParams],
    queryFn: async () => {
      const data = await getVendors(queryParams);
      const items = (data.items || []).map(mapBackendVendorToVendor);
      return Object.assign(items, {
        items,
        pagination: data.pagination || {
          currentPage: 1,
          pageSize: items.length || 25,
          totalItems: items.length,
          totalPages: 1,
        },
      });
    },
    retry: 2,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
}

export function useVendorDetails(id: string) {
  return useQuery({
    queryKey: ['vendor', id],
    queryFn: async () => {
      if (!id) return null;
      const data = await getVendorById(id);
      return mapBackendVendorDetailToVendor(data);
    },
    enabled: !!id,
    retry: 2,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
}

export function useVendorProducts(vendorId: string, pageNum = 1, pageSize = 5) {
  return useQuery({
    queryKey: ['vendor-products', vendorId, pageNum, pageSize],
    queryFn: async () => {
      if (!vendorId) return { items: [], pagination: { currentPage: 1, pageSize: 5, totalItems: 0, totalPages: 0 } };
      const data = await getAdminProducts({ vendorId, pageNum, pageSize });
      return data || { items: [], pagination: { currentPage: 1, pageSize: 5, totalItems: 0, totalPages: 0 } };
    },
    enabled: !!vendorId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useVendorSubOrders(vendorId: string, pageNum = 1, pageSize = 5) {
  return useQuery({
    queryKey: ['vendor-orders', vendorId, pageNum, pageSize],
    queryFn: async () => {
      if (!vendorId) return { items: [], pagination: { currentPage: 1, pageSize: 5, totalItems: 0, totalPages: 0 } };
      const data = await getAdminSubOrders({ vendorId, pageNum, pageSize });
      return data || { items: [], pagination: { currentPage: 1, pageSize: 5, totalItems: 0, totalPages: 0 } };
    },
    enabled: !!vendorId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useVendorPayouts(vendorId: string, pageNum = 1, pageSize = 25) {
  return useQuery({
    queryKey: ['vendor-payouts', vendorId, pageNum, pageSize],
    queryFn: async () => {
      if (!vendorId) return { items: [], pagination: { currentPage: 1, pageSize: 25, totalItems: 0, totalPages: 0 } };
      const data = await getVendorPayouts(vendorId, { pageNum, pageSize });
      return data || { items: [], pagination: { currentPage: 1, pageSize: 25, totalItems: 0, totalPages: 0 } };
    },
    enabled: !!vendorId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useVendorPayoutSummary(vendorId: string) {
  return useQuery({
    queryKey: ['vendor-payout-summary', vendorId],
    queryFn: async () => {
      if (!vendorId) return null;
      return await getVendorPayoutSummary(vendorId);
    },
    enabled: !!vendorId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useVendorPayoutStats(vendorId: string) {
  return useQuery({
    queryKey: ['vendor-payout-stats', vendorId],
    queryFn: async () => {
      if (!vendorId) return null;
      return await getVendorPayoutStats(vendorId);
    },
    enabled: !!vendorId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useApproveVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => approveVendor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: ['vendor'] });
      toast.success('Vendor approved successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to approve vendor');
    },
  });
}

export function useRejectVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      rejectVendor(id, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: ['vendor'] });
      toast.success('Vendor rejected successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to reject vendor');
    },
  });
}

export function useDeactivateVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (param: string | { id: string; reason?: string }) => {
      const vendorId = typeof param === 'string' ? param : param.id;
      const reason = typeof param === 'object' ? param.reason : undefined;
      return deactivateVendor(vendorId, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: ['vendor'] });
      toast.success('Vendor deactivated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to deactivate vendor');
    },
  });
}

export function useReactivateVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => reactivateVendor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: ['vendor'] });
      toast.success('Vendor reactivated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to reactivate vendor');
    },
  });
}

export function useFeatureVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => featureVendor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: ['vendor'] });
      toast.success('Vendor marked as featured');
    },
    onError: (error: any) => {
      console.error('Failed to feature vendor:', error);
      const message = error?.response?.data?.message || error?.message;
      toast.error(message || 'Failed to feature vendor');
    },
  });
}

export function useUnfeatureVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => unfeatureVendor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: ['vendor'] });
      toast.success('Vendor unmarked as featured');
    },
    onError: (error: any) => {
      console.error('Failed to unfeature vendor:', error);
      const message = error?.response?.data?.message || error?.message;
      toast.error(message || 'Failed to unfeature vendor');
    },
  });
}
