import { useTranslation } from 'react-i18next';
import { TrendingUp, Box, CheckCircle2, Clock } from 'lucide-react';

export default function RevenueStatCards() {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
      {/* GMV */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 lg:p-5 shadow-2xs">
        <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-green-600">
          <TrendingUp size={15} />
          <span>{t('dashboardOverview.gmv', 'GMV')}</span>
        </div>
        <div className="flex items-baseline justify-between gap-1 flex-col md:flex-row">
          <div>
            <span className="text-xl lg:text-2xl font-bold text-gray-900">--</span>
            <span className="text-xs font-medium text-gray-400 ms-1">SAR</span>
          </div>
        </div>
      </div>

      {/* Net Revenue */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 lg:p-5 shadow-2xs">
        <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-blue-600">
          <Box size={15} />
          <span>{t('dashboardOverview.netRevenue', 'Net Revenue')}</span>
        </div>
        <div className="flex items-baseline justify-between gap-1 flex-col md:flex-row">
          <div>
            <span className="text-xl lg:text-2xl font-bold text-gray-900">--</span>
            <span className="text-xs font-medium text-gray-400 ms-1">SAR</span>
          </div>
        </div>
      </div>

      {/* Total Payouts */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 lg:p-5 shadow-2xs">
        <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-green-600">
          <CheckCircle2 size={15} />
          <span>{t('dashboardOverview.totalPayouts', 'Total Payouts')}</span>
        </div>
        <div className="flex items-baseline justify-between gap-1 flex-col md:flex-row">
          <div>
            <span className="text-xl lg:text-2xl font-bold text-gray-900">--</span>
            <span className="text-xs font-medium text-gray-400 ms-1">SAR</span>
          </div>
        </div>
      </div>

      {/* Pending Payouts */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 lg:p-5 shadow-2xs">
        <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-amber-600">
          <Clock size={15} />
          <span>{t('dashboardOverview.pendingPayouts', 'Pending Payouts')}</span>
        </div>
        <div className="flex items-baseline justify-between gap-1 flex-col md:flex-row">
          <div>
            <span className="text-xl lg:text-2xl font-bold text-gray-900">--</span>
            <span className="text-xs font-medium text-gray-400 ms-1">SAR</span>
          </div>
        </div>
      </div>
    </div>
  );
}
