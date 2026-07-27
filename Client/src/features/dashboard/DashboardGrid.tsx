import { TrendingUp, Box, PackagePlus, Package } from 'lucide-react';
import type { ComponentType } from 'react';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '../../hooks/useBreakpoint';

const DashboardGrid = () => {
  const { t } = useTranslation();
  const { isMobile, isTablet } = useBreakpoint();

  interface DashboardMetric {
    title: string;
    value: string;
    unit: string;
    icon: ComponentType<{ size?: number; color?: string }>;
    colorTheme: {
      primary: string;
      light?: string;
    };
  }

  const dashboardMetrics: DashboardMetric[] = [
    {
      title: `Gross Merchandise Value (GMV)`,
      value: '124,392',
      unit: t('dashboardMetrics.unit.sar'),
      icon: TrendingUp,
      colorTheme: {
        primary: 'var(--green)',
        light: 'var(--green-light)',
      },
    },
    {
      title: 'Commission Rate',
      value: '12%',
      unit: t('dashboardMetrics.unit.sar'),
      icon: Box,
      colorTheme: {
        primary: 'var(--yellow)',
        light: 'var(--green-light)',
      },
    },
    {
      title: 'Commission Amount',
      value: '41,184',
      unit: t('dashboardMetrics.unit.sar'),
      icon: PackagePlus,
      colorTheme: {
        primary: 'var(--yellow)',
        light: 'var(--red-light)',
      },
    },
    {
      title: 'Net Earnings',
      value: '128',
      unit: t('dashboardMetrics.unit.sar'),
      icon: Package,
      colorTheme: {
        primary: 'var(--blue, #2563eb)',
      },
    },
    {
      title: 'Pending Payout',
      value: '185,500',
      unit: t('dashboardMetrics.unit.sar'),
      icon: Package,
      colorTheme: {
        primary: 'var(--blue, #2563eb)',
      },
    },
  ];

  return (
    <div className="mb-10 ">
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-4 xl:gap-6">
        {dashboardMetrics.map((metric, index) => (
          <div
            key={metric.title}
            // Added the animation class
            className={`bg-white border border-gray-100 rounded-xl p-3 lg:p-5 shadow-sm h-[120px] md:h-[135px] lg:h-[155px] flex flex-col justify-between  animate-dashboard-fade-in-up  ${
              (isMobile || isTablet) &&
              index === dashboardMetrics.length - 1 &&
              dashboardMetrics.length > 4
                ? 'col-span-2'
                : ''
            } `}
            // Stagger the animation delay for each card (0ms, 100ms, 200ms...)
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Header */}
            <div className="flex items-center gap-2">
              <metric.icon size={20} color={metric.colorTheme.primary} />
              <span className="text-xs lg:text-sm text-gray-500 font-medium">
                {metric.title}
              </span>
            </div>

            {/* Content */}
            <div className="flex items-end justify-between  max-sm:flex-col max-sm:items-start">
              <div className="pb-2">
                <div className="flex items-end gap-2">
                  <span className="lg:text-xl xl:text-3xl text-xl font-bold text-gray-900">
                    {metric.value}
                  </span>

                  <span className="text-xs lg:text-sm text-gray-400 mb-1">
                    {metric.unit}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardGrid;
