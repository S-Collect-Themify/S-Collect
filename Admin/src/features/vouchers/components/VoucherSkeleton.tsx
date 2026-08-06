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
            className="bg-white rounded-2xl border border-gray-100 p-4 shadow-xs animate-pulse space-y-3"
          >
            {/* Top row: Code badge & Status */}
            <div className="flex items-center justify-between">
              <div className="h-5 bg-gray-200 rounded-lg w-28" />
              <div className="h-5 bg-gray-200 rounded-full w-16" />
            </div>

            {/* Middle row: Type & Discount */}
            <div className="flex items-center justify-between py-1">
              <div className="h-4 bg-gray-200 rounded-md w-20" />
              <div className="h-5 bg-gray-200 rounded-md w-16" />
            </div>

            {/* Bottom row: Expiry & Delete */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="h-3 bg-gray-200 rounded-md w-28" />
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
              <th className="py-4 px-4 text-start">{t('vouchers.table.code', 'Code')}</th>
              <th className="py-4 px-4 text-start">{t('vouchers.table.type', 'Type')}</th>
              <th className="py-4 px-4 text-start">{t('vouchers.table.discount', 'Discount')}</th>
              <th className="py-4 px-4 text-start">{t('vouchers.table.expiryDate', 'Expiry Date')}</th>
              <th className="py-4 px-4 text-start">{t('vouchers.table.usage', 'Usage')}</th>
              <th className="py-4 px-4 text-start">{t('vouchers.table.status', 'Status')}</th>
              <th className="py-4 px-4 text-end">{t('vouchers.table.actions', 'Actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {Array.from({ length: 6 }).map((_, i) => (
              <tr key={i} className="animate-pulse">
                {/* Code */}
                <td className="py-4 px-4">
                  <div className="h-6 bg-gray-200 rounded-lg w-28" />
                </td>
                {/* Type */}
                <td className="py-4 px-4">
                  <div className="h-5 bg-gray-200 rounded-md w-20" />
                </td>
                {/* Discount */}
                <td className="py-4 px-4">
                  <div className="h-4 bg-gray-200 rounded-md w-16" />
                </td>
                {/* Expiry Date */}
                <td className="py-4 px-4">
                  <div className="h-4 bg-gray-200 rounded-md w-24" />
                </td>
                {/* Usage progress & count */}
                <td className="py-4 px-4">
                  <div className="space-y-1.5 w-28">
                    <div className="h-3 bg-gray-200 rounded-md w-14" />
                    <div className="h-1.5 bg-gray-200 rounded-full w-full" />
                  </div>
                </td>
                {/* Status Badge */}
                <td className="py-4 px-4">
                  <div className="h-5 bg-gray-200 rounded-full w-16" />
                </td>
                {/* Actions */}
                <td className="py-4 px-4 text-end">
                  <div className="flex justify-end gap-2">
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
