import { api } from './api';

/** Matches ReviewCustomerResponseDto */
export interface ReviewCustomer {
  id: string;
  firstName: string;
  lastName: string;
  image: { url: string } | null;
}

/** Matches VendorReviewResponseDto */
export interface VendorReview {
  id: string;
  productId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  buyer: ReviewCustomer;
}

/** Matches PaginatedVendorReviewListResponseDto */
export interface PaginatedVendorReviews {
  items: VendorReview[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

/** Matches RatingDistributionBucketsDto */
export interface RatingDistributionBuckets {
  '1': number;
  '2': number;
  '3': number;
  '4': number;
  '5': number;
}

/** Matches ProductRatingDistributionResponseDto */
export interface ProductRatingSummary {
  productId: string;
  averageRating: number;
  totalRatings: number;
  distribution: RatingDistributionBuckets;
}

export async function getVendorReviews(params?: {
  pageNum?: number;
  pageSize?: number;
  productId?: string;
  rating?: number;
  sortBy?: 'RATING_ASC' | 'RATING_DESC' | 'RECENT';
}): Promise<PaginatedVendorReviews> {
  try {
    const { data } = await api.get('/vendor/reviews', { params });
    const payload = data?.data ?? data;
    const items = payload?.items ?? (Array.isArray(payload) ? payload : []);
    return {
      items,
      pagination: payload?.pagination ?? {
        currentPage: 1,
        pageSize: params?.pageSize ?? 25,
        totalItems: items.length,
        totalPages: 1,
      },
    };
  } catch (err) {
    console.error('getVendorReviews error:', err);
    return {
      items: [],
      pagination: {
        currentPage: 1,
        pageSize: params?.pageSize ?? 25,
        totalItems: 0,
        totalPages: 1,
      },
    };
  }
}

export async function getProductRatingSummary(
  productId: string
): Promise<ProductRatingSummary> {
  const empty: ProductRatingSummary = {
    productId,
    averageRating: 0,
    totalRatings: 0,
    distribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
  };

  try {
    const { data } = await api.get(`/vendor/reviews/products/${productId}/summary`);
    const payload = data?.data ?? data;

    if (!payload || typeof payload !== 'object') {
      return empty;
    }

    const dist = payload.distribution ?? payload.counts ?? {};
    const total =
      typeof payload.totalRatings === 'number'
        ? payload.totalRatings
        : typeof payload.totalReviews === 'number'
          ? payload.totalReviews
          : typeof payload.total === 'number'
            ? payload.total
            : 0;

    const avg =
      typeof payload.averageRating === 'number'
        ? payload.averageRating
        : typeof payload.average === 'number'
          ? payload.average
          : 0;

    return {
      productId: payload.productId ?? productId,
      averageRating: avg,
      totalRatings: total,
      distribution: {
        '1': Number(dist['1'] ?? dist.stars1 ?? dist.star1Count ?? 0),
        '2': Number(dist['2'] ?? dist.stars2 ?? dist.star2Count ?? 0),
        '3': Number(dist['3'] ?? dist.stars3 ?? dist.star3Count ?? 0),
        '4': Number(dist['4'] ?? dist.stars4 ?? dist.star4Count ?? 0),
        '5': Number(dist['5'] ?? dist.stars5 ?? dist.star5Count ?? 0),
      },
    };
  } catch (err) {
    console.error('getProductRatingSummary error:', err);
    return empty;
  }
}
