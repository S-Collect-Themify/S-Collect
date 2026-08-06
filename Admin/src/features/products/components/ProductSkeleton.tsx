import React from 'react';
import { useTranslation } from 'react-i18next';

interface ProductSkeletonProps {
  isMobile?: boolean;
}

export const ProductSkeleton: React.FC<ProductSkeletonProps> = ({ isMobile = false }) => {
  const { t } = useTranslation();

  if (isMobile) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-gray-100 p-4 shadow-xs animate-pulse space-y-3"
          >
            {/* Top row: Thumbnail + Details */}
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-xl bg-gray-200 shrink-0" />
              <div className="flex-1 min-w-0 space-y-2">
                <div className="h-4 bg-gray-200 rounded-md w-3/4" />
                <div className="h-3 bg-gray-200 rounded-md w-1/2" />
                <div className="flex items-center gap-2 pt-1">
                  <div className="h-3 bg-gray-200 rounded-full w-16" />
                  <div className="h-3 bg-gray-200 rounded-md w-14" />
                </div>
              </div>
            </div>

            {/* Bottom row: Price & Toggle */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="h-5 bg-gray-200 rounded-md w-20" />
              <div className="h-6 bg-gray-200 rounded-full w-11" />
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
              <th className="py-4 px-4 text-start">{t('products.table.product', 'Product')}</th>
              <th className="py-4 px-4 text-start">{t('products.table.category', 'Category')}</th>
              <th className="py-4 px-4 text-start">{t('products.table.vendor', 'Vendor')}</th>
              <th className="py-4 px-4 text-start">{t('products.table.price', 'Price')}</th>
              <th className="py-4 px-4 text-start">{t('products.table.status', 'Status')}</th>
              <th className="py-4 px-4 text-start">{t('products.table.stock', 'Stock')}</th>
              <th className="py-4 px-4 text-end">{t('products.table.actions', 'Actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {Array.from({ length: 7 }).map((_, i) => (
              <tr key={i} className="animate-pulse">
                {/* Product Name & Thumbnail */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-200 shrink-0" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-4 bg-gray-200 rounded-md w-36" />
                      <div className="h-3 bg-gray-200 rounded-md w-24" />
                    </div>
                  </div>
                </td>
                {/* Category */}
                <td className="py-3.5 px-4">
                  <div className="h-6 bg-gray-200 rounded-lg w-24" />
                </td>
                {/* Vendor */}
                <td className="py-3.5 px-4">
                  <div className="h-4 bg-gray-200 rounded-md w-28" />
                </td>
                {/* Price */}
                <td className="py-3.5 px-4">
                  <div className="h-4 bg-gray-200 rounded-md w-20" />
                </td>
                {/* Status Toggle Switch */}
                <td className="py-3.5 px-4">
                  <div className="h-6 bg-gray-200 rounded-full w-11" />
                </td>
                {/* Stock Status */}
                <td className="py-3.5 px-4">
                  <div className="h-5 bg-gray-200 rounded-full w-16" />
                </td>
                {/* Actions */}
                <td className="py-3.5 px-4 text-end">
                  <div className="flex justify-end gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gray-200" />
                    <div className="w-8 h-8 rounded-lg bg-gray-200" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer / Pagination Skeleton */}
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
