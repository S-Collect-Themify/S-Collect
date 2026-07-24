import { Trash, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ReviewItem } from '../types';

interface ReviewTableProps {
  reviews: ReviewItem[];
  onDeleteClick: (review: ReviewItem) => void;
}

export const ReviewTable = ({ reviews, onDeleteClick }: ReviewTableProps) => {
  const { t } = useTranslation();

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={15}
        className={
          i < rating
            ? 'fill-amber-400 text-amber-400'
            : 'fill-gray-200 text-gray-200'
        }
      />
    ));
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left border-collapse rtl:text-right">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/30 text-sm font-semibold text-gray-800">
            <th className="py-4 px-6">{t('reviewsListing.table.reviewId')}</th>
            <th className="py-4 px-6">{t('reviewsListing.table.product')}</th>
            <th className="py-4 px-6">{t('reviewsListing.table.buyerName')}</th>
            <th className="py-4 px-6">{t('reviewsListing.table.vendor')}</th>
            <th className="py-4 px-6">{t('reviewsListing.table.rating')}</th>
            <th className="py-4 px-6">{t('reviewsListing.table.date')}</th>
            <th className="py-4 px-6 text-center">{t('reviewsListing.table.action')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-sm">
          {reviews.map((review) => (
            <tr
              key={review.id}
              className="hover:bg-gray-50/60 transition-colors"
            >
              {/* Review ID */}
              <td className="py-4 px-6 font-semibold text-gray-900">
                {review.reviewId}
              </td>

              {/* Product Name */}
              <td className="py-4 px-6 font-medium text-gray-900">
                {review.product}
              </td>

              {/* Buyer Name */}
              <td className="py-4 px-6 text-gray-700">{review.buyerName}</td>

              {/* Vendor */}
              <td className="py-4 px-6 text-gray-700">{review.vendor}</td>

              {/* Rating Stars */}
              <td className="py-4 px-6">
                <div className="flex items-center gap-0.5">
                  {renderStars(review.rating)}
                </div>
              </td>

              {/* Date */}
              <td className="py-4 px-6 text-gray-500">{review.date}</td>

              {/* Action Delete Button */}
              <td className="py-4 px-6 text-center">
                <button
                  type="button"
                  onClick={() => onDeleteClick(review)}
                  className="p-4 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-full bg-gray-100 cursor-pointer transition-colors inline-flex items-center justify-center"
                  aria-label="Delete review"
                >
                  <Trash size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
