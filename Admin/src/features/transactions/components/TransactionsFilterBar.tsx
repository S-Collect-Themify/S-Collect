import React from 'react';
import { useTranslation } from 'react-i18next';
import { Search, ChevronDown, DollarSign, Calendar } from 'lucide-react';
import PortalDropdown from '../../../components/ui/PortalDropdown';
import { useTransactionStore } from '../../../store/transactionStore';
import type { TransactionStatusFilter } from '../types/transaction.types';

const STATUS_OPTIONS: { key: TransactionStatusFilter; labelKey: string; defaultLabel: string }[] = [
  { key: 'ALL', labelKey: 'statusAll', defaultLabel: 'Status: All' },
  { key: 'PENDING', labelKey: 'statusPending', defaultLabel: 'Status: Pending' },
  { key: 'PAID', labelKey: 'statusPaid', defaultLabel: 'Status: Paid' },
  { key: 'FAILED', labelKey: 'statusFailed', defaultLabel: 'Status: Failed' },
  { key: 'CANCELLED', labelKey: 'statusCancelled', defaultLabel: 'Status: Cancelled' },
];

const DATE_RANGES = [
  { key: 'all', defaultLabel: 'All Dates' },
  { key: 'last7Days', defaultLabel: 'Last 7 Days' },
  { key: 'last30Days', defaultLabel: 'Last 30 Days' },
  { key: 'thisMonth', defaultLabel: 'This Month' },
  { key: 'thisYear', defaultLabel: 'This Year' },
];

