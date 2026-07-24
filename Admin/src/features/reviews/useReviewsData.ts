import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getReviewsList, deleteReviewApi } from '../../services/reviews';
import { useReviewStore } from './reviewStore';
import type { ReviewItem } from './types';

export const useReviewsData = () => {
  const queryClient = useQueryClient();
  const setReviews = useReviewStore((s) => s.setReviews);
  const removeReviewFromStore = useReviewStore((s) => s.removeReview);
  const closeDeleteModal = useReviewStore((s) => s.closeDeleteModal);

  // ── Fetch Reviews Query ──
  const reviewsQuery = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: async () => {
      try {
        const response = await getReviewsList();
        if (Array.isArray(response)) {
          const mapped: ReviewItem[] = response.map((r: any, idx: number) => ({
            id: r.id || r._id || String(idx + 1),
            reviewId: r.reviewId || `REV-00${idx + 1}`,
            product: r.product?.name || r.product || 'Product',
            buyerName: r.buyerName || r.user?.name || 'Buyer',
            vendor: r.vendor?.name || r.vendor || 'Vendor',
            rating: Number(r.rating) || 5,
            date: r.date || r.createdAt ? new Date(r.createdAt).toISOString().split('T')[0] : '2025-01-10',
          }));
          setReviews(mapped);
          return mapped;
        }
      } catch (e) {
        console.warn('Reviews API fallback to initial data');
      }
      return null;
    },
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // ── Delete Review Mutation ──
  const deleteMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      return await deleteReviewApi(reviewId);
    },
    onMutate: (reviewId: string) => {
      removeReviewFromStore(reviewId);
      closeDeleteModal();
    },
    onSuccess: () => {
      toast.success('Review deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
    },
    onError: () => {
      toast.error('Failed to delete review');
    },
  });

  return {
    reviewsQuery,
    deleteMutation,
  };
};
