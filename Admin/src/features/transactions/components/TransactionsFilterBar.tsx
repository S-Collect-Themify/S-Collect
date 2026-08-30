import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, ChevronDown, DollarSign, Calendar, Check } from 'lucide-react';
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
  { key: 'all', translationKey: 'allDates', defaultLabel: 'All Dates' },
  { key: 'last7Days', translationKey: 'last7Days', defaultLabel: 'Last 7 Days' },
  { key: 'last30Days', translationKey: 'last30Days', defaultLabel: 'Last 30 Days' },
  { key: 'thisMonth', translationKey: 'thisMonth', defaultLabel: 'This Month' },
  { key: 'thisYear', translationKey: 'thisYear', defaultLabel: 'This Year' },
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
    customFrom,
    customTo,
    setCustomRange,
  } = useTransactionStore();

  const [showCustomDateInputs, setShowCustomDateInputs] = useState(dateRangeKey === 'custom');
  const [tempDateFrom, setTempDateFrom] = useState(customFrom);
  const [tempDateTo, setTempDateTo] = useState(customTo);
  const [dateError, setDateError] = useState<string | null>(null);

  const getDateTriggerLabel = () => {
    if (dateRangeKey === 'custom' && customFrom && customTo) {
      return `${customFrom} ${isRtl ? '←' : '→'} ${customTo}`;
    }
    const currentOpt = DATE_RANGES.find((r) => r.key === dateRangeKey);
    return currentOpt
      ? t(`dashboardOverview.${currentOpt.translationKey}`, currentOpt.defaultLabel)
      : t('dashboardOverview.allDates', 'All Dates');
  };

  const handleApplyCustomDate = (close: () => void) => {
    if (!tempDateFrom || !tempDateTo) {
      setDateError(t('dashboardOverview.invalidDateRange', 'Please select both dates'));
      return;
    }
    if (tempDateFrom > tempDateTo) {
      setDateError(t('dashboardOverview.invalidDateRange', 'Start date must be before end date'));
      return;
    }
    setDateError(null);
    setCustomRange(tempDateFrom, tempDateTo);
    close();
  };

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
                    type="text"
                    inputMode="decimal"
                    value={tempMin}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '' || /^\d*\.?\d*$/.test(val)) {
                        setTempMin(val);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        applyTempAmount();
                        close();
                      }
                    }}
                    placeholder="0"
                    className="w-full h-8 px-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-900 focus:outline-none focus:border-gray-900 focus:bg-white placeholder-gray-500 transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="trans-max-amount" className="block text-[11px] font-semibold text-gray-700 mb-1">
                    {t('dashboardOverview.transactionsLog.maxAmount', 'Max Amount')}
                  </label>
                  <input
                    id="trans-max-amount"
                    type="text"
                    inputMode="decimal"
                    value={tempMax}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '' || /^\d*\.?\d*$/.test(val)) {
                        setTempMax(val);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        applyTempAmount();
                        close();
                      }
                    }}
                    placeholder="100000"
                    className="w-full h-8 px-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-900 focus:outline-none focus:border-gray-900 focus:bg-white placeholder-gray-500 transition-colors"
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
          minWidth={280}
          align={isRtl ? 'left' : 'right'}
          animate={false}
          menuClassName="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50 p-2"
          trigger={({ isOpen, toggle }) => (
            <button
              type="button"
              onClick={() => {
                setTempDateFrom(customFrom);
                setTempDateTo(customTo);
                setShowCustomDateInputs(dateRangeKey === 'custom');
                setDateError(null);
                toggle();
              }}
              className="flex items-center justify-between md:justify-start gap-2 py-2.5 px-3 rounded-lg border border-gray-200 text-body-sm text-gray-700 focus:outline-none focus:border-gray-900 transition-all bg-white cursor-pointer whitespace-nowrap w-full md:w-auto"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <Calendar size={14} className="text-gray-400 shrink-0" />
                <span className="truncate whitespace-nowrap leading-snug font-semibold text-gray-800">
                  {getDateTriggerLabel()}
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
            <div className="space-y-2">
              {/* Preset Buttons */}
              <div className="flex flex-col gap-0.5 pb-1.5 border-b border-gray-100">
                {DATE_RANGES.map((opt) => {
                  const isSelected = dateRangeKey === opt.key && !showCustomDateInputs;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => {
                        setShowCustomDateInputs(false);
                        setDateError(null);
                        setDateRangeKey(opt.key);
                        close();
                      }}
                      className={`w-full text-start px-3 py-2 text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-green-50 text-green-700 font-semibold'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span>{t(`dashboardOverview.${opt.translationKey}`, opt.defaultLabel)}</span>
                      {isSelected && <Check size={14} className="text-green-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Custom Date Option Toggle */}
              <div>
                <button
                  type="button"
                  onClick={() => {
                    setShowCustomDateInputs((prev) => !prev);
                    setDateError(null);
                  }}
                  className={`w-full text-start px-3 py-2 text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-between ${
                    dateRangeKey === 'custom' || showCustomDateInputs
                      ? 'bg-gray-100 text-gray-900 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span>{t('dashboardOverview.customRange', 'Custom Range')}</span>
                  <ChevronDown
                    size={12}
                    className={`transition-transform duration-200 ${
                      showCustomDateInputs ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Expandable Custom Date Inputs */}
                {showCustomDateInputs && (
                  <div className="mt-2.5 p-2.5 bg-gray-50/80 rounded-lg border border-gray-100 space-y-2.5">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-medium text-gray-500">
                        {t('dashboardOverview.fromDate', 'From Date')}
                      </label>
                      <input
                        type="date"
                        value={tempDateFrom}
                        onChange={(e) => {
                          setTempDateFrom(e.target.value);
                          setDateError(null);
                        }}
                        className="w-full h-8 px-2.5 text-xs bg-white border border-gray-200 rounded-md text-gray-800 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-medium text-gray-500">
                        {t('dashboardOverview.toDate', 'To Date')}
                      </label>
                      <input
                        type="date"
                        value={tempDateTo}
                        onChange={(e) => {
                          setTempDateTo(e.target.value);
                          setDateError(null);
                        }}
                        className="w-full h-8 px-2.5 text-xs bg-white border border-gray-200 rounded-md text-gray-800 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                      />
                    </div>

                    {dateError && <p className="text-[10px] font-medium text-rose-500">{dateError}</p>}

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleApplyCustomDate(close)}
                        className="flex-1 h-7.5 bg-black hover:bg-gray-800 text-white text-xs font-semibold rounded-md transition-colors cursor-pointer flex items-center justify-center"
                      >
                        {t('dashboardOverview.apply', 'Apply')}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowCustomDateInputs(false);
                          setDateError(null);
                        }}
                        className="px-2.5 h-7.5 border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 text-xs font-medium rounded-md transition-colors cursor-pointer"
                      >
                        {t('dashboardOverview.cancel', 'Cancel')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </PortalDropdown>
      </div>
    </div>
  );
};
