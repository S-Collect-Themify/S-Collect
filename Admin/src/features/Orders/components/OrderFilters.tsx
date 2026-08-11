import { Search, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PortalDropdown from '../../../components/ui/PortalDropdown';

export interface OrderFiltersProps {
  activeMainTab: 'allOrders' | 'refunds';
  onMainTabChange: (tab: 'allOrders' | 'refunds') => void;
  search: string;
  onSearchChange: (val: string) => void;
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
  dateFilter: string;
  onDateFilterChange: (val: string) => void;
}

export const OrderFilters = ({
  activeMainTab,
  onMainTabChange,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  dateFilter,
  onDateFilterChange,
}: OrderFiltersProps) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const dateOptions = [
    { key: 'all', labelKey: 'ordersPage.dateOptions.all', defaultLabel: 'All Time' },
    { key: 'last7Days', labelKey: 'ordersPage.dateOptions.last7Days', defaultLabel: 'Last 7 Days' },
    { key: 'last30Days', labelKey: 'ordersPage.dateOptions.last30Days', defaultLabel: 'Last 30 Days' },
    { key: 'thisMonth', labelKey: 'ordersPage.dateOptions.thisMonth', defaultLabel: 'This Month' },
    { key: 'thisYear', labelKey: 'ordersPage.dateOptions.thisYear', defaultLabel: 'This Year' },
  ];

  const formatStatusDisplay = (st: string) => {
    if (st === 'All') return t('ordersPage.all', 'All');
    const defaultLabel = st
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
    return t(`ordersPage.statuses.${st}`, defaultLabel);
  };

  const currentStatusDisplay = formatStatusDisplay(statusFilter);

  const currentDateOption = dateOptions.find((d) => d.key === dateFilter);
  const currentDateDisplay = currentDateOption
    ? t(currentDateOption.labelKey, currentDateOption.defaultLabel)
    : t('ordersPage.dateOptions.all', 'All Time');


  return (
    <div>
      {/* Main Tab Toggle Pills Container (Matching Design Image) */}
      <div className="inline-flex items-center p-1 bg-[#EBEBEB] rounded-2xl mb-5">
        <button
          type="button"
          onClick={() => onMainTabChange('allOrders')}
          className={`px-6 py-2.5 rounded-lg text-body-sm font-bold transition-all cursor-pointer ${
            activeMainTab === 'allOrders'
              ? 'bg-black text-white shadow-2xs'
              : 'bg-transparent text-gray-700 hover:text-gray-900'
          }`}
        >
          {t('ordersPage.allOrders', 'All Orders')}
        </button>
        <button
          type="button"
          onClick={() => onMainTabChange('refunds')}
          className={`px-6 py-2.5 rounded-lg text-body-sm font-bold transition-all cursor-pointer ${
            activeMainTab === 'refunds'
              ? 'bg-black text-white shadow-2xs'
              : 'bg-transparent text-gray-700 hover:text-gray-900'
          }`}
        >
          {t('ordersPage.refunds', 'Refunds')}
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-start gap-3 mb-5">
        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search
            size={16}
            className={`absolute top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none ${
              isRtl ? 'right-3.5' : 'left-3.5'
            }`}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label={
              activeMainTab === 'allOrders'
                ? t('ordersPage.searchOrders', 'Search orders...')
                : t('ordersPage.searchRefunds', 'Search refunds...')
            }
            placeholder={
              activeMainTab === 'allOrders'
                ? t('ordersPage.searchOrders', 'Search orders...')
                : t('ordersPage.searchRefunds', 'Search refunds...')
            }
            className={`w-full py-2 rounded-lg border border-gray-200 text-body-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all bg-white ${
              isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'
            }`}
          />
        </div>

        {/* Dropdowns Row */}
        <div className="grid grid-cols-2 gap-2 md:flex md:items-center md:gap-3 shrink-0">
          {/* Status Dropdown */}
          <PortalDropdown
            minWidth={150}
            animate={false}
            menuClassName="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden z-50 py-1"
            trigger={({ isOpen, toggle }) => (
              <button
                type="button"
                onClick={toggle}
                className="flex items-center justify-between md:justify-start gap-2 py-2 px-3 rounded-lg border border-gray-200 text-body-sm text-gray-700 focus:outline-none hover:border-gray-300 transition-all bg-white cursor-pointer whitespace-nowrap w-full md:w-auto"
              >
                <span className="truncate">
                  {t('ordersPage.statusFilter', 'Status')}: {currentStatusDisplay}
                </span>
                <ChevronDown
                  size={14}
                  className={`text-gray-400 shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
            )}
          >
            {({ close }) => (
              <div>
                {(activeMainTab === 'allOrders'
                  ? ['All', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']
                  : ['All', 'Pending', 'Approved', 'Rejected']
                ).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => {
                      onStatusFilterChange(st);
                      close();
                    }}
                    className={`w-full text-start px-3.5 py-2 text-xs font-medium transition-colors hover:bg-gray-50 cursor-pointer ${
                      statusFilter === st
                        ? 'bg-gray-100 text-gray-900 font-semibold'
                        : 'text-gray-700'
                    }`}
                  >
                    {formatStatusDisplay(st)}
                  </button>
                ))}
              </div>
            )}
          </PortalDropdown>

          {/* Date Dropdown */}
          <PortalDropdown
            minWidth={165}
            animate={false}
            menuClassName="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden z-50 py-1"
            trigger={({ isOpen, toggle }) => (
              <button
                type="button"
                onClick={toggle}
                className="flex items-center justify-between md:justify-start gap-2 py-2 px-3 rounded-lg border border-gray-200 text-body-sm text-gray-700 focus:outline-none hover:border-gray-300 transition-all bg-white cursor-pointer whitespace-nowrap w-full md:w-auto"
              >
                <span className="truncate">
                  {t('ordersPage.dateFilter', 'Date')}: {currentDateDisplay}
                </span>
                <ChevronDown
                  size={14}
                  className={`text-gray-400 shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
            )}
          >
            {({ close }) => (
              <div>
                {dateOptions.map((d) => (
                  <button
                    key={d.key}
                    type="button"
                    onClick={() => {
                      onDateFilterChange(d.key);
                      close();
                    }}
                    className={`w-full text-start px-3.5 py-2 text-xs font-medium transition-colors hover:bg-gray-50 cursor-pointer ${
                      dateFilter === d.key
                        ? 'bg-gray-100 text-gray-900 font-semibold'
                        : 'text-gray-700'
                    }`}
                  >
                    {t(d.labelKey, d.defaultLabel)}
                  </button>
                ))}
              </div>
            )}
          </PortalDropdown>

        </div>
      </div>
    </div>
  );
};
