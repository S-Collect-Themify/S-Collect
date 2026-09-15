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
  // 0 = Department, 1 = Category, 2 = Sub-Category
  depth?: number;
  // Nested children as returned by /categories/tree — departments carry theirs
  // under `categories`, categories carry theirs under `children`.
  categories?: ApiCategoryItem[];
  children?: ApiCategoryItem[];
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
  try {
    const queryParams: Record<string, any> = {};
    if (params?.pageNum !== undefined) queryParams.pageNum = params.pageNum;
    if (params?.pageSize !== undefined) queryParams.pageSize = params.pageSize;

    const { data } = await api.get('/admin/categories', {
      params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
    });
    return extractCategoriesArray(data);
  } catch (err: any) {
    if (err?.response?.status === 500 || err?.response?.status === 400) {
      try {
        const { data } = await api.get('/admin/categories');
        return extractCategoriesArray(data);
      } catch {
        return [];
      }
    }
    throw err;
  }
};

// Full Department → Category → Sub-Category tree (all categories, including inactive).
export const getAdminCategoriesTree = async (): Promise<ApiCategoryItem[]> => {
  const { data } = await api.get('/admin/categories/tree');
  return extractCategoriesArray(data);
};

export const createAdminCategory = async (payload: CreateCategoryPayload): Promise<ApiCategoryItem> => {
  let fileToUpload: File | null = null;
  if (payload.image instanceof File) {
    fileToUpload = payload.image;
  } else if (typeof payload.image === 'string' && payload.image.startsWith('data:')) {
    try {
      fileToUpload = dataURLtoFile(payload.image, 'category-image.png');
    } catch {
      fileToUpload = null;
    }
  }

  let createdCategory: ApiCategoryItem;

  if (fileToUpload) {
    const formData = new FormData();
    formData.append('name', payload.name);
    formData.append('nameAr', payload.nameAr);
    formData.append('slug', payload.slug);
    if (payload.description) formData.append('description', payload.description);
    if (payload.parentCategoryId) formData.append('parentCategoryId', payload.parentCategoryId);
    formData.append('image', fileToUpload);

    try {
      const { data } = await api.post('/admin/categories', formData, {
        headers: {
          'Content-Type': undefined,
        },
      });
      createdCategory = data;
    } catch (err: any) {
      // Fallback: If server rejects multipart/form-data on POST, send standard JSON
      if (err?.response?.status === 400 || err?.response?.status === 415 || err?.response?.status === 422) {
        const body: Record<string, any> = {
          name: payload.name,
          nameAr: payload.nameAr,
          slug: payload.slug,
        };
        if (payload.description) body.description = payload.description;
        if (payload.parentCategoryId) body.parentCategoryId = payload.parentCategoryId;
        if (typeof payload.image === 'string') body.image = payload.image;

        const { data } = await api.post('/admin/categories', body);
        createdCategory = data;
      } else {
        throw err;
      }
    }
  } else {
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
    createdCategory = data;
  }

  // Extract ID of newly created category
  const catId = createdCategory?.id || (createdCategory as any)?.data?.id || (createdCategory as any)?.category?.id;
  const hasImageInResponse = Boolean(
    createdCategory?.image ||
      createdCategory?.imageUrl ||
      (createdCategory as any)?.data?.image ||
      (createdCategory as any)?.data?.imageUrl
  );

  // If an image was supplied during creation but POST endpoint did not attach/save it,
  // automatically call updateAdminCategory (PATCH /admin/categories/:id) which persists the image.
  if (catId && payload.image && !hasImageInResponse) {
    try {
      const updatedCategory = await updateAdminCategory(String(catId), { image: payload.image });
      return updatedCategory || createdCategory;
    } catch (updateErr) {
      console.warn('Post-creation image upload via PATCH failed:', updateErr);
      return createdCategory;
    }
  }

  return createdCategory;
};

export const updateAdminCategory = async (
  id: string,
  payload: UpdateCategoryPayload
): Promise<ApiCategoryItem> => {
  let fileToUpload: File | null = null;
  if (payload.image instanceof File) {
    fileToUpload = payload.image;
  } else if (typeof payload.image === 'string' && payload.image.startsWith('data:')) {
    try {
      fileToUpload = dataURLtoFile(payload.image, 'category-image.png');
    } catch {
      fileToUpload = null;
    }
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

    try {
      const { data } = await api.patch(`/admin/categories/${id}`, formData, {
        headers: {
          'Content-Type': undefined,
        },
      });
      return data;
    } catch (err: any) {
      if (err?.response?.status === 400 || err?.response?.status === 415 || err?.response?.status === 422) {
        const body: Record<string, any> = {};
        if (payload.name !== undefined) body.name = payload.name;
        if (payload.nameAr !== undefined) body.nameAr = payload.nameAr;
        if (payload.slug !== undefined) body.slug = payload.slug;
        if (payload.description !== undefined) body.description = payload.description;
        if (payload.parentCategoryId !== undefined) body.parentCategoryId = payload.parentCategoryId;
        if (payload.isActive !== undefined) body.isActive = payload.isActive;
        if (payload.image !== undefined) body.image = payload.image ? payload.image : null;

        const { data } = await api.patch(`/admin/categories/${id}`, body);
        return data;
      }
      throw err;
    }
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

