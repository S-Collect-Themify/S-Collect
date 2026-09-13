import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
  getPushCampaigns,
  sendPushCampaign,
} from '../../../services/campaigns';
import { campaignKeys } from '../campaignKeys';
import type {
  CreatePushCampaignDto,
  PushCampaign,
  PushCampaignQueryParams,
  PushCampaignsResponse,
} from '../types';

/**
 * Fetch push campaigns with pagination
 */
export const useCampaigns = (params?: PushCampaignQueryParams) => {
  return useQuery<PushCampaignsResponse>({
    queryKey: campaignKeys.list(params as Record<string, unknown>),
    queryFn: () => getPushCampaigns(params),
    staleTime: 30000,
  });
};

/**
 * Send a new push campaign
 */
export const useCreateCampaign = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation<PushCampaign, Error, CreatePushCampaignDto>({
    mutationFn: (dto: CreatePushCampaignDto) => sendPushCampaign(dto),
    onSuccess: (createdCampaign) => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
      const successCount = createdCampaign?.successCount ?? 0;
      const totalTokens = createdCampaign?.totalTokens ?? 0;

      if (totalTokens > 0) {
        toast.success(
          t(
            'campaigns.toasts.sendSuccessDetailed',
            'Notification sent to {{success}} of {{total}} recipients!',
            {
              success: successCount,
              total: totalTokens,
            }
          )
        );
      } else {
        toast.success(
          t('campaigns.toasts.sendSuccess', 'Push notification sent successfully!')
        );
      }
    },
    onError: (err: Error) => {
      const message =
        err?.message ||
        t('campaigns.toasts.sendError', 'Failed to send push campaign');
      toast.error(message);
    },
  });
};
