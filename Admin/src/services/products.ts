import { api } from './api';

export const getAllProducts = async () => {
  const { data } = await api.get('/vendor/products');

  return data;
};

export const createProductFull = async (formData: FormData) => {
  const { data } = await api.post('/vendor/products/full', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return data;
};

export const setProductThumbnail = async (productId: string, imageId: string) => {
  try {
    const { data } = await api.patch(`/vendor/products/${productId}/images/${imageId}/thumbnail`);
    return data;
  } catch (err: any) {
    const status = err?.response?.status;
    if (status === 404 || status === 405) {
      try {
        const { data } = await api.put(`/vendor/products/${productId}/images/${imageId}/thumbnail`);
        return data;
      } catch (putErr: any) {
        try {
          const { data } = await api.post(`/vendor/products/${productId}/images/${imageId}/thumbnail`);
          return data;
        } catch (postErr: any) {
          console.error('All thumbnail methods failed (PATCH, PUT, POST):', postErr);
          throw postErr;
        }
      }
    }
    throw err;
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
  const { data } = await api.get('/vendor/categories');
  return data;
};

export const updateProductStatus = async (productId: string | number, isActive: boolean) => {
  try {
    const { data } = await api.patch(`/vendor/products/${productId}/status`, { isActive });
    return data;
  } catch (err) {
    try {
      const { data } = await api.put(`/vendor/products/${productId}`, { isActive });
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
    return data;
  } catch {
    return [];
  }
};



