export interface ReviewItem {
  id: string;
  reviewId: string;
  product: string;
  productId?: string;
  buyerName: string;
  buyerAccountId?: string;
  vendor: string;
  rating: number; // 1 to 5
  comment?: string;
  date: string; // e.g. '2026-07-19'
}

export interface DeleteReviewModalState {
  open: boolean;
  review: ReviewItem | null;
}