export const TransactionsFilterBar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    minAmount,
    maxAmount,
    tempMin,
    tempMax,
    setTempMin,
    setTempMax,
    initTempAmount,
    applyTempAmount,
    clearAmountFilter,
    dateRangeKey,
    setDateRangeKey,
  } = useTransactionStore();

  let amountLabel = t('dashboardOverview.transactionsLog.amountLabel', 'Amount');
  if (minAmount && maxAmount) {
    amountLabel = `${minAmount}-${maxAmount}`;
  } else if (minAmount) {
    amountLabel = `>=${minAmount}`;
  } else if (maxAmount) {
    amountLabel = `<=${maxAmount}`;
  }

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-end gap-3 mb-5">
      {/* Search Input */}
      <div className="relative flex-1 max-w-sm">
        <Search
          size={15}
          className={`absolute top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none ${
            isRtl ? 'right-3.5' : 'left-3.5'
          }`}
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label={t(
            'dashboardOverview.transactionsLog.searchPlaceholder',
            'Search order or buyer...'
          )}
          placeholder={t(
            'dashboardOverview.transactionsLog.searchPlaceholder',
            'Search order or buyer...'
          )}
          className={`w-full py-2.5 rounded-lg border border-gray-200 text-body-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all bg-white ${
            isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'
          }`}
        />
      </div>

      {/* Filters Row */}
      <div className="grid grid-cols-3 gap-2 md:flex md:items-center md:gap-3 shrink-0">
        {/* Status Dropdown */}
        <PortalDropdown
          minWidth={140}
          animate={false}
          menuClassName="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden z-50"
          trigger={({ isOpen, toggle }) => {
            const opt = STATUS_OPTIONS.find((o) => o.key === statusFilter);
            const statusText = opt
              ? t(`dashboardOverview.transactionsLog.${opt.labelKey}`, opt.defaultLabel)
              : statusFilter;

            return (
              <button
                type="button"
                onClick={toggle}
                className="flex items-center justify-between md:justify-start gap-2 py-2.5 px-3 rounded-lg border border-gray-200 text-body-sm text-gray-700 focus:outline-none focus:border-gray-900 transition-all bg-white cursor-pointer whitespace-nowrap w-full md:w-auto"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                  <span className="truncate whitespace-nowrap leading-snug">{statusText}</span>
                </div>
                <ChevronDown
                  size={14}
                  className={`shrink-0 text-gray-400 transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
            );
          }}
        >
          {({ close }) => (
            <div className="py-1">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => {
                    setStatusFilter(opt.key);
                    close();
                  }}
                  className={`w-full text-start px-3.5 py-2 text-xs transition-colors cursor-pointer whitespace-nowrap ${
                    statusFilter === opt.key
                      ? 'bg-green-50 text-green-700 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {t(`dashboardOverview.transactionsLog.${opt.labelKey}`, opt.defaultLabel)}
                </button>
              ))}
            </div>
          )}
        </PortalDropdown>

        {/* Amount Min/Max Dropdown */}
        <PortalDropdown
          align="center"
          minWidth={240}
          animate={false}
          menuClassName="bg-white border border-gray-200 rounded-2xl shadow-xl p-3.5 z-50"
          trigger={({ isOpen, toggle }) => (
            <button
              type="button"
              onClick={() => {
                initTempAmount();
                toggle();
              }}
              className="flex items-center justify-between md:justify-start gap-2 py-2.5 px-3 rounded-lg border border-gray-200 text-body-sm text-gray-700 focus:outline-none focus:border-gray-900 transition-all bg-white cursor-pointer whitespace-nowrap w-full md:w-auto"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <DollarSign size={14} className="text-blue-500 shrink-0" />
                <span className="truncate whitespace-nowrap leading-snug">{amountLabel}</span>
              </div>
              <ChevronDown
                size={14}
                className={`shrink-0 text-gray-400 transition-transform duration-200 ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
          )}
        >
          {({ close }) => (
            <div className="space-y-3">
              <div className="text-xs font-bold text-gray-900 border-b border-gray-100 pb-2">
                {t(
                  'dashboardOverview.transactionsLog.filterByAmount',
                  'Filter by Amount'
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="trans-min-amount" className="block text-[11px] font-semibold text-gray-700 mb-1">
                    {t('dashboardOverview.transactionsLog.minAmount', 'Min Amount')}
                  </label>
                  <input
                    id="trans-min-amount"
                    type="number"
                    value={tempMin}
                    onChange={(e) => setTempMin(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        applyTempAmount();
                        close();
                      }
                    }}
                    placeholder="0"
                    className="w-full h-8 px-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-900 focus:outline-none focus:border-gray-400 placeholder-gray-500"
                  />
                </div>
                <div>
                  <label htmlFor="trans-max-amount" className="block text-[11px] font-semibold text-gray-700 mb-1">
                    {t('dashboardOverview.transactionsLog.maxAmount', 'Max Amount')}
                  </label>
                  <input
                    id="trans-max-amount"
                    type="number"
                    value={tempMax}
                    onChange={(e) => setTempMax(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        applyTempAmount();
                        close();
                      }
                    }}
                    placeholder="100000"
                    className="w-full h-8 px-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-900 focus:outline-none focus:border-gray-400 placeholder-gray-500"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    clearAmountFilter();
                  }}
                  className="px-2.5 py-1 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
                >
                  {t('dashboardOverview.transactionsLog.clear', 'Clear')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    applyTempAmount();
                    close();
                  }}
                  className="px-3 py-1 bg-gray-950 text-white text-xs font-semibold rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  {t('dashboardOverview.transactionsLog.apply', 'Apply')}
                </button>
              </div>
            </div>
          )}
        </PortalDropdown>

        {/* Date Range Dropdown */}
        <PortalDropdown
          minWidth={140}
          animate={false}
          menuClassName="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden z-50"
          trigger={({ isOpen, toggle }) => (
            <button
              type="button"
              onClick={toggle}
              className="flex items-center justify-between md:justify-start gap-2 py-2.5 px-3 rounded-lg border border-gray-200 text-body-sm text-gray-700 focus:outline-none focus:border-gray-900 transition-all bg-white cursor-pointer whitespace-nowrap w-full md:w-auto"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <Calendar size={14} className="text-gray-400 shrink-0" />
                <span className="truncate whitespace-nowrap leading-snug">
                  {t(
                    `dashboardOverview.${dateRangeKey}`,
                    DATE_RANGES.find((r) => r.key === dateRangeKey)?.defaultLabel ?? ''
                  )}
                </span>
              </div>
              <ChevronDown
                size={14}
                className={`shrink-0 text-gray-400 transition-transform duration-200 ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
          )}
        >
          {({ close }) => (
            <div className="py-1">
              {DATE_RANGES.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => {
                    setDateRangeKey(opt.key);
                    close();
                  }}
                  className="w-full text-start px-3.5 py-2 text-xs transition-colors cursor-pointer whitespace-nowrap text-gray-700 hover:bg-gray-50"
                >
                  {t(`dashboardOverview.${opt.key}`, opt.defaultLabel)}
                </button>
              ))}
            </div>
          )}
        </PortalDropdown>
      </div>
    </div>
  );
};
