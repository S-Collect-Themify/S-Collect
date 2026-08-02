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

function extractSingleBanner(data: any): ApiBanner {
  if (!data) return {} as ApiBanner;
  if (data.data && typeof data.data === 'object' && !Array.isArray(data.data)) {
    const d = data.data;
    if (d.banner && typeof d.banner === 'object') return d.banner as ApiBanner;
    if (d.item && typeof d.item === 'object') return d.item as ApiBanner;
    return d as ApiBanner;
  }
  if (data.banner && typeof data.banner === 'object') return data.banner as ApiBanner;
  if (data.item && typeof data.item === 'object') return data.item as ApiBanner;
  return data as ApiBanner;
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

  const { data } = await api.post('/admin/content/banners', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return extractSingleBanner(data);
};

export const updateAdminBanner = async (
  id: string,
  payload: UpdateBannerPayload
): Promise<ApiBanner> => {
  if (payload.image instanceof File) {
    const formData = new FormData();
    if (payload.title) formData.append('title', payload.title);
    if (payload.linkType) formData.append('linkType', payload.linkType);
    formData.append('image', payload.image);
    if (payload.linkTargetId) formData.append('linkTargetId', payload.linkTargetId);
    if (payload.externalUrl) formData.append('externalUrl', payload.externalUrl);
    if (payload.startsAt) formData.append('startsAt', payload.startsAt);
    if (payload.endsAt) formData.append('endsAt', payload.endsAt);
    if (payload.sortOrder !== undefined && payload.sortOrder !== null)
      formData.append('sortOrder', String(payload.sortOrder));
    if (payload.isActive !== undefined) formData.append('isActive', String(payload.isActive));

    const { data } = await api.patch(`/admin/content/banners/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return extractSingleBanner(data);
  }

  const body: Record<string, unknown> = {};
  if (payload.title) body.title = payload.title;
  if (payload.linkType) body.linkType = payload.linkType;
  if (payload.linkTargetId) body.linkTargetId = payload.linkTargetId;
  if (payload.externalUrl) body.externalUrl = payload.externalUrl;
  if (payload.startsAt) body.startsAt = payload.startsAt;
  if (payload.endsAt) body.endsAt = payload.endsAt;
  if (payload.sortOrder !== undefined && payload.sortOrder !== null) body.sortOrder = payload.sortOrder;
  if (payload.isActive !== undefined) body.isActive = Boolean(payload.isActive);

  const { data } = await api.patch(`/admin/content/banners/${id}`, body);
  return extractSingleBanner(data);
};

export const deleteAdminBanner = async (id: string): Promise<void> => {
  await api.delete(`/admin/content/banners/${id}`);
};
