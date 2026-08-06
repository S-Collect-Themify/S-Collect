import { api } from './api';

// ─── Types ────────────────────────────────────────────────────────────────────

export type BannerLinkType = 'CATEGORY' | 'PRODUCT' | 'VENDOR' | 'EXTERNAL_URL';

export interface ApiBanner {
  id: string;
  title: string;
  imageUrl: string;
  linkType: BannerLinkType;
  linkTargetId: string | null;
  externalUrl: string | null;
  startsAt: string | null;
  endsAt: string | null;
  sortOrder: number | null;
  isActive: boolean;
  createdAt: string;
}

export interface CreateBannerPayload {
  title: string;
  linkType: BannerLinkType;
  image: File;
  linkTargetId?: string;
  externalUrl?: string;
  startsAt?: string;
  endsAt?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateBannerPayload {
  title?: string;
  linkType?: BannerLinkType;
  image?: File | null;
  linkTargetId?: string | null;
  externalUrl?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
  sortOrder?: number | null;
  isActive?: boolean;
}

// ─── API Calls ────────────────────────────────────────────────────────────────

function extractBanners(data: unknown): ApiBanner[] {
  if (Array.isArray(data)) return data;
  const obj = data as Record<string, unknown>;
  if (Array.isArray(obj?.data)) return obj.data as ApiBanner[];
  if (Array.isArray(obj?.banners)) return obj.banners as ApiBanner[];
  if (obj?.data && typeof obj.data === 'object' && Array.isArray((obj.data as any).items))
    return (obj.data as any).items as ApiBanner[];
  return [];
}

export const getAdminBanners = async (): Promise<ApiBanner[]> => {
  const { data } = await api.get('/admin/content/banners');
  return extractBanners(data);
};

export const createAdminBanner = async (payload: CreateBannerPayload): Promise<ApiBanner> => {
  const formData = new FormData();
  formData.append('title', payload.title);
  formData.append('linkType', payload.linkType);
  formData.append('image', payload.image);
  if (payload.linkTargetId) formData.append('linkTargetId', payload.linkTargetId);
  if (payload.externalUrl) formData.append('externalUrl', payload.externalUrl);
  if (payload.startsAt) formData.append('startsAt', payload.startsAt);
  if (payload.endsAt) formData.append('endsAt', payload.endsAt);
  if (payload.sortOrder !== undefined && payload.sortOrder !== null)
    formData.append('sortOrder', String(payload.sortOrder));
  if (payload.isActive !== undefined && payload.isActive !== null)
    formData.append('isActive', String(payload.isActive));

  const { data } = await api.post('/admin/content/banners', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  const created: ApiBanner = data?.data ? (data.data as ApiBanner) : (data as ApiBanner);

  // If payload requested inactive (isActive: false) and backend created it as active (isActive: true):
  if (payload.isActive === false && created && created.id) {
    try {
      const updated = await updateAdminBanner(created.id, { isActive: false });
      return updated;
    } catch {
      created.isActive = false;
    }
  }

  return created;
};

export const updateAdminBanner = async (
  id: string,
  payload: UpdateBannerPayload
): Promise<ApiBanner> => {
  const formData = new FormData();
  if (payload.title) formData.append('title', payload.title);
  if (payload.linkType) formData.append('linkType', payload.linkType);
  if (payload.image instanceof File) formData.append('image', payload.image);
  if (payload.linkTargetId) formData.append('linkTargetId', payload.linkTargetId);
  if (payload.externalUrl) formData.append('externalUrl', payload.externalUrl);
  if (payload.startsAt) formData.append('startsAt', payload.startsAt);
  if (payload.endsAt) formData.append('endsAt', payload.endsAt);
  if (payload.sortOrder !== undefined && payload.sortOrder !== null)
    formData.append('sortOrder', String(payload.sortOrder));
  if (payload.isActive !== undefined && payload.isActive !== null)
    formData.append('isActive', String(payload.isActive));

  const { data } = await api.patch(`/admin/content/banners/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  if (data?.data) return data.data as ApiBanner;
  return data as ApiBanner;
};

export const deleteAdminBanner = async (id: string): Promise<void> => {
  await api.delete(`/admin/content/banners/${id}`);
};
