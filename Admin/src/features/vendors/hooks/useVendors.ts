import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import axios from 'axios';
import {
  getVendors,
  getVendorById,
  approveVendor,
  rejectVendor,
  deactivateVendor,
  reactivateVendor,
  deleteVendor,
  updateVendor,
  createVendor,
  getVendorPayouts,
  getVendorPayoutSummary,
  getVendorPayoutStats,
  featureVendor,
  unfeatureVendor,
  getTopPerformingVendors,
  type GetVendorsParams,
  type GetTopPerformingVendorsParams,
  type UpdateVendorPayload,
  type CreateVendorPayload,
  type BackendVendorsResponse,
} from '../../../services/vendors';
import { getAdminProducts } from '../../../services/products';
import { getAdminSubOrders } from '../../../services/orders';
import { getAdminCategories } from '../../../services/categories';
import {
  mapBackendVendorToVendor,
  mapBackendVendorDetailToVendor,
} from '../utils/vendorMapper';
import type { Vendor } from '../types/vendors';

function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message || fallback;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}

export function useVendorCategories() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  return useQuery<string[]>({
    queryKey: ['vendor-categories', isAr ? 'ar' : 'en'],
    queryFn: async (): Promise<string[]> => {
      try {
        const items = await getAdminCategories({ pageNum: 1, pageSize: 100 });
        return (items || [])
          .map((c: any) => {
            const nameAr = (c.nameAr || c.name_ar) as string | undefined;
            const nameEn = (c.nameEn || c.name) as string | undefined;
            return isAr
              ? nameAr || nameEn
              : nameEn || nameAr;
          })
          .filter((name: unknown): name is string => typeof name === 'string' && Boolean(name));
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}

export type ExtendedVendorsList = Vendor[] & {
  items: Vendor[];
  pagination: BackendVendorsResponse['pagination'];
};

export function useVendors(params?: string | GetVendorsParams) {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const queryParams: GetVendorsParams =
    typeof params === 'string' ? { status: params } : params || {};

  return useQuery<ExtendedVendorsList>({
    queryKey: ['vendors', queryParams, isAr ? 'ar' : 'en'],
    queryFn: async (): Promise<ExtendedVendorsList> => {
      const data = await getVendors(queryParams);
      const items = (data.items || []).map((v) => mapBackendVendorToVendor(v, isAr));
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
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  return useQuery<Vendor | null>({
    queryKey: ['vendor', id, isAr ? 'ar' : 'en'],
    queryFn: async () => {
      if (!id) return null;
      try {
        const data = await getVendorById(id);
        return mapBackendVendorDetailToVendor(data, isAr);
      } catch (err: any) {
        if (err?.response?.status === 404) {
          return null;
        }
        throw err;
      }
    },
    enabled: Boolean(id && id.trim() !== ''),
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 404) return false;
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

/** Raw backend vendor object — used to prefill the edit form. */
export function useVendorRawDetails(id: string) {
  return useQuery({
    queryKey: ['vendor-raw', id],
    queryFn: async () => {
      if (!id) return null;
      return getVendorById(id);
    },
    enabled: !!id,
    retry: 2,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useCreateVendor() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (payload: CreateVendorPayload) => createVendor(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      toast.success(t('vendors.notifications.createSuccess', 'Vendor created successfully'));
    },
    onError: (error: unknown) => {
      console.error('Failed to create vendor:', error);
      const message = getErrorMessage(error, t('vendors.notifications.createError', 'Failed to create vendor'));
      toast.error(message);
    },
  });
}

export function useUpdateVendor() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateVendorPayload }) =>
      updateVendor(id, payload),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: ['vendor'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-raw', id] });
      toast.success(t('vendors.notifications.updateSuccess', 'Vendor updated successfully'));
    },
    onError: (error: unknown) => {
      console.error('Failed to update vendor:', error);
      const message = getErrorMessage(error, t('vendors.notifications.updateError', 'Failed to update vendor'));
      toast.error(message);
    },
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
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (id: string) => approveVendor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: ['vendor'] });
      toast.success(t('vendors.notifications.approveSuccess', 'Vendor approved successfully'));
    },
    onError: (error: Error) => {
      toast.error(error.message || t('vendors.notifications.approveError', 'Failed to approve vendor'));
    },
  });
}

export function useRejectVendor() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      rejectVendor(id, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: ['vendor'] });
      toast.success(t('vendors.notifications.rejectSuccess', 'Vendor rejected successfully'));
    },
    onError: (error: Error) => {
      toast.error(error.message || t('vendors.notifications.rejectError', 'Failed to reject vendor'));
    },
  });
}

export function useDeactivateVendor() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (param: string | { id: string; reason?: string }) => {
      const vendorId = typeof param === 'string' ? param : param.id;
      const reason = typeof param === 'object' ? param.reason : undefined;
      return deactivateVendor(vendorId, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: ['vendor'] });
      toast.success(t('vendors.notifications.deactivateSuccess', 'Vendor deactivated successfully'));
    },
    onError: (error: Error) => {
      toast.error(error.message || t('vendors.notifications.deactivateError', 'Failed to deactivate vendor'));
    },
  });
}

export function useReactivateVendor() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (id: string) => reactivateVendor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: ['vendor'] });
      toast.success(t('vendors.notifications.reactivateSuccess', 'Vendor reactivated successfully'));
    },
    onError: (error: Error) => {
      toast.error(error.message || t('vendors.notifications.reactivateError', 'Failed to reactivate vendor'));
    },
  });
}

export function useDeleteVendor() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (id: string) => deleteVendor(id),
    onSuccess: (_data, id) => {
      // Optimistically drop the deleted vendor from every cached vendors list
      queryClient.setQueriesData<any>({ queryKey: ['vendors'] }, (old: any) => {
        if (!old) return old;
        const arr: Vendor[] = Array.isArray(old) ? old : old.items || [];
        if (!Array.isArray(arr)) return old;
        const filtered = arr.filter((v) => v.id !== id);
        return Object.assign(filtered, {
          items: filtered,
          pagination: Array.isArray(old) ? undefined : old.pagination,
        });
      });
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: ['vendor'] });
      toast.success(t('vendors.notifications.deleteSuccess', 'Vendor deleted successfully'));
    },
    onError: (error: unknown) => {
      console.error('Failed to delete vendor:', error);
      const message = getErrorMessage(error, t('vendors.notifications.deleteError', 'Failed to delete vendor'));
      toast.error(message);
    },
  });
}

export function useFeatureVendor() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (id: string) => featureVendor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: ['vendor'] });
      toast.success(t('vendors.notifications.featureSuccess', 'Vendor marked as featured'));
    },
    onError: (error: unknown) => {
      console.error('Failed to feature vendor:', error);
      const message = getErrorMessage(error, t('vendors.notifications.featureError', 'Failed to feature vendor'));
      toast.error(message);
    },
  });
}

export function useUnfeatureVendor() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (id: string) => unfeatureVendor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: ['vendor'] });
      toast.success(t('vendors.notifications.unfeatureSuccess', 'Vendor unmarked as featured'));
    },
    onError: (error: unknown) => {
      console.error('Failed to unfeature vendor:', error);
      const message = getErrorMessage(error, t('vendors.notifications.unfeatureError', 'Failed to unfeature vendor'));
      toast.error(message);
    },
  });
}

export function useTopPerformingVendors(params?: GetTopPerformingVendorsParams) {
  return useQuery({
    queryKey: ['top-performing-vendors', params],
    queryFn: () => getTopPerformingVendors(params),
    staleTime: 3 * 60 * 1000,
  });
}
