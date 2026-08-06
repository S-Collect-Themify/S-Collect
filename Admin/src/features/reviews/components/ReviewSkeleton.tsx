import React from 'react';
import { useTranslation } from 'react-i18next';

interface ReviewSkeletonProps {
  isMobile?: boolean;
}

export const ReviewSkeleton: React.FC<ReviewSkeletonProps> = ({ isMobile = false }) => {
  const { t } = useTranslation();

  if (isMobile) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-gray-100 p-4 shadow-xs animate-pulse space-y-3"
          >
            {/* Top row: Review ID & Rating stars */}
            <div className="flex items-center justify-between">
              <div className="h-4 bg-gray-200 rounded-md w-24" />
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <div key={idx} className="w-3.5 h-3.5 rounded-full bg-gray-200" />
                ))}
              </div>
            </div>

            {/* Product & Customer */}
            <div className="space-y-1.5 pt-1">
              <div className="h-4 bg-gray-200 rounded-md w-3/4" />
              <div className="h-3 bg-gray-200 rounded-md w-1/2" />
            </div>

            {/* Comment snippet */}
            <div className="space-y-1.5 py-1">
              <div className="h-3 bg-gray-200 rounded-md w-full" />
              <div className="h-3 bg-gray-200 rounded-md w-2/3" />
            </div>

            {/* Bottom row: Date & Action button */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="h-3 bg-gray-200 rounded-md w-20" />
              <div className="w-7 h-7 rounded-lg bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-start border-collapse">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50 text-xs font-semibold text-gray-500">
              <th className="py-4 px-4 text-start">{t('reviews.table.reviewId', 'Review ID')}</th>
              <th className="py-4 px-4 text-start">{t('reviews.table.product', 'Product')}</th>
              <th className="py-4 px-4 text-start">{t('reviews.table.customer', 'Customer')}</th>
              <th className="py-4 px-4 text-start">{t('reviews.table.rating', 'Rating')}</th>
              <th className="py-4 px-4 text-start">{t('reviews.table.comment', 'Comment')}</th>
              <th className="py-4 px-4 text-start">{t('reviews.table.date', 'Date')}</th>
              <th className="py-4 px-4 text-end">{t('reviews.table.actions', 'Actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {Array.from({ length: 6 }).map((_, i) => (
              <tr key={i} className="animate-pulse">
                {/* Review ID */}
                <td className="py-4 px-4">
                  <div className="h-4 bg-gray-200 rounded-md w-20" />
                </td>
                {/* Product Name & Vendor */}
                <td className="py-4 px-4">
                  <div className="space-y-1.5">
                    <div className="h-4 bg-gray-200 rounded-md w-36" />
                    <div className="h-3 bg-gray-200 rounded-md w-24" />
                  </div>
                </td>
                {/* Customer */}
                <td className="py-4 px-4">
                  <div className="h-4 bg-gray-200 rounded-md w-28" />
                </td>
                {/* Rating */}
                <td className="py-4 px-4">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <div key={idx} className="w-3.5 h-3.5 rounded-full bg-gray-200" />
                    ))}
                  </div>
                </td>
                {/* Comment */}
                <td className="py-4 px-4">
                  <div className="h-4 bg-gray-200 rounded-md w-48" />
                </td>
                {/* Date */}
                <td className="py-4 px-4">
                  <div className="h-4 bg-gray-200 rounded-md w-20" />
                </td>
                {/* Actions */}
                <td className="py-4 px-4 text-end">
                  <div className="flex justify-end">
                    <div className="w-8 h-8 rounded-lg bg-gray-200" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Skeleton */}
      <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 animate-pulse">
        <div className="h-4 w-36 bg-gray-200 rounded-md" />
        <div className="flex gap-1.5">
          <div className="w-8 h-8 rounded-lg bg-gray-200" />
          <div className="w-8 h-8 rounded-lg bg-gray-200" />
          <div className="w-8 h-8 rounded-lg bg-gray-200" />
        </div>
      </div>
    </div>
  );
};
