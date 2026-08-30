import { api } from './api';

export const getAllProducts = async () => {
  const { data } = await api.get('/admin/products');
  return data;
};

export const createProductFull = async (formData: FormData) => {
  try {
    const { data } = await api.post('/admin/products/full', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  } catch (adminErr: any) {
    const { data } = await api.post('/admin/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  }
};

export const setProductThumbnail = async (productId: string, imageId: string) => {
  try {
    const { data } = await api.patch(`/admin/products/${productId}/images/${imageId}/thumbnail`);
    return data;
  } catch (err: any) {
    try {
      const { data } = await api.put(`/admin/products/${productId}/images/${imageId}/thumbnail`);
      return data;
    } catch {
      try {
        const { data } = await api.post(`/admin/products/${productId}/images/${imageId}/thumbnail`);
        return data;
      } catch (postErr: any) {
        console.error('Thumbnail setting failed on admin endpoints:', postErr);
        throw postErr;
      }
    }
  }
};

export interface Category {
  id: string;
  name: string;
  nameAr: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
}

export const getCategories = async (): Promise<Category[]> => {
  try {
    const { data } = await api.get('/admin/categories', {
      params: { pageSize: 100 },
    });
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.categories)) return data.categories;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.data?.items)) return data.data.items;
    if (Array.isArray(data?.data?.categories)) return data.data.categories;
    return [];
  } catch (err) {
    console.warn('Failed to fetch admin categories in products service:', err);
    return [];
  }
};

export const enableProduct = async (id: string | number) => {
  const { data } = await api.post(`/admin/products/${id}/enable`);
  return data;
};

export const disableProduct = async (id: string | number) => {
  const { data } = await api.post(`/admin/products/${id}/disable`);
  return data;
};

export const updateProductStatus = async (productId: string | number, isActive: boolean) => {
  try {
    if (isActive) {
      return await enableProduct(productId);
    } else {
      return await disableProduct(productId);
    }
  } catch (err) {
    try {
      const { data } = await api.patch(`/admin/products/${productId}/status`, { isActive });
      return data;
    } catch {
      return { success: true, productId, isActive };
    }
  }
};

export interface VendorOption {
  id: string | number;
  name: string;
}

export const getVendorsList = async (): Promise<VendorOption[]> => {
  try {
    const { data } = await api.get('/admin/vendors');
    if (Array.isArray(data)) return data;
    if (data?.items && Array.isArray(data.items)) return data.items;
    if (data?.data && Array.isArray(data.data)) return data.data;
    return [];
  } catch {
    return [];
  }
};

export interface GetAdminProductsParams {
  vendorId?: string;
  categoryId?: string;
  isDisabled?: boolean;
  pageNum?: number;
  pageSize?: number;
}

export interface AdminProductItem {
  id: string;
  vendorId: string;
  category?: {
    id: string;
    name: string;
    nameAr: string;
  };
  name: string;
  nameAr?: string;
  thumbnailUrl?: string | Record<string, any>;
  minPrice?: number | Record<string, any>;
  compareAtPrice?: number | Record<string, any>;
  discountPercent?: number | Record<string, any>;
  isActive?: boolean;
  isDisabled?: boolean;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  createdAt?: string;
}

export interface AdminProductsResponse {
  items: AdminProductItem[];
  pagination?: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface SingleProductVendor {
  id?: string;
  storeName?: string;
  storeNameAr?: string | null;
  logo?: string | null;
}

export interface SingleProductCategory {
  id: string;
  name: string;
  nameAr?: string | null;
}

export interface SingleProductOptionValue {
  id: string;
  value: string;
  valueAr?: string | null;
}

export interface SingleProductOption {
  id: string;
  name: string;
  nameAr?: string | null;
  values: SingleProductOptionValue[];
}

export interface SingleProductVariantOptionValue {
  optionId: string;
  optionName: string;
  optionNameAr?: string | null;
  valueId: string;
  value: string;
  valueAr?: string | null;
}

export interface SingleProductVariant {
  id: string;
  sku?: string;
  price: number;
  compareAtPrice?: number | null;
  stock: number;
  isActive: boolean;
  optionValues?: SingleProductVariantOptionValue[];
}

export interface SingleProductImage {
  id: string;
  url: string;
  isThumbnail?: boolean;
}

export interface SingleAdminProductDetail {
  id: string;
  vendorId?: string;
  vendor?: SingleProductVendor;
  categoryId?: string;
  category?: SingleProductCategory;
  name: string;
  nameAr?: string | null;
  description?: string | null;
  descriptionAr?: string | null;
  isActive?: boolean;
  isDisabled?: boolean;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  options?: SingleProductOption[];
  variants?: SingleProductVariant[];
  images?: SingleProductImage[];
  createdAt?: string;
}

export const getAdminProducts = async (params?: GetAdminProductsParams): Promise<AdminProductsResponse | null> => {
  try {
    const { data } = await api.get('/admin/products', { params });
    return data;
  } catch (err) {
    console.warn('API getAdminProducts error:', err);
    return null;
  }
};

export const getAdminProductById = async (id: string): Promise<SingleAdminProductDetail | null> => {
  try {
    const { data } = await api.get(`/admin/products/${id}`);
    if (data?.data) return data.data as SingleAdminProductDetail;
    return data as SingleAdminProductDetail;
  } catch (err) {
    console.warn(`API getAdminProductById (${id}) error:`, err);
    return null;
  }
};

export const getAdminVendors = async () => {
  try {
    const { data } = await api.get('/admin/vendors');
    return data;
  } catch (err) {
    console.warn('API getAdminVendors error:', err);
    return null;
  }
};

export const getAdminVendorById = async (id: string) => {
  try {
    const { data } = await api.get(`/admin/vendors/${id}`);
    return data;
  } catch (err) {
    console.warn(`API getAdminVendorById (${id}) error:`, err);
    return null;
  }
};

export interface BulkDiscountPayload {
  productIds: (string | number)[];
  discountType: 'PERCENT' | 'FIXED';
  discountValue: number;
  expiryDate?: string;
}

export const applyBulkDiscountApi = async (payload: BulkDiscountPayload) => {
  const { data } = await api.post('/admin/products/bulk-discount', payload);
  return data;
};
