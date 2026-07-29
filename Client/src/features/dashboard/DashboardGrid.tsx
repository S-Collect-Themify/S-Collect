import { TrendingUp, ShoppingBag, Clock, Package } from 'lucide-react';
import type { ComponentType } from 'react';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { useSubOrdersStats } from '../Orders/useSubOrdersStats';
import DashboardGridSkeleton from './skeleton/DashboardGridSkeleton';

const DashboardGrid = () => {
  const { t } = useTranslation();
  const { isMobile, isTablet } = useBreakpoint();
  const { data: stats, isLoading } = useSubOrdersStats();

  if (isLoading) {
    return <DashboardGridSkeleton />;
  }

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
      title: 'Gross Merchandise Value (GMV)',
      value: (stats?.totalSales ?? 0).toLocaleString(),
      unit: t('dashboardMetrics.unit.sar'),
      icon: TrendingUp,
      colorTheme: {
        primary: 'var(--green)',
        light: 'var(--green-light)',
      },
    },
    {
      title: 'Total Sub-Orders',
      value: (stats?.totalOrders ?? 0).toLocaleString(),
      unit: t('dashboard.orders') || 'Orders',
      icon: ShoppingBag,
      colorTheme: {
        primary: 'var(--blue, #2563eb)',
      },
    },
    {
      title: 'New / Pending Orders',
      value: (stats?.newOrders ?? 0).toLocaleString(),
      unit: t('dashboard.orders') || 'Orders',
      icon: Clock,
      colorTheme: {
        primary: 'var(--yellow, #eab308)',
        light: 'var(--red-light)',
      },
    },
    {
      title: 'Active Products',
      value: (stats?.activeProducts ?? 0).toLocaleString(),
      unit: t('dashboard.items') || 'Items',
      icon: Package,
      colorTheme: {
        primary: 'var(--purple, #9333ea)',
      },
    },
  ];

  return (
    <div className="mb-10">
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-6">
        {dashboardMetrics.map((metric, index) => (
          <div
            key={metric.title}
            className={`bg-white border border-gray-100 rounded-xl p-3 lg:p-5 shadow-sm h-[120px] md:h-[135px] lg:h-[155px] flex flex-col justify-between animate-dashboard-fade-in-up ${
              (isMobile || isTablet) &&
              index === dashboardMetrics.length - 1 &&
              dashboardMetrics.length % 2 !== 0
                ? 'col-span-2'
                : ''
            }`}
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
            <div className="flex items-end justify-between max-sm:flex-col max-sm:items-start">
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
