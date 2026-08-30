import React, { useState } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PortalDropdown from '../../../components/ui/PortalDropdown';
import { OrderBuyerDropdown } from './OrderBuyerDropdown';

export interface OrderFiltersProps {
  activeMainTab: 'allOrders' | 'refunds';
  onMainTabChange: (tab: 'allOrders' | 'refunds') => void;
  search: string;
  onSearchChange: (val: string) => void;
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
  dateFilter: string;
  onDateFilterChange: (val: string) => void;
  customFrom?: string;
  customTo?: string;
  onApplyCustomDate?: (from: string, to: string) => void;
  buyerAccountId?: string;
  onBuyerAccountIdChange?: (val: string | undefined) => void;
}

export const OrderFilters: React.FC<OrderFiltersProps> = ({
  activeMainTab,
  onMainTabChange,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  dateFilter,
  onDateFilterChange,
  customFrom = '',
  customTo = '',
  onApplyCustomDate,
  buyerAccountId,
  onBuyerAccountIdChange,
}) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const [showCustomDateInputs, setShowCustomDateInputs] = useState(dateFilter === 'custom');
  const [tempDateFrom, setTempDateFrom] = useState(customFrom);
  const [tempDateTo, setTempDateTo] = useState(customTo);
  const [dateError, setDateError] = useState<string | null>(null);

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

  const getDateTriggerLabel = () => {
    if (dateFilter === 'custom' && customFrom && customTo) {
      return `${customFrom} ${isRtl ? '←' : '→'} ${customTo}`;
    }
    const currentDateOption = dateOptions.find((d) => d.key === dateFilter);
    return currentDateOption
      ? t(currentDateOption.labelKey, currentDateOption.defaultLabel)
      : t('ordersPage.dateOptions.all', 'All Time');
  };

  const handleApplyCustom = (close: () => void) => {
    if (!tempDateFrom || !tempDateTo) {
      setDateError(t('dashboardOverview.invalidDateRange', 'Please select both dates'));
      return;
    }
    if (tempDateFrom > tempDateTo) {
      setDateError(t('dashboardOverview.invalidDateRange', 'Start date must be before end date'));
      return;
    }
    setDateError(null);
    if (onApplyCustomDate) {
      onApplyCustomDate(tempDateFrom, tempDateTo);
    }
    close();
  };

  return (
    <div>
      {/* Main Tab Toggle Pills Container */}
      <div className="inline-flex items-center p-1 bg-[#EBEBEB] rounded-lg mb-5">
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
          onClick={() => {
            if (onBuyerAccountIdChange) onBuyerAccountIdChange(undefined);
            onMainTabChange('refunds');
          }}
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
                ? t('ordersPage.searchOrders', 'Search by order number...')
                : t('ordersPage.searchRefunds', 'Search by refund number...')
            }
            placeholder={
              activeMainTab === 'allOrders'
                ? t('ordersPage.searchOrders', 'Search by order number...')
                : t('ordersPage.searchRefunds', 'Search by refund number...')
            }
            className={`w-full py-2 p-0.5 rounded-lg border border-gray-200 text-body-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all bg-white ${
              isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'
            }`}
          />
        </div>

        {/* Dropdowns Row */}
        <div className="grid grid-cols-2 gap-2 md:flex md:items-center md:gap-3 shrink-0">
          {/* Buyer Dropdown (Only in All Orders tab) */}
          {activeMainTab === 'allOrders' && onBuyerAccountIdChange && (
            <OrderBuyerDropdown
              selectedBuyerId={buyerAccountId}
              onSelectBuyer={onBuyerAccountIdChange}
            />
          )}

          {/* Status Dropdown */}
          <PortalDropdown
            minWidth={150}
            animate={false}
            menuClassName="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden z-50 py-1"
            trigger={({ isOpen, toggle }) => (
              <button
                type="button"
                onClick={toggle}
                className="flex items-center justify-between md:justify-start gap-2 py-2 px-3 p-0.5 rounded-lg border border-gray-200 text-body-sm text-gray-700 focus:outline-none hover:border-gray-300 transition-all bg-white cursor-pointer whitespace-nowrap w-full md:w-auto"
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
                    className="w-full text-start px-3.5 py-2 text-xs font-medium transition-colors hover:bg-gray-50 cursor-pointer"
                  >
                    {formatStatusDisplay(st)}
                  </button>
                ))}
              </div>
            )}
          </PortalDropdown>

          {/* Date Dropdown with Custom Range */}
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
                  setShowCustomDateInputs(dateFilter === 'custom');
                  setDateError(null);
                  toggle();
                }}
                className="flex items-center justify-between md:justify-start gap-2 py-2 px-3 p-0.5 rounded-lg border border-gray-200 text-body-sm text-gray-700 focus:outline-none hover:border-gray-300 transition-all bg-white cursor-pointer whitespace-nowrap w-full md:w-auto"
              >
                <span className="truncate font-semibold text-gray-800">
                  {t('ordersPage.dateFilter', 'Date')}: {getDateTriggerLabel()}
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
              <div className="space-y-2">
                {/* Preset Buttons */}
                <div className="flex flex-col gap-0.5 pb-1.5 border-b border-gray-100">
                  {dateOptions.map((d) => {
                    const isSelected = dateFilter === d.key && !showCustomDateInputs;
                    return (
                      <button
                        key={d.key}
                        type="button"
                        onClick={() => {
                          setShowCustomDateInputs(false);
                          setDateError(null);
                          onDateFilterChange(d.key);
                          close();
                        }}
                        className={`w-full text-start px-3 py-2 text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-green-50 text-green-700 font-semibold'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span>{t(d.labelKey, d.defaultLabel)}</span>
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
                      dateFilter === 'custom' || showCustomDateInputs
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
                          onClick={() => handleApplyCustom(close)}
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
    </div>
  );
};
