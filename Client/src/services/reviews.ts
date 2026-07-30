import { api } from './api';

export interface ReviewCustomer {
  buyerAccountId: string;
  firstName: string;
  lastName: string;
}

export interface VendorReview {
  id: string;
  productId: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  updatedAt: string;
  buyer?: ReviewCustomer | null;
}

export interface PaginatedVendorReviews {
  items: VendorReview[];
  pagination: {
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

export async function getVendorReviews(params?: {
  pageNum?: number;
  pageSize?: number;
  productId?: string;
  rating?: number;
  sortBy?: 'rating' | 'createdAt';
}): Promise<PaginatedVendorReviews> {
  try {
    const { data } = await api.get('/vendor/reviews', { params });
    const payload = data?.data || data;
    return {
      items: payload?.items || [],
      pagination: payload?.pagination || {
        currentPage: 1,
        pageSize: 20,
        totalItems: (payload?.items || []).length,
        totalPages: 1,
      },
    };
  } catch (_err) {
    return {
      items: [],
      pagination: {
        currentPage: 1,
        pageSize: 20,
        totalItems: 0,
        totalPages: 1,
      },
    };
  }
}

export async function getProductRatingSummary(
  productId: string
): Promise<ProductRatingSummary> {
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
    return {
      averageRating: 0,
      totalReviews: 0,
      counts: {
        stars1: 0,
        stars2: 0,
        stars3: 0,
        stars4: 0,
        stars5: 0,
      },
    };
  }
}
