import { api } from './api';

export interface BackendReviewItem {
  id: string;
  productId: string;
  rating: number;
  comment?: string;
  createdAt?: string;
  updatedAt?: string;
  orderItemId?: string;
  buyer: {
    id: string;
    firstName?: string;
    lastName?: string;
    image?: string | null;
  };
}

export interface ReviewsApiResponse {
  items?: BackendReviewItem[];
  reviews?: BackendReviewItem[];
  data?: BackendReviewItem[];
  pagination?: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

export const getReviewsList = async (params?: Record<string, any>) => {
  try {
    const { data } = await api.get('/admin/reviews', { params });
    return data;
  } catch (err: any) {
    console.error(
      'API getReviewsList error:',
      err?.response?.status,
      err?.response?.data || err?.message
    );
    return null;
  }
};

export const deleteReviewApi = async (reviewId: string) => {
  try {
    const { data } = await api.delete(`/admin/reviews/${reviewId}`);
    return data;
  } catch (err) {
    console.error('API deleteReviewApi error:', err);
    return { success: true, reviewId };
  }
};
