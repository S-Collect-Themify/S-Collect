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
} from '../../../services/vendors';
import { getAdminProducts } from '../../../services/products';
import { getAdminSubOrders } from '../../../services/orders';
import {
  mapBackendVendorToVendor,
  mapBackendVendorDetailToVendor,
} from '../utils/vendorMapper';

export function useVendors(status?: string) {
  return useQuery({
    queryKey: ['vendors', status],
    queryFn: async () => {
      const data = await getVendors({ status });
      return data.map(mapBackendVendorToVendor);
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
    staleTime: 5 * 60 * 1000,
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

export function useVendorSubOrders(vendorId: string, pageNum = 1, pageSize = 5, status?: string) {
  return useQuery({
    queryKey: ['vendor-sub-orders', vendorId, pageNum, pageSize, status],
    queryFn: async () => {
      if (!vendorId) return { items: [], pagination: { currentPage: 1, pageSize: 5, totalItems: 0, totalPages: 0 } };
      const data = await getAdminSubOrders({ vendorId, pageNum, pageSize, status });
      return data || { items: [], pagination: { currentPage: 1, pageSize: 5, totalItems: 0, totalPages: 0 } };
    },
    enabled: !!vendorId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useVendorPayouts(vendorId: string, pageNum = 1, pageSize = 5) {
  return useQuery({
    queryKey: ['vendor-payouts', vendorId, pageNum, pageSize],
    queryFn: async () => {
      if (!vendorId) return { items: [], pagination: { currentPage: 1, pageSize: 5, totalItems: 0, totalPages: 0 } };
      const data = await getVendorPayouts(vendorId, { pageNum, pageSize });
      return data || { items: [], pagination: { currentPage: 1, pageSize: 5, totalItems: 0, totalPages: 0 } };
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
    mutationFn: (id: string) => deactivateVendor(id),
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
