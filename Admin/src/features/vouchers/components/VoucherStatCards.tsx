import { useTranslation } from 'react-i18next';

interface VoucherStatCardsProps {
  activeCount?: number;
  runningCount?: number;
  totalCostSavedThisMonth?: string | number;
  totalUsagesThisMonth?: number;
  // Legacy / fallback props
  totalCosts?: string | number;
  redemptionsCount?: number;
}

export const VoucherStatCards = ({
  activeCount = 0,
  runningCount = 0,
  totalCostSavedThisMonth,
  totalUsagesThisMonth,
  totalCosts = 'SAR 0',
  redemptionsCount = 0,
}: VoucherStatCardsProps) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const currencySymbol = isAr ? '﷼' : 'SAR';

  const formatVal = (val: string | number) => {
    if (typeof val === 'number') {
      return `${val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ${currencySymbol}`;
    }
    const str = String(val).replace(/SAR\s*/g, '').trim();
    return `${str} ${currencySymbol}`;
  };

  const formattedCostSaved =
    totalCostSavedThisMonth !== undefined
      ? formatVal(totalCostSavedThisMonth)
      : typeof totalCosts === 'number' || typeof totalCosts === 'string'
      ? formatVal(totalCosts)
      : totalCosts;

  const formattedUsages =
    totalUsagesThisMonth !== undefined
      ? totalUsagesThisMonth
      : redemptionsCount;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {/* Card 1: Active Vouchers */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-xs">
        <span className="block text-xs sm:text-sm font-medium text-gray-400">
          {t('vouchersListing.stats.activeVouchers')}
        </span>
        <div className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
          {activeCount}
        </div>
        <span className="block text-xs font-semibold text-emerald-600 mt-1.5">
          {t('vouchersListing.stats.currentlyRunning', { count: runningCount })}
        </span>
      </div>

      {/* Card 2: Total Cost Saved This Month */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-xs">
        <span className="block text-xs sm:text-sm font-medium text-gray-400">
          {t('vouchersListing.stats.totalCosts')}
        </span>
        <div className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
          {formattedCostSaved}
        </div>
      </div>

      {/* Card 3: Total Usages This Month */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-xs">
        <span className="block text-xs sm:text-sm font-medium text-gray-400">
          {t('vouchersListing.stats.redemptionsThisMonth')}
        </span>
        <div className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
          {formattedUsages}
        </div>
      </div>
    </div>
  );
};
