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

export interface ProductRatingSummary {
  averageRating: number;
  totalReviews: number;
  counts: {
    stars1: number;
    stars2: number;
    stars3: number;
    stars4: number;
    stars5: number;
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

export const getProductReviews = async (params: {
  productId: string;
  pageNum?: number;
  pageSize?: number;
  page?: number;
  limit?: number;
}) => {
  try {
    const queryParams: Record<string, any> = { ...params };
    if (params?.pageSize && !queryParams.limit) queryParams.limit = params.pageSize;
    if (params?.pageNum && !queryParams.page) queryParams.page = params.pageNum;
    
    const { data } = await api.get('/admin/reviews', { params: queryParams });
    return data;
  } catch (err) {
    try {
      const { data } = await api.get('/vendor/reviews', { params });
      return data;
    } catch {
      return {
        items: [],
        pagination: { currentPage: 1, pageSize: 20, totalItems: 0, totalPages: 1 },
      };
    }
  }
};

export const getProductRatingSummary = async (
  productId: string
): Promise<ProductRatingSummary> => {
  try {
    const { data } = await api.get(`/vendor/reviews/products/${productId}/summary`);
    const payload = data?.data || data;
    const dist = payload?.distribution || payload?.counts || {};
    const total = payload?.totalRatings ?? payload?.totalReviews ?? payload?.total ?? 0;

    return {
      averageRating: payload?.averageRating ?? payload?.average ?? 0,
      totalReviews: total,
      counts: {
        stars1: dist?.['1'] ?? dist?.star1Count ?? dist?.stars1 ?? 0,
        stars2: dist?.['2'] ?? dist?.star2Count ?? dist?.stars2 ?? 0,
        stars3: dist?.['3'] ?? dist?.star3Count ?? dist?.stars3 ?? 0,
        stars4: dist?.['4'] ?? dist?.star4Count ?? dist?.stars4 ?? 0,
        stars5: dist?.['5'] ?? dist?.star5Count ?? dist?.stars5 ?? 0,
      },
    };
  } catch (_err) {
    try {
      const { data } = await api.get(`/admin/reviews/products/${productId}/summary`);
      const payload = data?.data || data;
      const dist = payload?.distribution || payload?.counts || {};
      const total = payload?.totalRatings ?? payload?.totalReviews ?? payload?.total ?? 0;

      return {
        averageRating: payload?.averageRating ?? payload?.average ?? 0,
        totalReviews: total,
        counts: {
          stars1: dist?.['1'] ?? dist?.star1Count ?? dist?.stars1 ?? 0,
          stars2: dist?.['2'] ?? dist?.star2Count ?? dist?.stars2 ?? 0,
          stars3: dist?.['3'] ?? dist?.star3Count ?? dist?.stars3 ?? 0,
          stars4: dist?.['4'] ?? dist?.star4Count ?? dist?.stars4 ?? 0,
          stars5: dist?.['5'] ?? dist?.star5Count ?? dist?.stars5 ?? 0,
        },
      };
    } catch {
      return {
        averageRating: 0,
        totalReviews: 0,
        counts: { stars1: 0, stars2: 0, stars3: 0, stars4: 0, stars5: 0 },
      };
    }
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

