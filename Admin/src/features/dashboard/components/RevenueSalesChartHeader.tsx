import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';
import PortalDropdown from '../../../components/ui/PortalDropdown';

export type PeriodKey = 'monthly' | 'weekly' | 'yearly';

export interface PeriodOption {
  key: PeriodKey;
  defaultLabel: string;
}

interface RevenueSalesChartHeaderProps {
  periodKey: PeriodKey;
  periods: PeriodOption[];
  totalDisplay: string;
  onPeriodChange: (key: PeriodKey) => void;
}

export default function RevenueSalesChartHeader({
  periodKey,
  periods,
  totalDisplay,
  onPeriodChange,
}: RevenueSalesChartHeaderProps) {
  const { t } = useTranslation();

  const activePeriodLabel =
    periods.find((p) => p.key === periodKey)?.defaultLabel ?? '';

  return (
    <div className="flex items-start justify-between mb-4">
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

      {/* Filter Dropdown */}
      <PortalDropdown
        minWidth={110}
        animate={false}
        menuClassName="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden z-50"
        trigger={({ isOpen, toggle }) => (
          <button
            onClick={toggle}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <span>{t(`dashboardOverview.${periodKey}`, activePeriodLabel)}</span>
            <ChevronDown
              size={13}
              className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            />
          </button>
        )}
      >
        {({ close }) => (
          <div className="py-1">
            {periods.map((p) => (
              <button
                key={p.key}
                onClick={() => {
                  onPeriodChange(p.key);
                  close();
                }}
                className={`w-full text-start px-3.5 py-2 text-xs transition-colors cursor-pointer ${
                  periodKey === p.key
                    ? 'bg-green-50 text-green-700 font-semibold'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {t(`dashboardOverview.${p.key}`, p.defaultLabel)}
              </button>
            ))}
          </div>
        )}
      </PortalDropdown>
    </div>
  );
}
