import { api, handleServiceError } from './api';

export const getAllProducts = async () => {
  try {
    const { data } = await api.post('/vendor/products/search', {
      pageNum: 1,
      pageSize: 100,
    });

    const unwrapped =
      data && typeof data === 'object' && 'success' in data && 'data' in data
        ? (data as any).data
        : data;

    return unwrapped;
  } catch (err) {
    try {
      const { data } = await api.get('/vendor/products');
      return data;
    } catch {
      return {
        items: [],
        pagination: { currentPage: 1, pageSize: 20, totalItems: 0, totalPages: 1 },
      };
    }
  }
};

export const getProductById = async (productId: string) => {
  try {
    const { data } = await api.get(`/vendor/products/${productId}`);
    return data;
  } catch (err) {
    throw handleServiceError(err, `Failed to fetch product ${productId}`);
  }
};

export const updateProductFull = async (
  productId: string,
  formData: FormData
) => {
  try {
    const { data } = await api.patch(
      `/vendor/products/${productId}`,
      formData,
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    return data;
  } catch (err) {
    throw handleServiceError(err, `Failed to update product ${productId}`);
  }
};

export const createProductFull = async (formData: FormData) => {
  try {
    const { data } = await api.post('/vendor/products/full', formData, {
      headers: { 'Content-Type': 'application/json' },
    });

    return data;
  } catch (err) {
    throw handleServiceError(err, 'Failed to create product');
  }
};

export const setProductThumbnail = async (
  productId: string,
  imageId: string
) => {
  try {
    const { data } = await api.patch(
      `/vendor/products/${productId}/images/${imageId}/thumbnail`
    );
    return data;
  } catch (err: unknown) {
    const serviceErr = handleServiceError(
      err,
      'Failed to set product thumbnail'
    );
    if (serviceErr.statusCode === 404 || serviceErr.statusCode === 405) {
      try {
        const { data } = await api.put(
          `/vendor/products/${productId}/images/${imageId}/thumbnail`
        );
        return data;
      } catch (putErr: unknown) {
        try {
          const { data } = await api.post(
            `/vendor/products/${productId}/images/${imageId}/thumbnail`
          );
          return data;
        } catch (postErr: unknown) {
          throw handleServiceError(
            postErr,
            'All thumbnail methods failed (PATCH, PUT, POST)'
          );
        }
      }
    }
    throw serviceErr;
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
    const { data } = await api.get('/vendor/categories');
    return data;
  } catch (err) {
    throw handleServiceError(err, 'Failed to fetch categories');
  }
};

export const updateProductVariant = async (
  productId: string,
  variantId: string,
  body: {
    stock?: number;
    price?: number;
    compareAtPrice?: number;
    isActive?: boolean;
  }
) => {
  try {
    const { data } = await api.patch(
      `/vendor/products/${productId}/variants/${variantId}`,
      body
    );
    return data;
  } catch (err) {
    throw handleServiceError(err, `Failed to update variant ${variantId}`);
  }
};

export const deleteProductImage = async (
  productId: string,
  imageId: string
) => {
  try {
    const { data } = await api.delete(
      `/vendor/products/${productId}/images/${imageId}`
    );
    return data;
  } catch (err) {
    throw handleServiceError(err, `Failed to delete product image ${imageId}`);
  }
};

export const searchVendorProducts = async (query: {
  pageNum?: number;
  pageSize?: number;
  search?: string;
  categoryId?: string;
  isActive?: boolean;
}) => {
  try {
    const { data } = await api.post('/vendor/products/search', query);
    const unwrapped = data && typeof data === 'object' && 'success' in data && 'data' in data
      ? (data as any).data
      : data;
    return unwrapped;
  } catch (err) {
    throw handleServiceError(err, 'Failed to search vendor products');
  }
};

export const bulkUpdateProductStatus = async (params: {
  productIds: string[];
  status: 'PUBLISH' | 'UNPUBLISH' | 'DELETE';
}) => {
  try {
    const { data } = await api.post('/vendor/products/bulk-status', params);
    return data;
  } catch (err) {
    throw handleServiceError(err, 'Failed to bulk update product status');
  }
};
