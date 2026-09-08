import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import i18n from '../../../i18n';
import {
  getAdminShippingZones,
  updateAdminShippingZoneStatus,
  updateAdminShippingZoneRate,
} from '../../../services/shipping';
import type { ShippingZoneItem } from '../types';

export const SHIPPING_ZONES_QUERY_KEY = ['admin-shipping-zones'];

const EMPTY_ZONES: ShippingZoneItem[] = [];

export interface ZoneRateUpdate {
  code: string;
  rate: number;
}

type MutationError = {
  response?: { data?: { message?: string } };
  message?: string;
};

export const useShippingZonesData = () => {
  const queryClient = useQueryClient();
  const isArabic = i18n.language === 'ar';

  const shippingZonesQuery = useQuery({
    queryKey: SHIPPING_ZONES_QUERY_KEY,
    queryFn: async (): Promise<ShippingZoneItem[]> => {
      const raw = await getAdminShippingZones();
      return raw.map((z) => ({
        id: z.id,
        code: z.code,
        nameEn: z.nameEn,
        nameAr: z.nameAr,
        name: isArabic ? z.nameAr || z.nameEn : z.nameEn || z.nameAr,
        vendorsCount: z.vendorCount ?? z.vendorsCount ?? 0,
        isActive: z.isEnabled ?? true,
        rate: Number(z.rate ?? z.price ?? z.shippingRate ?? 0) || 0,
      }));
    },
    staleTime: 2 * 60 * 1000,
  });

  const toggleZoneMutation = useMutation({
    mutationFn: ({ code, isEnabled }: { code: string; isEnabled: boolean }) =>
      updateAdminShippingZoneStatus(code, isEnabled),
    onSuccess: () => {
      toast.success(
        i18n.language === 'ar' ? 'تم تحديث حالة المنطقة بنجاح' : 'Zone status updated successfully'
      );
      queryClient.invalidateQueries({ queryKey: SHIPPING_ZONES_QUERY_KEY });
    },
    onError: (err: MutationError) => {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to update zone status');
    },
  });

  const saveZoneRatesMutation = useMutation({
    mutationFn: (updates: ZoneRateUpdate[]) =>
      Promise.all(updates.map((u) => updateAdminShippingZoneRate(u.code, u.rate))),
    onSuccess: () => {
      toast.success(
        i18n.language === 'ar'
          ? 'تم تحديث أسعار المناطق بنجاح'
          : 'Zone prices updated successfully'
      );
    },
    onError: (err: MutationError) => {
      toast.error(
        err?.response?.data?.message || err?.message || 'Failed to update zone prices'
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: SHIPPING_ZONES_QUERY_KEY });
    },
  });

  return {
    shippingZones: shippingZonesQuery.data ?? EMPTY_ZONES,
    isLoading: shippingZonesQuery.isLoading,
    isError: shippingZonesQuery.isError,
    error: shippingZonesQuery.error,
    refetch: shippingZonesQuery.refetch,
    toggleZoneMutation,
    saveZoneRatesMutation,
  };
};
