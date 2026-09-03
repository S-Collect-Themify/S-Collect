import { api } from './api';

export interface ApiCategoryItem {
  id: string;
  name: string;
  nameAr?: string;
  nameEn?: string;
  slug: string;
  description?: string | Record<string, any> | null;
  parentCategoryId?: string | Record<string, any> | null;
  isActive?: boolean;
  image?: string | Record<string, any> | null;
  imageUrl?: string | null;
  createdAt?: string;
  productCount?: number;
  productsCount?: number;
}

export interface CreateCategoryPayload {
  name: string;
  nameAr: string;
  slug: string;
  description?: string | null;
  parentCategoryId?: string | null;
  image?: string | File | null;
}

export interface UpdateCategoryPayload {
  name?: string;
  nameAr?: string;
  slug?: string;
  description?: string | null;
  parentCategoryId?: string | null;
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

function extractCategoriesArray(resData: any): ApiCategoryItem[] {
  if (!resData) return [];
  if (Array.isArray(resData)) return resData;
  if (typeof resData === 'object') {
    if (Array.isArray(resData.items)) return resData.items;
    if (Array.isArray(resData.categories)) return resData.categories;
    if (Array.isArray(resData.data)) return resData.data;
    if (resData.data && typeof resData.data === 'object') {
      if (Array.isArray(resData.data.items)) return resData.data.items;
      if (Array.isArray(resData.data.categories)) return resData.data.categories;
      if (Array.isArray(resData.data.data)) return resData.data.data;
    }
  }
  return [];
}

export const getAdminCategories = async (params?: { pageNum?: number; pageSize?: number }): Promise<ApiCategoryItem[]> => {
  const { data } = await api.get('/admin/categories', {
    params: {
      pageNum: params?.pageNum ?? 1,
      pageSize: params?.pageSize ?? 100,
    },
  });
  return extractCategoriesArray(data);
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
    formData.append('nameAr', payload.nameAr);
    formData.append('slug', payload.slug);
    if (payload.description) formData.append('description', payload.description);
    if (payload.parentCategoryId) formData.append('parentCategoryId', payload.parentCategoryId);
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
  if (payload.description) body.description = payload.description;
  if (payload.parentCategoryId) body.parentCategoryId = payload.parentCategoryId;
  if (payload.image !== undefined && payload.image !== null) {
    body.image = payload.image;
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
    if (payload.nameAr) formData.append('nameAr', payload.nameAr);
    if (payload.slug) formData.append('slug', payload.slug);
    if (payload.description) formData.append('description', payload.description);
    if (payload.parentCategoryId) formData.append('parentCategoryId', payload.parentCategoryId);
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
  if (payload.nameAr !== undefined) body.nameAr = payload.nameAr;
  if (payload.slug !== undefined) body.slug = payload.slug;
  if (payload.description !== undefined) body.description = payload.description;
  if (payload.parentCategoryId !== undefined) body.parentCategoryId = payload.parentCategoryId;
  if (payload.isActive !== undefined) body.isActive = payload.isActive;
  if (payload.image !== undefined) {
    body.image = payload.image ? payload.image : null;
  }

  const { data } = await api.patch(`/admin/categories/${id}`, body);
  return data;
};

export const deactivateAdminCategory = async (id: string): Promise<ApiCategoryItem> => {
  try {
    const { data } = await api.put(`/admin/categories/${id}/deactivate`);
    return data;
  } catch (err: any) {
    if (err?.response?.status === 404 || err?.response?.status === 405) {
      try {
        const { data } = await api.post(`/admin/categories/${id}/deactivate`);
        return data;
      } catch {
        const { data } = await api.patch(`/admin/categories/${id}`, { isActive: false });
        return data;
      }
    }
    throw err;
  }
};

export const reactivateAdminCategory = async (id: string): Promise<ApiCategoryItem> => {
  try {
    const { data } = await api.put(`/admin/categories/${id}/reactivate`);
    return data;
  } catch (err: any) {
    if (err?.response?.status === 404 || err?.response?.status === 405) {
      try {
        const { data } = await api.post(`/admin/categories/${id}/reactivate`);
        return data;
      } catch {
        try {
          const { data } = await api.put(`/admin/categories/${id}/activate`);
          return data;
        } catch {
          const { data } = await api.patch(`/admin/categories/${id}`, { isActive: true });
          return data;
        }
      }
    }
    throw err;
  }
};

export const deleteAdminCategory = async (id: string): Promise<void> => {
  await api.delete(`/admin/categories/${id}`);
};

export interface CategoryBulkDiscountPayload {
  categoryId: string;
  discountType: 'PERCENT' | 'FIXED';
  discountValue: number;
  expiryDate?: string;
}

export const applyCategoryBulkDiscount = async (payload: CategoryBulkDiscountPayload) => {
  const { data } = await api.post('/admin/products/bulk-discount', payload);
  return data;
};

