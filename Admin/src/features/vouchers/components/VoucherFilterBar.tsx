import { Search, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useVoucherStore } from '../voucherStore';

interface VoucherFilterBarProps {
  availableTypes?: string[];
  activeCount?: number;
}

export const VoucherFilterBar = ({
  availableTypes = ['Percentage', 'Amount', 'Free Shipping'],
  activeCount = 12,
}: VoucherFilterBarProps) => {
  const { t } = useTranslation();
  const search = useVoucherStore((s) => s.search);
  const activeTab = useVoucherStore((s) => s.activeTab);
  const typeFilter = useVoucherStore((s) => s.typeFilter);
  const statusFilter = useVoucherStore((s) => s.statusFilter);

  const setSearch = useVoucherStore((s) => s.setSearch);
  const setActiveTab = useVoucherStore((s) => s.setActiveTab);
  const setTypeFilter = useVoucherStore((s) => s.setTypeFilter);
  const setStatusFilter = useVoucherStore((s) => s.setStatusFilter);

  return (
    <div className="space-y-4 mb-6">
      {/* Mobile Tabs Bar (Active | Expired | All) */}
      <div className="flex sm:hidden items-center gap-4 text-sm font-semibold border-b border-gray-100 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('active')}
          className={`flex items-center gap-1.5 cursor-pointer pb-1 transition-colors ${
            activeTab === 'active'
              ? 'text-gray-900 border-b-2 border-black'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <span>{t('vouchersListing.tabs.active')}</span>
          <span className="bg-black text-white text-[10px] px-1.5 py-0.5 rounded-full">
            {activeCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('expired')}
          className={`cursor-pointer pb-1 transition-colors ${
            activeTab === 'expired'
              ? 'text-gray-900 border-b-2 border-black'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          {t('vouchersListing.tabs.expired')}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`cursor-pointer pb-1 transition-colors ${
            activeTab === 'all'
              ? 'text-gray-900 border-b-2 border-black'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          {t('vouchersListing.tabs.all')}
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none rtl:left-auto rtl:right-3.5"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('vouchersListing.searchPlaceholder')}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-400 transition-all rtl:pl-4 rtl:pr-10"
          />
        </div>

        {/* 2 Dropdown Filters (Grid on mobile, flex on desktop) */}
        <div className="grid grid-cols-2 gap-2 w-full sm:w-auto sm:flex sm:items-center sm:gap-2.5">
          {/* Type Dropdown */}
          <div className="relative w-full sm:w-auto sm:inline-block">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-3 sm:px-4 py-2 pr-7 sm:pr-9 text-xs sm:text-sm text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-400 cursor-pointer rtl:pl-7 sm:rtl:pl-9 rtl:pr-3 sm:rtl:pr-4 truncate"
            >
              <option value="all" className="hidden sm:inline">
                {t('vouchersListing.filters.allTypes')}
              </option>
              <option value="all" className="sm:hidden">
                {t('vouchersListing.filters.typeMobile')}
              </option>
              {availableTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none rtl:right-auto rtl:left-2 sm:rtl:left-3"
            />
          </div>

          {/* Status Dropdown */}
          <div className="relative w-full sm:w-auto sm:inline-block">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-3 sm:px-4 py-2 pr-7 sm:pr-9 text-xs sm:text-sm text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-400 cursor-pointer rtl:pl-7 sm:rtl:pl-9 rtl:pr-3 sm:rtl:pr-4 truncate"
            >
              <option value="all" className="hidden sm:inline">
                {t('vouchersListing.filters.allStatuses')}
              </option>
              <option value="all" className="sm:hidden">
                {t('vouchersListing.filters.statusMobile')}
              </option>
              <option value="Active">{t('vouchersListing.statuses.active')}</option>
              <option value="Expired">{t('vouchersListing.statuses.expired')}</option>
            </select>
            <ChevronDown
              size={16}
              className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none rtl:right-auto rtl:left-2 sm:rtl:left-3"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
