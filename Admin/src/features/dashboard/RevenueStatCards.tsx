import { useTranslation } from 'react-i18next';
import { TrendingUp, Box, CheckCircle2, Clock } from 'lucide-react';
import { useRevenueOverviewKpis } from './hooks/useRevenueOverview';

interface RevenueStatCardsProps {
  dateFrom: string;
  dateTo: string;
}

export default function RevenueStatCards({ dateFrom, dateTo }: RevenueStatCardsProps) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const currencyUnit = isAr ? '﷼' : 'SAR';
  const { data, isLoading } = useRevenueOverviewKpis({ dateFrom, dateTo });

  const formatCurrency = (val?: number | null) => {
    if (val === undefined || val === null || isNaN(val)) return '--';
    return val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  };

  const gmv = formatCurrency(data?.gmv);
  const netRevenue = formatCurrency(data?.netRevenue);
  const totalPayouts = formatCurrency(data?.totalPayouts);
  const pendingPayouts = formatCurrency(data?.pendingPayouts);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
      {/* GMV */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 lg:p-5 shadow-2xs">
        <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-green-700">
          <TrendingUp size={15} />
          <span>{t('dashboardOverview.gmv', 'GMV')}</span>
        </div>
        <div className="flex items-baseline justify-between gap-1 flex-col md:flex-row">
          <div>
            <span className="text-xl lg:text-2xl font-bold text-gray-900">
              {isLoading ? '...' : gmv}
            </span>
            <span className="text-xs font-medium text-gray-500 ms-1">{currencyUnit}</span>
          </div>
        </div>
      </div>

      {/* Net Revenue */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 lg:p-5 shadow-2xs">
        <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-blue-700">
          <Box size={15} />
          <span>{t('dashboardOverview.netRevenue', 'Net Revenue')}</span>
        </div>
        <div className="flex items-baseline justify-between gap-1 flex-col md:flex-row">
          <div>
            <span className="text-xl lg:text-2xl font-bold text-gray-900">
              {isLoading ? '...' : netRevenue}
            </span>
            <span className="text-xs font-medium text-gray-500 ms-1">{currencyUnit}</span>
          </div>
        </div>
      </div>

      {/* Total Payouts */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 lg:p-5 shadow-2xs">
        <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-green-700">
          <CheckCircle2 size={15} />
          <span>{t('dashboardOverview.totalPayouts', 'Total Payouts')}</span>
        </div>
        <div className="flex items-baseline justify-between gap-1 flex-col md:flex-row">
          <div>
            <span className="text-xl lg:text-2xl font-bold text-gray-900">
              {isLoading ? '...' : totalPayouts}
            </span>
            <span className="text-xs font-medium text-gray-500 ms-1">{currencyUnit}</span>
          </div>
        </div>
      </div>

      {/* Pending Payouts */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 lg:p-5 shadow-2xs">
        <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-amber-700">
          <Clock size={15} />
          <span>{t('dashboardOverview.pendingPayouts', 'Pending Payouts')}</span>
        </div>
        <div className="flex items-baseline justify-between gap-1 flex-col md:flex-row">
          <div>
            <span className="text-xl lg:text-2xl font-bold text-gray-900">
              {isLoading ? '...' : pendingPayouts}
            </span>
            <span className="text-xs font-medium text-gray-500 ms-1">{currencyUnit}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
