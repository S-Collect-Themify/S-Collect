import { api } from './api';
import { createAdminBanner } from './banners';


export interface PushCampaign {
  id: string;
  title: string;
  titleAr: string;
  body: string;
  bodyAr: string;
  imageUrl?: string | null;
  totalTokens: number;
  successCount: number;
  failureCount: number;
  createdAt: string;
  sentByVendorId?: string | null;
  sentByAdminId?: string | null;
}

export interface PushCampaignPagination {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface GetPushCampaignsParams {
  pageNum?: number;
  pageSize?: number;
  vendorId?: string;
}

export interface GetPushCampaignsResponseData {
  items: PushCampaign[];
  pagination: PushCampaignPagination;
}

export interface CreatePushCampaignPayload {
  title: string;
  titleAr: string;
  body: string;
  bodyAr: string;
  imageUrl?: string;
  imageFile?: File | null;
}

/**
 * Fetch push campaigns GET /api/v1/admin/push-campaigns
 */
export async function getPushCampaigns(
  params?: GetPushCampaignsParams
): Promise<GetPushCampaignsResponseData> {
  const cleanParams: Record<string, unknown> = {};
  if (params?.pageNum) cleanParams.pageNum = params.pageNum;
  if (params?.pageSize) cleanParams.pageSize = params.pageSize;
  if (params?.vendorId && params.vendorId.trim()) cleanParams.vendorId = params.vendorId.trim();

  const response = await api.get('/admin/push-campaigns', { params: cleanParams });
  const raw = response.data;
  const pageNum = params?.pageNum || 1;
  const pageSize = params?.pageSize || 20;

  if (raw?.data && typeof raw.data === 'object' && Array.isArray(raw.data.items)) {
    return {
      items: raw.data.items,
      pagination: raw.data.pagination || {
        currentPage: pageNum,
        pageSize,
        totalItems: raw.data.items.length,
        totalPages: Math.max(1, Math.ceil(raw.data.items.length / pageSize)),
      },
    };
  }

  if (raw?.items && Array.isArray(raw.items)) {
    return {
      items: raw.items,
      pagination: raw.pagination || {
        currentPage: pageNum,
        pageSize,
        totalItems: raw.items.length,
        totalPages: Math.max(1, Math.ceil(raw.items.length / pageSize)),
      },
    };
  }

  if (Array.isArray(raw?.data)) {
    return {
      items: raw.data,
      pagination: {
        currentPage: pageNum,
        pageSize,
        totalItems: raw.data.length,
        totalPages: Math.max(1, Math.ceil(raw.data.length / pageSize)),
      },
    };
  }

  if (Array.isArray(raw)) {
    return {
      items: raw,
      pagination: {
        currentPage: pageNum,
        pageSize,
        totalItems: raw.length,
        totalPages: Math.max(1, Math.ceil(raw.length / pageSize)),
      },
    };
  }

  return {
    items: [],
    pagination: { currentPage: pageNum, pageSize, totalItems: 0, totalPages: 1 },
  };
}

/**
 * Broadcast a new push campaign via POST /api/v1/admin/push-campaigns
 */
export async function createPushCampaign(
  payload: CreatePushCampaignPayload
): Promise<PushCampaign> {
  let finalImageUrl = payload.imageUrl?.trim();

  // If a local image file was uploaded, upload it to storage to get a public URL
  if (payload.imageFile instanceof File) {
    // 1. Try sending multipart/form-data directly to /admin/push-campaigns
    try {
      const formData = new FormData();
      formData.append('title', payload.title.trim());
      formData.append('titleAr', payload.titleAr.trim());
      formData.append('body', payload.body.trim());
      formData.append('bodyAr', payload.bodyAr.trim());
      formData.append('image', payload.imageFile);
      formData.append('file', payload.imageFile);

      const response = await api.post('/admin/push-campaigns', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const raw = response.data;
      return raw?.data || raw;
    } catch {
      // 2. Direct multipart post failed; upload the file via banners storage endpoint to get the hosted media URL
      try {
        const tempBanner = await createAdminBanner({
          title: `Push Campaign Image - ${payload.title.trim()}`,
          linkType: 'EXTERNAL_URL',
          externalUrl: 'https://example.com',
          image: payload.imageFile,
          isActive: false,
        });

        const uploadedUrl =
          tempBanner?.imageUrl ||
          (tempBanner as any)?.data?.imageUrl ||
          (tempBanner as any)?.image;

        if (uploadedUrl && typeof uploadedUrl === 'string') {
          finalImageUrl = uploadedUrl;
        }
      } catch (uploadErr: any) {
        console.warn('Banner storage upload failed, trying category storage upload...', uploadErr);
        try {
          const catFormData = new FormData();
          catFormData.append('name', 'Temp Push Image');
          catFormData.append('nameAr', 'Temp Push Image');
          catFormData.append('slug', 'temp-push-' + Date.now());
          catFormData.append('image', payload.imageFile);

          const catRes = await api.post('/admin/categories', catFormData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          const catData = catRes.data?.data || catRes.data;
          const uploadedUrl = catData?.imageUrl || catData?.image;

          if (uploadedUrl && typeof uploadedUrl === 'string') {
            finalImageUrl = uploadedUrl;
          }
        } catch (catErr: any) {
          console.error('All storage upload attempts failed:', catErr);
          const serverMessage =
            catErr?.response?.data?.message ||
            uploadErr?.response?.data?.message ||
            catErr?.message ||
            uploadErr?.message;
          throw new Error(
            serverMessage
              ? `Failed to upload image file: ${Array.isArray(serverMessage) ? serverMessage.join(', ') : serverMessage}`
              : 'Failed to upload image file. Please try again.'
          );
        }
      }

    }
  }


  const body: Record<string, unknown> = {
    title: payload.title.trim(),
    titleAr: payload.titleAr.trim(),
    body: payload.body.trim(),
    bodyAr: payload.bodyAr.trim(),
  };

  if (finalImageUrl) {
    body.imageUrl = finalImageUrl;
  }

  const response = await api.post('/admin/push-campaigns', body);
  const raw = response.data;
  return raw?.data || raw;
}


