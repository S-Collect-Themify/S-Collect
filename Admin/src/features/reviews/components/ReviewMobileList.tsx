import { Trash, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ReviewItem } from '../types';

interface ReviewMobileListProps {
  reviews: ReviewItem[];
  onDeleteClick: (review: ReviewItem) => void;
}

export const ReviewMobileList = ({
  reviews,
  onDeleteClick,
}: ReviewMobileListProps) => {
  const { t } = useTranslation();

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={14}
        className={
          i < rating
            ? 'fill-amber-400 text-amber-400'
            : 'fill-gray-200 text-gray-200'
        }
      />
    ));
  };

  return (
    <div className="space-y-3">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm"
        >
          {/* Top Row: Stars + Delete Icon */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-0.5">
              {renderStars(review.rating)}
            </div>
            <button
              type="button"
              onClick={() => onDeleteClick(review)}
              className="p-2 bg-gray-100 text-red-500 hover:bg-red-100 hover:text-red-600 rounded-full cursor-pointer transition-colors"
              aria-label="Delete review"
            >
              <Trash size={16} />
            </button>
          </div>

          {/* Row 2: Review ID + Date */}
          <div className="flex items-center justify-between text-xs mb-1.5 border-b border-solid border-gray-200 pb-2.5 mb-2.5">
            <span className="font-semibold text-gray-900 text-sm">
              {review.reviewId}
            </span>
            <span className="text-gray-400">{review.date}</span>
          </div>

          {/* Row 3: Product Name + Subtitle */}
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">
              {review.product}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {t('reviewsListing.mobile.byBuyerAndVendor', {
                buyer: review.buyerName,
                vendor: review.vendor,
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
