import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Download, Loader2 } from 'lucide-react';
import {
  ITEMS_PER_PAGE,
  type Transaction,
  type TransactionStatus,
} from './constants';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { usePayouts, useExportPayouts } from './usePayouts';
import DateFilterDropdown, {
  getDateRangeFromPreset,
} from './DateFilterDropdown';
import StatusFilterDropdown from './StatusFilterDropdown';
import TransactionRow from './TransactionRow';
import MobileTransactionCard from './MobileTransactionCard';
import { getPaginationRange } from '../../utils/pagination';

type StatusFilter = TransactionStatus | 'all';

export default function ReceivablesTable() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const { isMobile } = useBreakpoint();

  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('all');
  const [selectedDate, setSelectedDate] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [page, setPage] = useState(1);

  // Compute date range from preset or custom range (memoized to prevent re-query loops)
  const dateRange = useMemo(
    () =>
      getDateRangeFromPreset(
        selectedDate,
        customStartDate,
        customEndDate
      ),
    [selectedDate, customStartDate, customEndDate]
  );

  const payoutParams = useMemo(
    () => ({
      pageNum: page,
      pageSize: ITEMS_PER_PAGE,
      dateFrom: dateRange.dateFrom,
      dateTo: dateRange.dateTo,
    }),
    [page, dateRange.dateFrom, dateRange.dateTo]
  );

  const { data, isLoading } = usePayouts(payoutParams);

  const exportMutation = useExportPayouts();

  const payouts = data?.items ? [...data.items] : [];

  const transactions: Transaction[] = payouts.map((item) => {
    const rawDate = item.createdAt || item.transferDate;
    const d = rawDate ? new Date(rawDate) : null;
    const formattedDate =
      d && !isNaN(d.getTime())
        ? d.toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
        : rawDate || '-';

    const refDisplay = item.ref
      ? `#${item.ref}`
      : item.id
        ? `#${item.id.slice(-8).toUpperCase()}`
        : '-';

    return {
      id: item.id,
      date: formattedDate,
      referenceNumber: refDisplay,
      status: item.status || 'PENDING',
      amount: item.amount,
      isAdjustment: Boolean(item.isAdjustment),
      referenceNote: item.referenceNote,
      transferDate: item.transferDate,
      clarifyingNote: item.clarifyingNote,
      rawItem: item,
    };
  });

  const filtered = transactions.filter((tx) => {
    // Status filter
    if (selectedStatus !== 'all') {
      const txStatusNorm = tx.status?.toUpperCase();
      const selectedNorm = selectedStatus.toUpperCase();
      if (txStatusNorm !== selectedNorm) return false;
    }
    return true;
  });

  const totalItems = data?.pagination?.totalItems ?? filtered.length;
  const totalPages =
    data?.pagination?.totalPages ??
    Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, Math.max(1, totalPages));

  const rangeStart =
    totalItems === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const rangeEnd = Math.min(currentPage * ITEMS_PER_PAGE, totalItems);

  const handleStatusChange = (value: StatusFilter) => {
    setSelectedStatus(value);
    setPage(1);
  };

  const handleDateChange = (
    value: string,
    customRange?: { startDate?: string; endDate?: string }
  ) => {
    setSelectedDate(value);
    if (value.toLowerCase() === 'custom' && customRange) {
      setCustomStartDate(customRange.startDate || '');
      setCustomEndDate(customRange.endDate || '');
    } else if (value.toLowerCase() !== 'custom') {
      setCustomStartDate('');
      setCustomEndDate('');
    }
    setPage(1);
  };

  const handleExport = () => {
    exportMutation.mutate({
      dateFrom: dateRange.dateFrom,
      dateTo: dateRange.dateTo,
      status: selectedStatus !== 'ALL' ? selectedStatus : undefined,
    });
  };

  const tableHeaders = [
    t('receivables.date', { defaultValue: 'Date' }),
    t('receivables.referenceNumber', { defaultValue: 'Reference' }),
    t('receivables.status', { defaultValue: 'Status' }),
    t('receivables.amount', { defaultValue: 'Amount' }),
  ];

  return (
    <div className="font-sans text-gray-800" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Filters & Actions Bar */}
      <div className="flex flex-col gap-3 mb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2.5">
          <DateFilterDropdown
            selected={selectedDate}
            customStartDate={customStartDate}
            customEndDate={customEndDate}
            onChange={handleDateChange}
          />
          <StatusFilterDropdown
            selected={selectedStatus}
            onChange={handleStatusChange}
          />
        </div>

        {/* Export Excel Button */}
        <button
          type="button"
          onClick={handleExport}
          disabled={exportMutation.isPending}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white px-4 h-10 text-xs sm:text-sm font-medium transition-all shadow-xs cursor-pointer shrink-0"
        >
          {exportMutation.isPending ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Download size={16} />
          )}
          <span>
            {exportMutation.isPending
              ? t('receivables.exporting', { defaultValue: 'Exporting...' })
              : t('receivables.export', { defaultValue: 'Export to Excel' })}
          </span>
        </button>
      </div>

      {/* Table or mobile cards */}
      {isMobile ? (
        <div className="flex flex-col gap-3">
          {isLoading ? (
            <div className="text-center py-12 text-gray-400">
              <Loader2 size={24} className="animate-spin mx-auto mb-2 text-emerald-600" />
              <p className="text-sm font-medium">
                {t('settings.loading', { defaultValue: 'Loading transactions...' })}
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 p-8">
              <i
                className="ti ti-receipt-off text-3xl block mb-2 text-gray-300"
                aria-hidden="true"
              />
              <p className="text-sm font-medium text-gray-500">
                {t('receivables.noTransactions', { defaultValue: 'No payout transactions found' })}
              </p>
            </div>
          ) : (
            filtered.map((tx, i) => (
              <MobileTransactionCard
                key={tx.id || tx.referenceNumber || i}
                transaction={tx}
                index={i}
              />
            ))
          )}
        </div>
      ) : (
        <div className="w-full overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                {tableHeaders.map((h, i) => (
                  <th
                    key={h}
                    className={`px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap ${
                      i === tableHeaders.length - 1 ? 'text-end' : 'text-start'
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 bg-white">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center py-12 text-gray-400"
                  >
                    <Loader2 size={24} className="animate-spin mx-auto mb-2 text-emerald-600" />
                    <p className="text-sm font-medium">
                      {t('settings.loading', { defaultValue: 'Loading transactions...' })}
                    </p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-gray-400">
                    <i
                      className="ti ti-receipt-off text-3xl block mb-2 text-gray-300"
                      aria-hidden="true"
                    />
                    <p className="text-sm font-medium text-gray-500">
                      {t('receivables.noTransactions', { defaultValue: 'No payout transactions found' })}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((tx, i) => (
                  <TransactionRow
                    key={tx.id || tx.referenceNumber || i}
                    transaction={tx}
                    index={i}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-5 pt-4 border-t border-gray-100">
        <span className="text-xs sm:text-sm text-gray-500">
          {t('receivables.showing', {
            start: rangeStart,
            end: rangeEnd,
            total: totalItems,
            defaultValue: `Showing ${rangeStart}–${rangeEnd} of ${totalItems} transactions`,
          })}
        </span>

        {totalPages > 1 && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPage(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
              aria-label="Previous page"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
            >
              {isArabic ? (
                <ChevronRight size={16} />
              ) : (
                <ChevronLeft size={16} />
              )}
            </button>

            {getPaginationRange(currentPage, totalPages).map((item, index) =>
              item === '...' ? (
                <span
                  key={`ellipsis-${index}`}
                  className="w-8 h-8 flex items-center justify-center text-xs text-gray-400 font-medium select-none"
                >
                  ...
                </span>
              ) : (
                <button
                  key={item}
                  onClick={() => setPage(Number(item))}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                    item === currentPage
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {item}
                </button>
              )
            )}

            <button
              type="button"
              onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage >= totalPages}
              aria-label="Next page"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
            >
              {isArabic ? (
                <ChevronLeft size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
