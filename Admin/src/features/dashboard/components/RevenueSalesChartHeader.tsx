import { useTranslation } from 'react-i18next';
import DashboardDateFilter from './DashboardDateFilter';

interface RevenueSalesChartHeaderProps {
  totalDisplay: string;
  dateRangeKey: string;
  customFrom: string;
  customTo: string;
  onSelectPreset: (key: string) => void;
  onApplyCustom: (from: string, to: string) => void;
}

export default function RevenueSalesChartHeader({
  totalDisplay,
  dateRangeKey,
  customFrom,
  customTo,
  onSelectPreset,
  onApplyCustom,
}: RevenueSalesChartHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
      <div>
        <p className="text-xs font-medium text-gray-500 mb-0.5">
          {t('dashboardOverview.salesOverview', 'Sales Overview')}
        </p>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-gray-900">{totalDisplay}</span>
          <span className="text-xs font-medium text-gray-500">
            {t('dashboardOverview.currency', 'SAR')}
          </span>
        </div>
      </div>

      {/* Date Range Selector with Custom Option */}
      <DashboardDateFilter
        dateRangeKey={dateRangeKey}
        customFrom={customFrom}
        customTo={customTo}
        onSelectPreset={onSelectPreset}
        onApplyCustom={onApplyCustom}
      />
    </div>
  );
}
