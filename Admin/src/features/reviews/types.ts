export type ReviewSortOption = 'date-desc' | 'date-asc' | 'rating-desc' | 'rating-asc';

export interface ReviewItem {
  id: string;
  reviewId: string;
  product: string;
  productId?: string;
  buyerName: string;
  buyerAccountId?: string;
  vendor: string;
  rating: number; // 1 to 5
  comment: string;
  date: string;
  createdAt?: string;
}

export interface DeleteReviewModalState {
  open: boolean;
  review: ReviewItem | null;
}

