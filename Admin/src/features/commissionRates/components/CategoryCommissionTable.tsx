import { useTranslation } from 'react-i18next';
import { SquarePen, RotateCcw } from 'lucide-react';
import type { CategoryCommissionItem } from '../types';
import CommissionStatusBadge from './CommissionStatusBadge';
import CommissionTableSkeleton from './skeletons/CommissionTableSkeleton';

interface CategoryCommissionTableProps {
  items: CategoryCommissionItem[];
  onEdit: (item: CategoryCommissionItem) => void;
  onReset: (item: CategoryCommissionItem) => void;
  isLoading?: boolean;
}

export default function CategoryCommissionTable({
  items,
  onEdit,
  onReset,
  isLoading = false,
}: CategoryCommissionTableProps) {
  const { t } = useTranslation();

  return (
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full text-start border-collapse text-sm">
        <thead>
          <tr className="bg-gray-50/70 border-b border-gray-100 text-gray-700 text-xs font-bold">
            <th className="px-5 py-3.5 text-start font-bold text-gray-800">
              {t('commissionRates.categoryName', 'Category Name')}
            </th>
            <th className="px-5 py-3.5 text-start font-bold text-gray-800">
              {t('commissionRates.customRate', 'Custom Rate (%)')}
            </th>
            <th className="px-5 py-3.5 text-start font-bold text-gray-800">
              {t('commissionRates.status', 'Status')}
            </th>
            <th className="px-5 py-3.5 text-start font-bold text-gray-800">
              {t('commissionRates.lastUpdated', 'Last Updated')}
            </th>
            <th className="px-5 py-3.5 text-end font-bold text-gray-800">
              {t('commissionRates.actions', 'Actions')}
            </th>
          </tr>
        </thead>
        {isLoading ? (
          <CommissionTableSkeleton rowCount={5} />
        ) : (
          <tbody className="divide-y divide-gray-100">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-5 py-4 font-bold text-gray-900 whitespace-nowrap">
                  {item.categoryName}
                </td>
                <td className="px-5 py-4 font-bold text-gray-900 whitespace-nowrap">
                  {item.rate !== null ? `${item.rate.toFixed(2)}%` : '----'}
                </td>
                <td className="px-5 py-4 whitespace-nowrap">
                  <CommissionStatusBadge status={item.status} />
                </td>
                <td className="px-5 py-4 text-gray-400 font-medium whitespace-nowrap">
                  {item.lastUpdated || '----'}
                </td>
                <td className="px-5 py-4 text-end whitespace-nowrap">
                  <div className="inline-flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onEdit(item)}
                      aria-label={`Edit ${item.categoryName}`}
                      title={t('commissionRates.setCustomRate', 'Set Custom Rate')}
                      className="w-8 h-8 rounded-lg border border-gray-200 hover:bg-gray-100 inline-flex items-center justify-center text-gray-700 transition-colors cursor-pointer shadow-2xs"
                    >
                      <SquarePen size={15} />
                    </button>
                    {item.status === 'Custom' && (
                      <button
                        type="button"
                        onClick={() => onReset(item)}
                        aria-label={`Reset ${item.categoryName} to default`}
                        title={t('commissionRates.resetToDefault', 'Reset to Default')}
                        className="w-8 h-8 rounded-lg border border-rose-100 bg-rose-50/40 hover:bg-rose-100 inline-flex items-center justify-center text-rose-500 transition-colors cursor-pointer shadow-2xs"
                      >
                        <RotateCcw size={15} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        )}
      </table>
    </div>
  );
}

