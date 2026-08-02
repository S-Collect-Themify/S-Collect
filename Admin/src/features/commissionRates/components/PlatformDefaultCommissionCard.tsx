import { useTranslation } from 'react-i18next';
import { DollarSign, SquarePen } from 'lucide-react';
import type { PlatformCommissionData } from '../types';

interface PlatformDefaultCommissionCardProps {
  platformData: PlatformCommissionData;
  onEdit: () => void;
  isLoading?: boolean;
}

export default function PlatformDefaultCommissionCard({
  platformData,
  onEdit,
  isLoading = false,
}: PlatformDefaultCommissionCardProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-5 md:p-6 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 animate-pulse">
        <div className="space-y-2.5 w-full md:w-auto">
          <div className="h-4 bg-gray-200 rounded-md w-44" />
          <div className="h-8 bg-gray-200 rounded-md w-28" />
        </div>
        <div className="w-20 h-9 bg-gray-200 rounded-md shrink-0" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 md:p-6 shadow-2xs flex flex-col md:flex-row items-end md:items-center justify-between gap-4 mb-8">
      <div className="space-y-1 w-full md:w-auto">
        {/* Title & Icon */}
        <div className="flex items-center gap-1.5">
          <DollarSign size={16} className="text-blue-600 font-bold shrink-0" />
          <span className="text-xs font-semibold text-blue-600">
            {t('commissionRates.platformDefaultTitle', 'Platform Default Commission')}
          </span>
        </div>

        {/* Value & Subtext */}
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
            {(platformData.rate ?? 0).toFixed(2)}%
          </span>
          <span className="text-xs text-gray-400 font-medium">
            {t('commissionRates.appliedGlobally', 'applied globally')}
          </span>
        </div>
      </div>

      {/* Edit Action Button */}
      <button
        type="button"
        onClick={onEdit}
        className="w-fit md:w-auto justify-center inline-flex items-center gap-2 px-4 py-2 md:py-2 bg-black md:bg-white text-white md:text-gray-800 border border-transparent md:border-gray-200 rounded-md text-xs md:text-sm font-semibold hover:bg-gray-800 md:hover:bg-gray-50 transition-all active:scale-95 cursor-pointer shadow-2xs shrink-0"
      >
        <SquarePen size={15} className="shrink-0" />
        <span>{t('commissionRates.edit', 'Edit')}</span>
      </button>
    </div>
  );
}
