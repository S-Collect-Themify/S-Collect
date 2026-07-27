import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getReviewsList, deleteReviewApi, type BackendReviewItem } from '../../services/reviews';
import { useReviewStore } from './reviewStore';
import type { ReviewItem } from './types';

export const mapBackendReviewToFrontend = (r: BackendReviewItem, idx: number): ReviewItem => {
  const formattedDate = r.createdAt
    ? String(r.createdAt).split('T')[0]
    : (r as any).date || '—';

  const revId = r.reviewId || (r.id ? `REV-${String(r.id).slice(0, 6)}` : `REV-00${idx + 1}`);

  const productName =
    r.product?.name ||
    (r as any).productName ||
    (r.productId ? `Product (${String(r.productId).slice(0, 8)}...)` : '—');

  const buyer =
    r.buyerName ||
    r.buyer?.name ||
    r.user?.name ||
    (r.buyerAccountId ? `Buyer (${String(r.buyerAccountId).slice(0, 8)}...)` : '—');

  const vendorName =
    r.vendor?.name || (r as any).vendorName || (typeof r.vendor === 'string' ? r.vendor : '—');

  return {
    id: String(r.id || idx + 1),
    reviewId: revId,
    product: productName,
    productId: r.productId,
    buyerName: buyer,
    buyerAccountId: r.buyerAccountId,
    vendor: vendorName,
    rating: Number(r.rating) || 0,
    date: formattedDate,
  };
};

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
        let itemsArray: BackendReviewItem[] = [];

        if (Array.isArray(response)) {
          itemsArray = response;
        } else if (response && typeof response === 'object') {
          if (Array.isArray(response.items)) {
            itemsArray = response.items;
          } else if (Array.isArray(response.reviews)) {
            itemsArray = response.reviews;
          } else if (Array.isArray(response.data)) {
            itemsArray = response.data;
          } else if (response.data && typeof response.data === 'object') {
            if (Array.isArray(response.data.items)) itemsArray = response.data.items;
            else if (Array.isArray(response.data.reviews)) itemsArray = response.data.reviews;
          } else if (Array.isArray((response as any).result)) {
            itemsArray = (response as any).result;
          } else if (Array.isArray((response as any).content)) {
            itemsArray = (response as any).content;
          }
        }

        const mapped: ReviewItem[] = itemsArray.map((r, idx) =>
          mapBackendReviewToFrontend(r, idx)
        );
        setReviews(mapped);
        return mapped;
      } catch (e) {
        console.warn('Reviews API fetch failed:', e);
        setReviews([]);
        return [];
      }
    },
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // ── Delete Review Mutation (Hard Delete) ──
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
