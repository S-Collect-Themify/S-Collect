import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, ChevronDown } from 'lucide-react';
import RevenueStatCards from '../features/dashboard/RevenueStatCards';
import RevenueSalesChart from '../features/dashboard/RevenueSalesChart';
import OrdersStatusDonut from '../features/dashboard/OrdersStatusDonut';
import VoucherOverviewSection from '../features/dashboard/VoucherOverviewSection';
import TopPerformingVendorsSection from '../features/dashboard/TopPerformingVendorsSection';
import PortalDropdown from '../components/ui/PortalDropdown';
import { getDateFromToParams } from '../features/dashboard/hooks/useRevenueOverview';
import { useAdminProfile } from '../hooks/useAdminProfile';

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const { fullName } = useAdminProfile();
  const adminName = fullName;

  const dateRanges = [
    { key: 'last7Days', defaultLabel: 'Last 7 Days' },
    { key: 'last30Days', defaultLabel: 'Last 30 Days' },
    { key: 'thisMonth', defaultLabel: 'This Month' },
    { key: 'thisYear', defaultLabel: 'This Year' },
  ];

  const [dateRangeKey, setDateRangeKey] = useState('last30Days');

  const { dateFrom, dateTo } = useMemo(
    () => getDateFromToParams(dateRangeKey),
    [dateRangeKey]
  );

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

          {/* Date Range Dropdown */}
          <PortalDropdown
            minWidth={140}
            animate={false}
            menuClassName="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden z-50"
            trigger={({ isOpen, toggle }) => (
              <button
                onClick={toggle}
                className="flex items-center gap-2 h-9 px-3.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <Calendar size={14} className="text-gray-400" />
                <span>
                  {t(`dashboardOverview.${dateRangeKey}`, dateRanges.find((r) => r.key === dateRangeKey)?.defaultLabel ?? '')}
                </span>
                <ChevronDown
                  size={13}
                  className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>
            )}
          >
            {({ close }) => (
              <div className="py-1">
                {dateRanges.map((r) => (
                  <button
                    key={r.key}
                    onClick={() => {
                      setDateRangeKey(r.key);
                      close();
                    }}
                    className={`w-full text-start px-3.5 py-2 text-xs transition-colors cursor-pointer ${
                      dateRangeKey === r.key
                        ? 'bg-green-50 text-green-700 font-semibold'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {t(`dashboardOverview.${r.key}`, r.defaultLabel)}
                  </button>
                ))}
              </div>
            )}
          </PortalDropdown>
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
