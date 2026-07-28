import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  getVendors,
  approveVendor,
  rejectVendor,
  deactivateVendor,
  reactivateVendor,
} from '../../../services/vendors';
import { mapBackendVendorToVendor } from '../utils/vendorMapper';

export function useVendors(status?: string) {
  return useQuery({
    queryKey: ['vendors', status],
    queryFn: async () => {
      const data = await getVendors({ status });
      return data.map(mapBackendVendorToVendor);
    },
    retry:2 , 
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
}

export function useApproveVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => approveVendor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
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
      toast.success('Vendor reactivated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to reactivate vendor');
    },
  });
}
