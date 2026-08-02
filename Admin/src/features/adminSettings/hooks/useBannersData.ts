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

export const BANNERS_QUERY_KEY = ['admin-banners'];

export const useBannersData = () => {
  const queryClient = useQueryClient();

  const bannersQuery = useQuery({
    queryKey: BANNERS_QUERY_KEY,
    queryFn: async () => {
      const raw = await getAdminBanners();
      return raw.map((b) => ({
        id: b.id,
        name: b.title,
        redirectUrl: b.externalUrl || '',
        isActive: b.isActive,
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
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateBannerPayload }) => {
      const updated = await updateAdminBanner(id, payload);
      if (payload.isActive !== undefined) {
        try {
          await updateAdminBanner(id, { isActive: payload.isActive });
        } catch {
          // ignore status patch fallback error
        }
      }
      return updated;
    },
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
    mutationFn: (id: string) => deleteAdminBanner(id),
    onSuccess: () => {
      toast.success(
        i18n.language === 'ar' ? 'تم حذف البنر بنجاح' : 'Banner deleted successfully'
      );
      queryClient.invalidateQueries({ queryKey: BANNERS_QUERY_KEY });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to delete banner');
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
  };
};
