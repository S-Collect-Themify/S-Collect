import { TrendingUp, ShoppingBag, Clock, Package } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { useSubOrdersStats } from '../Orders/useSubOrdersStats';

const COLOR_THEME = {
  green: { primary: 'var(--green)', light: 'var(--green-light)' },
  orange: { primary: 'var(--orange)', light: 'var(--orange-light)' },
  blue: { primary: 'var(--blue, #3b82f6)', light: 'var(--blue-light)' },
  purple: {
    primary: 'var(--purple, #9333ea)',
    light: 'var(--purple-light, #faf5ff)',
  },
};

const ReceivablesGrid = () => {
  const { i18n, t } = useTranslation();
  const { isMobile, isTablet } = useBreakpoint();
  const isArabic = i18n.language === 'ar';
  const { data: stats, isLoading } = useSubOrdersStats();

  const metrics = [
    {
      id: 1,
      title: 'Gross Merchandise Value (GMV)',
      value: isLoading ? '...' : (stats?.totalSales ?? 0).toLocaleString(),
      suffix: t('dashboardMetrics.unit.sar') || 'SAR',
      icon: TrendingUp,
      theme: COLOR_THEME.green,
    },
    {
      id: 2,
      title: 'Total Sub-Orders',
      value: isLoading ? '...' : (stats?.totalOrders ?? 0).toLocaleString(),
      suffix: t('dashboard.orders') || 'Orders',
      icon: ShoppingBag,
      theme: COLOR_THEME.blue,
    },
    {
      id: 3,
      title: 'New / Pending Orders',
      value: isLoading ? '...' : (stats?.newOrders ?? 0).toLocaleString(),
      suffix: t('dashboard.orders') || 'Orders',
      icon: Clock,
      theme: COLOR_THEME.orange,
    },
    {
      id: 4,
      title: 'Active Vendor Products',
      value: isLoading ? '...' : (stats?.activeProducts ?? 0).toLocaleString(),
      suffix: t('dashboard.items') || 'Items',
      icon: Package,
      theme: COLOR_THEME.purple,
    },
  ];

  return (
    <div className="mb-6">
      <div
        className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-6"
        dir={isArabic ? 'rtl' : 'ltr'}
      >
        {metrics.map((item, index) => {
          const Icon = item.icon;
          const theme = item.theme;
          const isLastSpanning =
            (isMobile || isTablet) &&
            index === metrics.length - 1 &&
            metrics.length % 2 !== 0;

          return (
            <div
              key={item.id}
              className={`bg-white border border-gray-100 rounded-xl p-3 lg:p-5 shadow-sm h-[130px] md:h-[145px] lg:h-[165px] flex flex-col justify-between animate-receivables-fade-in-up ${
                isLastSpanning ? 'col-span-2' : ''
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Header */}
              <div className="flex items-center gap-2">
                <span
                  className="flex h-8 w-8 lg:h-9 lg:w-9 items-center justify-center rounded-lg shrink-0"
                  style={{ color: theme.primary }}
                >
                  <Icon size={18} color={theme.primary} />
                </span>
                <span
                  className="text-xs lg:text-sm font-medium leading-tight line-clamp-2"
                  style={{ color: theme.primary }}
                >
                  {item.title}
                </span>
              </div>

              {/* Value */}
              <div className="flex items-start flex-col gap-0.5">
                <div>
                  <span className="lg:text-xl xl:text-3xl text-xl font-bold text-gray-900">
                    {item.value}
                  </span>
                  {item.suffix && (
                    <span className="text-xs lg:text-sm text-gray-400 mb-1 mx-1.5">
                      {item.suffix}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReceivablesGrid;
