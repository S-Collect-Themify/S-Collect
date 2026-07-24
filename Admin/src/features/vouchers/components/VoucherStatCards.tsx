import { useTranslation } from 'react-i18next';

interface VoucherStatCardsProps {
  activeCount?: number;
  runningCount?: number;
  totalCosts?: string;
  redemptionsCount?: number;
}

export const VoucherStatCards = ({
  activeCount = 12,
  runningCount = 8,
  totalCosts = 'SAR 24,580',
  redemptionsCount = 347,
}: VoucherStatCardsProps) => {
  const { t } = useTranslation();

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

      {/* Card 2: Total Costs */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-xs">
        <span className="block text-xs sm:text-sm font-medium text-gray-400">
          {t('vouchersListing.stats.totalCosts')}
        </span>
        <div className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
          {totalCosts}
        </div>
        <span className="block text-xs font-semibold text-emerald-600 mt-1.5">
          {t('vouchersListing.stats.withinBudget')}
        </span>
      </div>

      {/* Card 3: Redemptions This Month */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-xs">
        <span className="block text-xs sm:text-sm font-medium text-gray-400">
          {t('vouchersListing.stats.redemptionsThisMonth')}
        </span>
        <div className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
          {redemptionsCount}
        </div>
        <span className="block text-xs font-semibold text-emerald-600 mt-1.5">
          {t('vouchersListing.stats.increaseFromLastWeek')}
        </span>
      </div>
    </div>
  );
};
