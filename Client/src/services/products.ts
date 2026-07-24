import { api } from './api';
import axios from 'axios';

export const getAllProducts = async () => {
  const { data } = await api.get('/vendor/products');

  return data;
};

export const getProductById = async (productId: string) => {
  const { data } = await api.get(`/vendor/products/${productId}`);
  return data;
};

export const updateProductFull = async (
  productId: string,
  formData: FormData
) => {
  const { data } = await api.put(`/vendor/products/${productId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

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
    const status = axios.isAxiosError(err) ? err.response?.status : undefined;
    if (status === 404 || status === 405) {
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
          console.error(
            'All thumbnail methods failed (PATCH, PUT, POST):',
            postErr
          );
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

export const updateProductVariant = async (
  productId: string,
  variantId: string,
  body: { stock?: number; price?: number; compareAtPrice?: number; isActive?: boolean }
) => {
  const { data } = await api.patch(`/vendor/products/${productId}/variants/${variantId}`, body);
  return data;
};



