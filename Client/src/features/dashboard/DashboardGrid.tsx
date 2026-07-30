import { TrendingUp, ShoppingBag, Package, Wallet } from 'lucide-react';
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
      title: t('dashboardMetrics.totalSales', { defaultValue: 'Total Sales (GMV)' }),
      value: (stats?.totalSales ?? 0).toLocaleString(),
      unit: t('dashboardMetrics.unit.sar', { defaultValue: 'SAR' }),
      icon: TrendingUp,
      colorTheme: {
        primary: 'var(--green, #10b981)',
        light: 'var(--green-light)',
      },
    },
    {
      title: t('dashboardMetrics.totalOrders', { defaultValue: 'Total Sub-Orders' }),
      value: (stats?.totalOrders ?? stats?.orderCount ?? 0).toLocaleString(),
      unit: t('orders', { defaultValue: 'Orders' }),
      icon: ShoppingBag,
      colorTheme: {
        primary: 'var(--blue, #2563eb)',
      },
    },
    {
      title: t('dashboardMetrics.pendingPayouts', { defaultValue: 'Pending Payout / Dues' }),
      value: (stats?.pendingPayouts ?? stats?.totalDues ?? 0).toLocaleString(),
      unit: t('dashboardMetrics.unit.sar', { defaultValue: 'SAR' }),
      icon: Wallet,
      colorTheme: {
        primary: 'var(--orange, #f97316)',
      },
    },
    {
      title: t('dashboardMetrics.activeProducts', { defaultValue: 'Active Products' }),
      value: (stats?.activeProducts ?? stats?.productCount ?? 0).toLocaleString(),
      unit: t('dashboardMetrics.unit.product', { defaultValue: 'Items' }),
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
