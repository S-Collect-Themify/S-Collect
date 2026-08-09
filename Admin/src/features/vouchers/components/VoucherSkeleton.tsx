import React from 'react';
import { useTranslation } from 'react-i18next';

interface VoucherSkeletonProps {
  isMobile?: boolean;
}

export const VoucherSkeleton: React.FC<VoucherSkeletonProps> = ({ isMobile = false }) => {
  const { t } = useTranslation();

  if (isMobile) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm animate-pulse space-y-3"
          >
            {/* Top row: Code badge & Status */}
            <div className="flex items-center justify-between">
              <div className="h-6 bg-gray-200 rounded-xl w-28" />
              <div className="h-5 bg-gray-200 rounded-full w-20" />
            </div>

            {/* Grid rows */}
            <div className="grid grid-cols-[110px_1fr] gap-y-2 text-xs">
              <div className="h-4 bg-gray-200 rounded-md w-16" />
              <div className="h-4 bg-gray-200 rounded-md w-24" />

              <div className="h-4 bg-gray-200 rounded-md w-16" />
              <div className="h-4 bg-gray-200 rounded-md w-28" />

              <div className="h-4 bg-gray-200 rounded-md w-14" />
              <div className="h-4 bg-gray-200 rounded-md w-20" />

              <div className="h-4 bg-gray-200 rounded-md w-16" />
              <div className="h-4 bg-gray-200 rounded-md w-16" />
            </div>

            {/* Bottom row: Action Buttons */}
            <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
              <div className="h-8 bg-gray-200 rounded-xl flex-1" />
              <div className="h-8 bg-gray-200 rounded-xl flex-1" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse rtl:text-right text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-200 font-semibold text-gray-800">
              <th className="py-3.5 px-3.5">{t('vouchersListing.table.code', 'Code')}</th>
              <th className="py-3.5 px-3.5">{t('vouchersListing.table.category', 'Category')}</th>
              <th className="py-3.5 px-3.5">{t('vouchersListing.table.scope', 'Scope')}</th>
              <th className="py-3.5 px-3.5">{t('vouchersListing.table.type', 'Type')}</th>
              <th className="py-3.5 px-3.5">{t('vouchersListing.table.discount', 'Discount')}</th>
              <th className="py-3.5 px-3.5">{t('vouchersListing.table.minOrder', 'Min Order')}</th>
              <th className="py-3.5 px-3.5">{t('vouchersListing.table.maxDiscount', 'Max Discount')}</th>
              <th className="py-3.5 px-3.5">{t('vouchersListing.table.usage', 'Usage')}</th>
              <th className="py-3.5 px-3.5">{t('vouchersListing.table.expiryDate', 'Expiry Date')}</th>
              <th className="py-3.5 px-3.5">{t('vouchersListing.table.status', 'Status')}</th>
              <th className="py-3.5 px-3.5 text-center">{t('vouchersListing.table.actions', 'Actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {Array.from({ length: 6 }).map((_, i) => (
              <tr key={i} className="animate-pulse">
                {/* Code */}
                <td className="py-3.5 px-3.5">
                  <div className="h-5 bg-gray-200 rounded-md w-24" />
                </td>
                {/* Category */}
                <td className="py-3.5 px-3.5">
                  <div className="h-5 bg-gray-200 rounded-md w-28" />
                </td>
                {/* Scope */}
                <td className="py-3.5 px-3.5">
                  <div className="h-5 bg-gray-200 rounded-md w-28" />
                </td>
                {/* Type */}
                <td className="py-3.5 px-3.5">
                  <div className="h-5 bg-gray-200 rounded-md w-20" />
                </td>
                {/* Discount */}
                <td className="py-3.5 px-3.5">
                  <div className="h-5 bg-gray-200 rounded-md w-16" />
                </td>
                {/* Min Order */}
                <td className="py-3.5 px-3.5">
                  <div className="h-5 bg-gray-200 rounded-md w-16" />
                </td>
                {/* Max Discount */}
                <td className="py-3.5 px-3.5">
                  <div className="h-5 bg-gray-200 rounded-md w-16" />
                </td>
                {/* Usage */}
                <td className="py-3.5 px-3.5">
                  <div className="h-5 bg-gray-200 rounded-md w-16" />
                </td>
                {/* Expiry Date */}
                <td className="py-3.5 px-3.5">
                  <div className="h-5 bg-gray-200 rounded-md w-24" />
                </td>
                {/* Status */}
                <td className="py-3.5 px-3.5">
                  <div className="h-5 bg-gray-200 rounded-full w-16" />
                </td>
                {/* Actions */}
                <td className="py-3.5 px-3.5 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-4 bg-gray-200 rounded w-8" />
                    <div className="h-4 bg-gray-200 rounded w-10" />
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
