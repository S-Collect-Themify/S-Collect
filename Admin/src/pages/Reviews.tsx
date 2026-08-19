import { useMemo, useEffect } from 'react';
import { useBreakpoint } from '../hooks/useBreakpoint';
import {
  REVIEWS_PER_PAGE,
  useReviewStore,
  useReviewsData,
  ReviewHeader,
  ReviewFilterBar,
  ReviewTable,
  ReviewMobileList,
  ReviewDeleteModal,
  ReviewEmptyState,
  ReviewPagination,
  ReviewSkeleton,
} from '../features/reviews';

const Reviews = () => {
  const { isMobile } = useBreakpoint();

  // ── Query & Mutation Hook ──
  const { reviewsQuery, deleteMutation } = useReviewsData();

  // ── Store State ──
  const reviews = useReviewStore((s) => s.reviews);
  const search = useReviewStore((s) => s.search);
  const vendorFilter = useReviewStore((s) => s.vendorFilter);
  const ratingFilter = useReviewStore((s) => s.ratingFilter);
  const productFilter = useReviewStore((s) => s.productFilter);
  const sortBy = useReviewStore((s) => s.sortBy);
  const currentPage = useReviewStore((s) => s.currentPage);
  const deleteModal = useReviewStore((s) => s.deleteModal);

  // ── Store Actions ──
  const setCurrentPage = useReviewStore((s) => s.setCurrentPage);
  const openDeleteModal = useReviewStore((s) => s.openDeleteModal);
  const closeDeleteModal = useReviewStore((s) => s.closeDeleteModal);

  useEffect(() => {
    setCurrentPage(1);
  }, [setCurrentPage]);

  // ── Extract Unique Filter Options ──
  const availableVendors = useMemo(() => {
    const list = Array.from(new Set(reviews.map((r) => r.vendor))).filter(Boolean);
    return list.sort();
  }, [reviews]);

  const availableProducts = useMemo(() => {
    const list = Array.from(new Set(reviews.map((r) => r.product))).filter(Boolean);
    return list.sort();
  }, [reviews]);

  // ── Filter & Sort Logic ──
  const filteredReviews = useMemo(() => {
    const filtered = reviews.filter((item) => {
      // Search Filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchProduct = item.product.toLowerCase().includes(q);
        const matchBuyer = item.buyerName.toLowerCase().includes(q);
        const matchVendor = item.vendor.toLowerCase().includes(q);
        const matchId = item.reviewId.toLowerCase().includes(q);
        if (!matchProduct && !matchBuyer && !matchVendor && !matchId) {
          return false;
        }
      }

      // Vendor Filter
      if (vendorFilter !== 'all' && item.vendor !== vendorFilter) {
        return false;
      }

      // Rating Filter
      if (ratingFilter !== 'all' && item.rating !== Number(ratingFilter)) {
        return false;
      }

      // Product Filter
      if (productFilter !== 'all' && item.product !== productFilter) {
        return false;
      }

      return true;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'rating-desc') {
        return b.rating - a.rating;
      }
      if (sortBy === 'rating-asc') {
        return a.rating - b.rating;
      }
      if (sortBy === 'date-asc') {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : (a.date ? new Date(a.date).getTime() : 0);
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : (b.date ? new Date(b.date).getTime() : 0);
        return timeA - timeB;
      }
      // date-desc (default)
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : (a.date ? new Date(a.date).getTime() : 0);
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : (b.date ? new Date(b.date).getTime() : 0);
      return timeB - timeA;
    });
  }, [reviews, search, vendorFilter, ratingFilter, productFilter, sortBy]);

  // ── Pagination Calculation ──
  const totalPages = Math.max(1, Math.ceil(filteredReviews.length / REVIEWS_PER_PAGE));
  const paginatedReviews = useMemo(() => {
    const start = (currentPage - 1) * REVIEWS_PER_PAGE;
    return filteredReviews.slice(start, start + REVIEWS_PER_PAGE);
  }, [filteredReviews, currentPage]);

  // ── Confirm Delete Action ──
  const handleConfirmDelete = () => {
    if (deleteModal.review) {
      deleteMutation.mutate(deleteModal.review.id || deleteModal.review.reviewId);
    }
  };

  return (
    <>
      {/* Header Banner */}
      <div className="sidebar-page-container-header">
        <ReviewHeader isMobile={isMobile} />
      </div>

      <div className="flex-1 overflow-y-auto pt-6 pb-6 sidebar-page-container transition-all">
        {/* Search & Filter Controls */}
        <ReviewFilterBar
          availableVendors={availableVendors}
          availableProducts={availableProducts}
        />

        {/* Review List Content or Empty State */}
        {reviewsQuery.isLoading ? (
          <ReviewSkeleton isMobile={isMobile} />
        ) : filteredReviews.length === 0 ? (
          <ReviewEmptyState />
        ) : isMobile ? (
          <div className="space-y-3">
            <ReviewMobileList
              reviews={paginatedReviews}
              onDeleteClick={openDeleteModal}
            />

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mt-3">
              <ReviewPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredReviews.length}
                itemsPerPage={REVIEWS_PER_PAGE}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <ReviewTable
              reviews={paginatedReviews}
              onDeleteClick={openDeleteModal}
            />

            <ReviewPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredReviews.length}
              itemsPerPage={REVIEWS_PER_PAGE}
              onPageChange={setCurrentPage}
            />
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <ReviewDeleteModal
          isOpen={deleteModal.open}
          review={deleteModal.review}
          onClose={closeDeleteModal}
          onConfirm={handleConfirmDelete}
        />
      </div>
    </>
  );
};

export default Reviews;