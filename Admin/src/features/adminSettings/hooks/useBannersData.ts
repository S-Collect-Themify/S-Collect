import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import i18n from '../../../i18n';
import {
  getAdminBanners,
  createAdminBanner,
  updateAdminBanner,
  deleteAdminBanner,
  type CreateBannerPayload,
  type UpdateBannerPayload,
} from '../../../services/banners';
import type { BannerItem } from '../types';

export const BANNERS_QUERY_KEY = ['admin-banners'];

export const useBannersData = () => {
  const queryClient = useQueryClient();

  const bannersQuery = useQuery({
    queryKey: BANNERS_QUERY_KEY,
    queryFn: async (): Promise<BannerItem[]> => {
      const raw = await getAdminBanners();
      return raw.map((b) => ({
        id: b.id,
        name: b.title,
        redirectUrl: b.externalUrl || '',
        isActive: b.isActive === true || (b.isActive as any) === 1 || String(b.isActive) === 'true',
        dateAdded: b.createdAt
          ? new Date(b.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })
          : '',
        imageUrl: b.imageUrl,
        linkType: b.linkType,
        linkTargetId: b.linkTargetId,
        externalUrl: b.externalUrl,
        startsAt: b.startsAt,
        endsAt: b.endsAt,
        sortOrder: b.sortOrder,
      }));
    },
    staleTime: 2 * 60 * 1000,
  });

  const createBannerMutation = useMutation({
    mutationFn: (payload: CreateBannerPayload) => createAdminBanner(payload),
    onSuccess: () => {
      toast.success(
        i18n.language === 'ar' ? 'تم إضافة البنر بنجاح' : 'Banner created successfully'
      );
      queryClient.invalidateQueries({ queryKey: BANNERS_QUERY_KEY });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to create banner');
    },
  });

  const updateBannerMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateBannerPayload }) =>
      updateAdminBanner(id, payload),
    onSuccess: () => {
      toast.success(
        i18n.language === 'ar' ? 'تم تحديث البنر بنجاح' : 'Banner updated successfully'
      );
      queryClient.invalidateQueries({ queryKey: BANNERS_QUERY_KEY });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to update banner');
    },
  });

  const deleteBannerMutation = useMutation({
    mutationFn: async (id: string) => {
      // 1. Delete target banner
      await deleteAdminBanner(id);

      // 2. Re-index remaining banners' sortOrder sequentially (1, 2, 3...)
      const currentBanners = bannersQuery.data || [];
      const remainingBanners = currentBanners.filter((b) => b.id !== id);

      if (remainingBanners.length > 0) {
        await Promise.all(
          remainingBanners.map((b, idx) =>
            updateAdminBanner(b.id, { sortOrder: idx + 1 })
          )
        );
      }
    },
    onSuccess: () => {
      toast.success(
        i18n.language === 'ar' ? 'تم حذف البنر وتحديث الترتيب بنجاح' : 'Banner deleted successfully'
      );
      queryClient.invalidateQueries({ queryKey: BANNERS_QUERY_KEY });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to delete banner');
    },
  });

  const saveOrderMutation = useMutation({
    mutationFn: async (orderedBanners: BannerItem[]) => {
      await Promise.all(
        orderedBanners.map((b, idx) =>
          updateAdminBanner(b.id, { sortOrder: idx + 1 })
        )
      );
    },
    onSuccess: () => {
      toast.success(
        i18n.language === 'ar'
          ? 'تم حفظ ترتيب البانرات بنجاح'
          : 'Banner order saved successfully'
      );
      queryClient.invalidateQueries({ queryKey: BANNERS_QUERY_KEY });
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message || err?.message || 'Failed to save banner order'
      );
    },
  });

  return {
    banners: bannersQuery.data || [],
    isLoading: bannersQuery.isLoading,
    isError: bannersQuery.isError,
    error: bannersQuery.error,
    refetch: bannersQuery.refetch,
    createBannerMutation,
    updateBannerMutation,
    deleteBannerMutation,
    saveOrderMutation,
  };
};
