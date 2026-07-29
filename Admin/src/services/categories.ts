import { api } from './api';

export interface ApiCategoryItem {
  id: string;
  name: string;
  nameAr?: string;
  nameEn?: string;
  slug: string;
  image?: string;
  imageUrl?: string;
  isActive?: boolean;
  createdAt?: string;
  productsCount?: number;
}

export interface CreateCategoryPayload {
  name: string;
  nameAr: string;
  slug: string;
  image?: string;
}

export interface UpdateCategoryPayload {
  name?: string;
  nameAr?: string;
  slug?: string;
  image?: string;
  isActive?: boolean;
}

export const getAdminCategories = async (): Promise<ApiCategoryItem[]> => {
  const { data } = await api.get('/admin/categories');
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === 'object') {
    if (Array.isArray((data as any).data)) {
      return (data as any).data;
    }
    if (Array.isArray((data as any).categories)) {
      return (data as any).categories;
    }
  }
  return [];
};

export const createAdminCategory = async (payload: CreateCategoryPayload): Promise<ApiCategoryItem> => {
  const { data } = await api.post('/admin/categories', payload);
  return data;
};

export const updateAdminCategory = async (
  id: string,
  payload: UpdateCategoryPayload
): Promise<ApiCategoryItem> => {
  const { data } = await api.patch(`/admin/categories/${id}`, payload);
  return data;
};

export const deactivateAdminCategory = async (id: string): Promise<ApiCategoryItem> => {
  const { data } = await api.post(`/admin/categories/${id}/deactivate`);
  return data;
};

export const reactivateAdminCategory = async (id: string): Promise<ApiCategoryItem> => {
  const { data } = await api.post(`/admin/categories/${id}/reactivate`);
  return data;
};

export const deleteAdminCategory = async (id: string): Promise<void> => {
  await api.delete(`/admin/categories/${id}`);
};
