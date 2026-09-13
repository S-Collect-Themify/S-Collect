import { api, handleServiceError } from './api';
import type {
  PushCampaign,
  CreatePushCampaignDto,
  PushCampaignsResponse,
  PushCampaignQueryParams,
} from '../features/campaigns/types';

// Helper: safe unwrap for standard API envelope { success: true, data: ... } or raw payload
const unwrap = <T>(res: unknown): T => {
  if (res && typeof res === 'object' && 'data' in res && 'success' in res) {
    return (res as { data: T }).data;
  }
  return res as T;
};

/**
 * List push campaigns sent by this vendor
 * GET /api/v1/vendor/push-campaigns?pageNum=1&pageSize=25
 */
export const getPushCampaigns = async (
  params?: PushCampaignQueryParams
): Promise<PushCampaignsResponse> => {
  try {
    const { data } = await api.get('/vendor/push-campaigns', {
      params: {
        pageNum: params?.pageNum ?? 1,
        pageSize: params?.pageSize ?? 25,
      },
    });

    const result = unwrap<PushCampaignsResponse>(data);
    return {
      items: Array.isArray(result?.items) ? result.items : [],
      pagination: result?.pagination || {
        currentPage: params?.pageNum ?? 1,
        pageSize: params?.pageSize ?? 25,
        totalItems: Array.isArray(result?.items) ? result.items.length : 0,
        totalPages: 1,
      },
    };
  } catch (err) {
    throw handleServiceError(err, 'Failed to fetch push campaigns');
  }
};

/**
 * Send a push notification to all buyers
 * POST /api/v1/vendor/push-campaigns
 */
export const sendPushCampaign = async (
  dto: CreatePushCampaignDto
): Promise<PushCampaign> => {
  try {
    const { data } = await api.post('/vendor/push-campaigns', dto);
    return unwrap<PushCampaign>(data);
  } catch (err) {
    throw handleServiceError(err, 'Failed to send push campaign');
  }
};
