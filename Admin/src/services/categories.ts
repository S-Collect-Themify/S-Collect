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
  nameEn?: string;
  nameAr: string;
  slug: string;
  image?: string | File | null;
}

export interface UpdateCategoryPayload {
  name?: string;
  nameEn?: string;
  nameAr?: string;
  slug?: string;
  image?: string | File | null;
  isActive?: boolean;
}

const dataURLtoFile = (dataurl: string, filename: string): File => {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};

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
  let fileToUpload: File | null = null;
  if (payload.image instanceof File) {
    fileToUpload = payload.image;
  } else if (typeof payload.image === 'string' && payload.image.startsWith('data:')) {
    fileToUpload = dataURLtoFile(payload.image, 'category-image.png');
  }

  if (fileToUpload) {
    const formData = new FormData();
    formData.append('name', payload.name);
    if (payload.nameEn) formData.append('nameEn', payload.nameEn);
    if (payload.nameAr) formData.append('nameAr', payload.nameAr);
    if (payload.slug) formData.append('slug', payload.slug);
    formData.append('image', fileToUpload);

    const { data } = await api.post('/admin/categories', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  }

  const body: Record<string, any> = {
    name: payload.name,
    nameAr: payload.nameAr,
    slug: payload.slug,
  };
  if (payload.nameEn) body.nameEn = payload.nameEn;
  if (payload.image !== undefined) {
    body.image = payload.image ? payload.image : null;
  }

  const { data } = await api.post('/admin/categories', body);
  return data;
};

export const updateAdminCategory = async (
  id: string,
  payload: UpdateCategoryPayload
): Promise<ApiCategoryItem> => {
  let fileToUpload: File | null = null;
  if (payload.image instanceof File) {
    fileToUpload = payload.image;
  } else if (typeof payload.image === 'string' && payload.image.startsWith('data:')) {
    fileToUpload = dataURLtoFile(payload.image, 'category-image.png');
  }

  if (fileToUpload) {
    const formData = new FormData();
    if (payload.name) formData.append('name', payload.name);
    if (payload.nameEn) formData.append('nameEn', payload.nameEn);
    if (payload.nameAr) formData.append('nameAr', payload.nameAr);
    if (payload.slug) formData.append('slug', payload.slug);
    if (payload.isActive !== undefined) formData.append('isActive', String(payload.isActive));
    formData.append('image', fileToUpload);

    const { data } = await api.patch(`/admin/categories/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  }

  const body: Record<string, any> = {};
  if (payload.name !== undefined) body.name = payload.name;
  if (payload.nameEn !== undefined) body.nameEn = payload.nameEn;
  if (payload.nameAr !== undefined) body.nameAr = payload.nameAr;
  if (payload.slug !== undefined) body.slug = payload.slug;
  if (payload.isActive !== undefined) body.isActive = payload.isActive;
  if (payload.image !== undefined) {
    body.image = payload.image ? payload.image : null;
  }

  const { data } = await api.patch(`/admin/categories/${id}`, body);
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
