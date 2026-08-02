import { Trash, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ReviewItem } from '../types';
import { StarRating } from './StarRating';
import { useReviewStore } from '../reviewStore';

interface ReviewTableProps {
  reviews: ReviewItem[];
  onDeleteClick: (review: ReviewItem) => void;
}

export const ReviewTable = ({ reviews, onDeleteClick }: ReviewTableProps) => {
  const { t } = useTranslation();
  const sortBy = useReviewStore((s) => s.sortBy);
  const setSortBy = useReviewStore((s) => s.setSortBy);

  const handleRatingSortClick = () => {
    if (sortBy === 'rating-desc') {
      setSortBy('rating-asc');
    } else {
      setSortBy('rating-desc');
    }
  };

  const handleDateSortClick = () => {
    if (sortBy === 'date-desc') {
      setSortBy('date-asc');
    } else {
      setSortBy('date-desc');
    }
  };

  const renderSortIcon = (type: 'rating' | 'date') => {
    if (type === 'rating') {
      if (sortBy === 'rating-desc') return <ArrowDown size={14} className="text-gray-900" />;
      if (sortBy === 'rating-asc') return <ArrowUp size={14} className="text-gray-900" />;
    } else if (type === 'date') {
      if (sortBy === 'date-desc') return <ArrowDown size={14} className="text-gray-900" />;
      if (sortBy === 'date-asc') return <ArrowUp size={14} className="text-gray-900" />;
    }
    return <ArrowUpDown size={14} className="text-gray-400 opacity-60 group-hover:opacity-100 transition-opacity" />;
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
            
            {/* Rating Sort Header */}
            <th className="py-4 px-6">
              <button
                type="button"
                onClick={handleRatingSortClick}
                className="group flex items-center gap-1.5 font-semibold text-gray-800 hover:text-gray-900 focus:outline-none cursor-pointer transition-colors"
              >
                <span>{t('reviewsListing.table.rating')}</span>
                {renderSortIcon('rating')}
              </button>
            </th>

            {/* Date Sort Header */}
            <th className="py-4 px-6">
              <button
                type="button"
                onClick={handleDateSortClick}
                className="group flex items-center gap-1.5 font-semibold text-gray-800 hover:text-gray-900 focus:outline-none cursor-pointer transition-colors"
              >
                <span>{t('reviewsListing.table.date')}</span>
                {renderSortIcon('date')}
              </button>
            </th>

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
              <td className="py-4 px-6 font-medium text-gray-900 max-w-xs">
                <div>{review.product}</div>
              </td>

              {/* Buyer Name */}
              <td className="py-4 px-6 text-gray-700">{review.buyerName}</td>

              {/* Vendor */}
              <td className="py-4 px-6 text-gray-700">{review.vendor}</td>

              {/* Rating Stars */}
              <td className="py-4 px-6">
                <StarRating rating={review.rating} size={15} />
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

