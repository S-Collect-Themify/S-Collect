import { create } from 'zustand';
import { INITIAL_REVIEWS } from './data';
import type { ReviewItem, DeleteReviewModalState } from './types';

interface ReviewStore {
  reviews: ReviewItem[];
  search: string;
  vendorFilter: string;
  ratingFilter: string;
  productFilter: string;
  currentPage: number;
  deleteModal: DeleteReviewModalState;

  setReviews: (reviews: ReviewItem[]) => void;
  setSearch: (search: string) => void;
  setVendorFilter: (vendor: string) => void;
  setRatingFilter: (rating: string) => void;
  setProductFilter: (product: string) => void;
  setCurrentPage: (page: number) => void;

  openDeleteModal: (review: ReviewItem) => void;
  closeDeleteModal: () => void;
  removeReview: (id: string) => void;
}

export const useReviewStore = create<ReviewStore>((set) => ({
  reviews: INITIAL_REVIEWS,
  search: '',
  vendorFilter: 'all',
  ratingFilter: 'all',
  productFilter: 'all',
  currentPage: 1,
  deleteModal: {
    open: false,
    review: null,
  },

  setReviews: (reviews) => set({ reviews }),
  setSearch: (search) => set({ search, currentPage: 1 }),
  setVendorFilter: (vendorFilter) => set({ vendorFilter, currentPage: 1 }),
  setRatingFilter: (ratingFilter) => set({ ratingFilter, currentPage: 1 }),
  setProductFilter: (productFilter) => set({ productFilter, currentPage: 1 }),
  setCurrentPage: (currentPage) => set({ currentPage }),

  openDeleteModal: (review) =>
    set({
      deleteModal: {
        open: true,
        review,
      },
    }),

  closeDeleteModal: () =>
    set({
      deleteModal: {
        open: false,
        review: null,
      },
    }),

  removeReview: (id) =>
    set((state) => ({
      reviews: state.reviews.filter((r) => r.id !== id && r.reviewId !== id),
      deleteModal: { open: false, review: null },
    })),
}));
