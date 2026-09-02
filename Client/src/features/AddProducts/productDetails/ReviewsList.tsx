import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getPaginationRange } from '../../../utils/pagination';

export type ReviewFilter =
  | 'all'
  | '5'
  | '4'
  | '3'
  | '2'
  | '1'
  | 'newest'
  | 'highest'
  | 'lowest';

export interface Review {
  id: string;
  authorName: string;
  authorAvatarUrl?: string;
  date: string;
  rating: number;
  title: string;
  body: string;
  photoUrls?: string[];
}

export interface ReviewsListProps {
  reviews: Review[];
  totalReviews: number;
  page: number;
  totalPages: number;
  activeFilter: ReviewFilter;
  onFilterChange?: (filter: ReviewFilter) => void;
  onPageChange?: (page: number) => void;
}

const FILTERS: ReviewFilter[] = [
  'all',
  '5',
  '4',
  '3',
  '2',
  '1',
  'newest',
  'highest',
  'lowest',
];

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={14}
          className={
            i < rating
              ? 'fill-amber-400 text-amber-400'
              : 'fill-gray-200 text-gray-200'
          }
        />
      ))}
    </div>
  );
}

function ReviewCard({
  review,
}: {
  review: Review;
}) {
  const { t } = useTranslation();
  const author = review?.authorName || 'Customer';
  const initials = author
    .split(' ')
    .filter(Boolean)
    .map((n) => (n && n[0] ? n[0] : ''))
    .slice(0, 2)
    .join('') || 'C';

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-gray-100">
            {review?.authorAvatarUrl ? (
              <img
                src={review.authorAvatarUrl}
                alt={author}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs font-medium text-gray-500 uppercase">
                {initials}
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">
              {author}
            </p>
            <p className="text-xs text-gray-400">{review?.date || ''}</p>
          </div>
        </div>
      </div>

      <div className="mt-3">
        <StarRow rating={review?.rating || 0} />
      </div>

      <h4 className="mt-2 text-sm font-semibold text-gray-900">
        {review?.title || ''}
      </h4>
      <p className="mt-1 text-sm leading-relaxed text-gray-500">
        {review?.body || ''}
      </p>

      {Array.isArray(review?.photoUrls) && review.photoUrls.length > 0 && (
        <div className="mt-3 flex gap-2">
          {review.photoUrls.map((url, i) => (
            <div
              key={i}
              className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100"
            >
              <img
                src={url}
                alt={t('productDetails.reviews.reviewPhoto', {
                  author: author,
                  index: i + 1,
                })}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
}) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const safeTotalPages = Math.max(1, totalPages || 1);

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => onPageChange?.(Math.max(1, page - 1))}
        disabled={page <= 1}
        aria-label={t('productDetails.reviews.previousPage')}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40"
      >
        {isArabic ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {getPaginationRange(page, safeTotalPages).map((item, index) =>
        item === '...' ? (
          <span
            key={`ellipsis-${index}`}
            className="w-8 h-8 flex items-center justify-center text-xs text-gray-400 font-medium select-none"
          >
            ...
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onPageChange?.(item)}
            className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium ${
              item === page
                ? 'bg-gray-900 text-white'
                : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {item}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => onPageChange?.(Math.min(safeTotalPages, page + 1))}
        disabled={page >= safeTotalPages}
        aria-label={t('productDetails.reviews.nextPage')}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40"
      >
        {isArabic ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>
    </div>
  );
}

export default function ReviewsList({
  reviews,
  totalReviews,
  page,
  totalPages,
  activeFilter,
  onFilterChange,
  onPageChange,
}: ReviewsListProps) {
  const { t } = useTranslation();
  const safeReviews = Array.isArray(reviews) ? reviews : [];
  const rangeStart = safeReviews.length === 0 ? 0 : (page - 1) * safeReviews.length + 1;
  const rangeEnd = (page - 1) * safeReviews.length + safeReviews.length;

  return (
    <div className="w-full space-y-4">
      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto rounded-2xl border border-gray-200 bg-white p-4 sm:flex-wrap sm:overflow-x-visible [&::-webkit-scrollbar]:hidden scrollbar-none">
        {FILTERS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => onFilterChange?.(key)}
            className={`whitespace-nowrap shrink-0 rounded-lg px-4 py-1.5 text-sm font-medium transition-colors sm:shrink ${
              activeFilter === key
                ? 'bg-gray-900 text-white'
                : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {t(`productDetails.reviews.filters.${key}`)}
          </button>
        ))}
      </div>

      {/* Review cards */}
      <div className="space-y-4">
        {safeReviews.map((review) => (
          <ReviewCard key={review?.id || Math.random().toString()} review={review} />
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-1 pt-1">
        <p className="text-sm text-gray-400">
          {t('productDetails.reviews.showingRange', {
            start: rangeStart,
            end: Math.min(rangeEnd, totalReviews || safeReviews.length),
            total: totalReviews || safeReviews.length,
          })}
        </p>
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
}
