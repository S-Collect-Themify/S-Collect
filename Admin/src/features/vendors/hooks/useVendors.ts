import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  getVendors,
  approveVendor,
  rejectVendor,
  deactivateVendor,
  reactivateVendor,
  type BackendVendor,
} from '../../../services/vendors';
import type { Vendor, VendorStatus } from '../types/vendors';

export function mapBackendVendorToVendor(v: BackendVendor): Vendor {
  const ownerName = [v.firstName, v.lastName].filter(Boolean).join(' ').trim() || 'N/A';
  const businessName = v.storeName || ownerName || 'Vendor';

  let status: VendorStatus = 'pending';
  let active = false;

  if (v.status === 'ACTIVE') {
    status = 'approved';
    active = true;
  } else if (v.status === 'DEACTIVATED') {
    status = 'approved';
    active = false;
  } else if (v.status === 'REJECTED') {
    status = 'suspended';
    active = false;
  } else if (v.status === 'PENDING_APPROVAL') {
    status = 'pending';
    active = false;
  }

  const submittedDate = v.createdAt
    ? new Date(v.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'N/A';

  return {
    id: v.id,
    businessName,
    owner: ownerName,
    email: v.commercialRegisterNumber ? `CR: ${v.commercialRegisterNumber}` : 'N/A',
    submittedDate,
    category: v.isFeatured ? 'Featured' : 'General',
    status,
    active,
    taxId: v.commercialRegisterNumber,
    revenue: 0,
    orders: 0,
    createdAt: v.createdAt,
  };
}

export function useVendors(status?: string) {
  return useQuery({
    queryKey: ['vendors', status],
    queryFn: async () => {
      let rawVendors: BackendVendor[] = [];

      if (status && status.includes(',')) {
        const statusList = status.split(',').map((s) => s.trim());
        const results = await Promise.all(
          statusList.map((s) => getVendors({ status: s }))
        );
        rawVendors = results.flat();
      } else {
        rawVendors = await getVendors({ status });
      }

      // Sort by creation / update date descending (latest first)
      rawVendors.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        if (timeA !== timeB) {
          return timeB - timeA;
        }
        return b.id.localeCompare(a.id);
      });

      return rawVendors.map(mapBackendVendorToVendor);
    },
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
