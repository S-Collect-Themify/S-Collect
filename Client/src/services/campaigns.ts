import { api, handleServiceError, ServiceError } from './api';
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
 * Upload an image file to server storage to obtain a valid public HTTPS URL.
 * Push notification services (FCM/APNs) reject base64 data URLs with HTTP 500.
 */
const uploadCampaignImage = async (file: File): Promise<string> => {
  // 1. Try vendor product image storage (vendors have authorization to upload images to their products)
  try {
    const searchRes = await api.post('/vendor/products/search', {
      pageNum: 1,
      pageSize: 1,
    });
    const searchData = searchRes.data?.data || searchRes.data;
    const items = searchData?.items || (Array.isArray(searchData) ? searchData : []);
    if (Array.isArray(items) && items.length > 0 && items[0]?.id) {
      const productId = items[0].id;
      const formData = new FormData();
      formData.append('file', file);
      const imgRes = await api.post(`/vendor/products/${productId}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const imgData = imgRes.data?.data || imgRes.data;
      const uploadedUrl = imgData?.url || imgData?.imageUrl;
      if (uploadedUrl && typeof uploadedUrl === 'string' && /^https?:\/\//i.test(uploadedUrl)) {
        return uploadedUrl;
      }
    }
  } catch (prodErr) {
    console.warn('Vendor product image upload attempt failed:', prodErr);
  }

  // 2. Try admin banner upload if current session has admin privileges
  try {
    const bannerFormData = new FormData();
    bannerFormData.append('title', `Push Campaign Image - ${Date.now()}`);
    bannerFormData.append('linkType', 'EXTERNAL_URL');
    bannerFormData.append('externalUrl', 'https://example.com');
    bannerFormData.append('image', file);
    bannerFormData.append('isActive', 'false');

    const bannerRes = await api.post('/admin/content/banners', bannerFormData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const bannerData = bannerRes.data?.data || bannerRes.data;
    const uploadedUrl = bannerData?.imageUrl || bannerData?.image;
    if (uploadedUrl && typeof uploadedUrl === 'string' && /^https?:\/\//i.test(uploadedUrl)) {
      return uploadedUrl;
    }
  } catch {
    // Ignored if not admin
  }

  throw new ServiceError(
    'تعذر رفع صورة الإشعار على الخادم. يرجى إدخال رابط الصورة مباشرة أو التأكد من وجود منتج واحد على الأقل في المتجر.',
    400
  );
};

/**
 * Send a push notification to all buyers
 * POST /api/v1/vendor/push-campaigns
 */
export const sendPushCampaign = async (
  dto: CreatePushCampaignDto
): Promise<PushCampaign> => {
  let finalImageUrl = dto.imageUrl?.trim();

  // If a local image file was uploaded, upload it to storage to get a hosted URL
  if (dto.imageFile instanceof File) {
    finalImageUrl = await uploadCampaignImage(dto.imageFile);
  }

  // Ensure imageUrl is an HTTP/HTTPS URL if present (FCM / APNs requirement)
  if (finalImageUrl && !/^https?:\/\//i.test(finalImageUrl)) {
    throw new ServiceError(
      'يجب أن يكون رابط صورة الإشعار رابط إنترنت صالح يبدأ بـ http أو https.',
      400
    );
  }

  // The backend contract (CreatePushCampaignDto) expects JSON with title, titleAr, body, bodyAr
  const body: Record<string, unknown> = {
    title: dto.title.trim(),
    body: dto.body.trim(),
    titleAr: (dto.titleAr || dto.title).trim(),
    bodyAr: (dto.bodyAr || dto.body).trim(),
  };

  if (finalImageUrl) {
    body.imageUrl = finalImageUrl;
  }

  try {
    const { data } = await api.post('/vendor/push-campaigns', body);
    return unwrap<PushCampaign>(data);
  } catch (err) {
    throw handleServiceError(err, 'Failed to send push campaign');
  }
};
