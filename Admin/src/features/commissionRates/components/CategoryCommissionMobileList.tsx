import { SquarePen, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { CategoryCommissionItem } from '../types';
import CommissionStatusBadge from './CommissionStatusBadge';
import CommissionCardSkeleton from './skeletons/CommissionCardSkeleton';

interface CategoryCommissionMobileListProps {
  items: CategoryCommissionItem[];
  platformRate?: number;
  onEdit: (item: CategoryCommissionItem) => void;
  onReset: (item: CategoryCommissionItem) => void;
  isLoading?: boolean;
}

export default function CategoryCommissionMobileList({
  items,
  platformRate = 10,
  onEdit,
  onReset,
  isLoading = false,
}: CategoryCommissionMobileListProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="block md:hidden">
        <CommissionCardSkeleton cardCount={4} />
      </div>
    );
  }

  return (
    <div className="block md:hidden space-y-3">
      {items.map((item) => {
        const displayRate = item.status === 'Default' || item.rate === null ? platformRate : item.rate;
        return (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-gray-100 p-4 shadow-2xs space-y-2.5"
          >
            {/* Top Row: Category Name & Status */}
            <div className="flex items-center justify-between gap-2">
              <span className="font-extrabold text-sm text-gray-900">
                {item.categoryName}
              </span>
              <CommissionStatusBadge status={item.status} />
            </div>

            {/* Bottom Row: Rate & Actions */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-baseline text-xs text-gray-500 font-medium">
                <span>{t('commissionRates.rateLabel', 'Rate')}:</span>
                <span className="font-bold text-gray-900 ms-1">
                  {displayRate.toFixed(2)}%
                </span>
              </div>

              <div className="inline-flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onEdit(item)}
                  aria-label={`Edit ${item.categoryName}`}
                  title={t('commissionRates.setCustomRate', 'Set Custom Rate')}
                  className="w-8 h-8 rounded-lg border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-700 transition-colors cursor-pointer shadow-2xs"
                >
                  <SquarePen size={15} />
                </button>
                {item.status === 'Custom' && (
                  <button
                    type="button"
                    onClick={() => onReset(item)}
                    aria-label={`Reset ${item.categoryName} to default`}
                    title={t('commissionRates.resetToDefault', 'Reset to Default')}
                    className="w-8 h-8 rounded-lg border border-rose-100 bg-rose-50/40 hover:bg-rose-100 flex items-center justify-center text-rose-500 transition-colors cursor-pointer shadow-2xs"
                  >
                    <RotateCcw size={15} />
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

