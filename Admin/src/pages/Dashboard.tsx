import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import RevenueStatCards from '../features/dashboard/RevenueStatCards';
import RevenueSalesChart from '../features/dashboard/RevenueSalesChart';
import OrdersStatusDonut from '../features/dashboard/OrdersStatusDonut';
import VoucherOverviewSection from '../features/dashboard/VoucherOverviewSection';
import TopPerformingVendorsSection from '../features/dashboard/TopPerformingVendorsSection';
import DashboardDateFilter from '../features/dashboard/components/DashboardDateFilter';
import { getDateFromToParams } from '../features/dashboard/hooks/useRevenueOverview';
import { useAdminProfile } from '../hooks/useAdminProfile';

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const { fullName } = useAdminProfile();
  const adminName = fullName;

  const [dateRangeKey, setDateRangeKey] = useState('last30Days');
  const [customRange, setCustomRange] = useState<{ dateFrom: string; dateTo: string }>(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    return {
      dateFrom: thirtyDaysAgo.toISOString().split('T')[0],
      dateTo: now.toISOString().split('T')[0],
    };
  });

  const { dateFrom, dateTo } = useMemo(
    () => getDateFromToParams(dateRangeKey, customRange),
    [dateRangeKey, customRange]
  );

  const handleSelectPreset = (key: string) => {
    setDateRangeKey(key);
  };

  const handleApplyCustom = (from: string, to: string) => {
    setCustomRange({ dateFrom: from, dateTo: to });
    setDateRangeKey('custom');
  };

  return (
    <div className="flex-1 flex flex-col font-sans bg-gray-50/50 min-h-screen" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* ── Page Header ── */}
      <div className="sidebar-page-container pt-4 pb-4">
        {/* Mobile-only Greeting */}
        <div className="md:hidden mb-3">
          <p className="text-sm font-semibold text-gray-800">
            {isRtl ? `مرحباً، ${adminName} 👋` : `Hello, ${adminName} 👋`}
          </p>
          <p className="text-xs text-gray-400 font-medium">
            {t('dashboardOverview.todayDate', '--')}
          </p>
        </div>

        {/* Title & Date Selector */}
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl font-bold text-gray-900">
            {t('dashboardOverview.revenueOverview', 'Revenue Overview')}
          </h1>

          {/* Date Range Selector with Custom Option */}
          <DashboardDateFilter
            dateRangeKey={dateRangeKey}
            customFrom={customRange.dateFrom}
            customTo={customRange.dateTo}
            onSelectPreset={handleSelectPreset}
            onApplyCustom={handleApplyCustom}
          />
        </div>
      </div>

      {/* ── Main Content ── */}
      <main className="sidebar-page-container pb-10 space-y-6">
        {/* Top 4 Revenue Stat Cards */}
        <RevenueStatCards dateFrom={dateFrom} dateTo={dateTo} />

        {/* Sales Chart & Orders Donut Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
          <div className="lg:col-span-2">
            <RevenueSalesChart dateFrom={dateFrom} dateTo={dateTo} />
          </div>
          <div className="lg:col-span-1">
            <OrdersStatusDonut dateFrom={dateFrom} dateTo={dateTo} />
          </div>
        </div>

        {/* Voucher Overview Section */}
        <VoucherOverviewSection />

        {/* Top Performing Vendors Section */}
        <TopPerformingVendorsSection />
      </main>
    </div>
  );
}
