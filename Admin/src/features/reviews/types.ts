export interface ReviewItem {
  id: string;
  reviewId: string;
  product: string;
  buyerName: string;
  vendor: string;
  rating: number; // 1 to 5
  date: string; // e.g. '2025-01-10'
}

export interface DeleteReviewModalState {
  open: boolean;
  review: ReviewItem | null;
}
