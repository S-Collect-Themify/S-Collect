import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import i18n from '../../../i18n';
import { getAdminShippingZones, updateAdminShippingZoneStatus } from '../../../services/shipping';
import type { ShippingZoneItem } from '../types';

export const SHIPPING_ZONES_QUERY_KEY = ['admin-shipping-zones'];

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
        vendorsCount: z.vendorsCount ?? 0,
        isActive: z.isEnabled ?? true,
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
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to update zone status');
    },
  });

  return {
    shippingZones: shippingZonesQuery.data || [],
    isLoading: shippingZonesQuery.isLoading,
    isError: shippingZonesQuery.isError,
    error: shippingZonesQuery.error,
    refetch: shippingZonesQuery.refetch,
    toggleZoneMutation,
  };
};
