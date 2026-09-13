import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import {
  getPushCampaigns,
  createPushCampaign,
  type GetPushCampaignsParams,
  type CreatePushCampaignPayload,
} from '../../../services/pushCampaigns';

export function usePushCampaigns(params?: GetPushCampaignsParams) {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  return useQuery({
    queryKey: ['push-campaigns', params, isAr ? 'ar' : 'en'],
    queryFn: () => getPushCampaigns(params),
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useCreatePushCampaign() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (payload: CreatePushCampaignPayload) => createPushCampaign(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['push-campaigns'] });
      toast.success(t('notificationsPage.sendSuccess', 'Push notification sent successfully'));
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        t('notificationsPage.sendError', 'Failed to send push notification');
      toast.error(msg);
    },
  });
}
