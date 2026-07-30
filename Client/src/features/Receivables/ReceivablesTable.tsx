import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  ITEMS_PER_PAGE,
  type Transaction,
  type TransactionStatus,
} from './constants';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { useSubOrders } from '../Orders/useSubOrders';
import DateFilterDropdown from './DateFilterDropdown';
import StatusFilterDropdown from './StatusFilterDropdown';
import TransactionRow from './TransactionRow';
import MobileTransactionCard from './MobileTransactionCard';
import { getDateKey } from './utils';

type StatusFilter = TransactionStatus | 'all';

export default function ReceivablesTable() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const { isMobile } = useBreakpoint();

  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('all');
  const [selectedDate, setSelectedDate] = useState('all');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useSubOrders({
    pageNum: page,
    pageSize: ITEMS_PER_PAGE,
  });

  const transactions: Transaction[] = useMemo(() => {
    if (!data?.items) return [];
    return data.items.map((subOrder) => {
      const totalAmt =
        typeof (subOrder as any).totalAmount === 'number'
          ? (subOrder as any).totalAmount
          : (subOrder.items?.reduce(
              (acc, item) => acc + (item.lineTotal || 0),
              0
            ) || 0) + (subOrder.shippingRateApplied || 0);
      let statusMapped: TransactionStatus = 'pending';
      if (subOrder.status === 'DELIVERED') statusMapped = 'paid';
      else if (
        subOrder.status === 'PROCESSING' ||
        subOrder.status === 'SHIPPED'
      )
        statusMapped = 'processing';
      else if (subOrder.status === 'CANCELLED') statusMapped = 'failed';
      else statusMapped = 'pending';

      const d = new Date(subOrder.createdAt);
      const formattedDate = isNaN(d.getTime())
        ? subOrder.createdAt
        : d.toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });

      return {
        date: formattedDate,
        referenceNumber: `#${subOrder.id.slice(-8).toUpperCase()}`,
        status: statusMapped,
        amount: totalAmt,
      };
    });
  }, [data?.items, isArabic]);

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      // Status filter
      if (selectedStatus !== 'all' && tx.status !== selectedStatus)
        return false;

      // Date filter
      if (selectedDate !== 'all') {
        const txDateKey = getDateKey(tx.date);
        if (txDateKey !== selectedDate) return false;
      }

      return true;
    });
  }, [transactions, selectedStatus, selectedDate]);

  const totalItems = data?.pagination?.totalItems ?? filtered.length;
  const totalPages =
    data?.pagination?.totalPages ??
    Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);

  const rangeStart =
    totalItems === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const rangeEnd = Math.min(currentPage * ITEMS_PER_PAGE, totalItems);

  const handleStatusChange = (value: StatusFilter) => {
    setSelectedStatus(value);
    setPage(1);
  };

  const handleDateChange = (value: string) => {
    setSelectedDate(value);
    setPage(1);
  };

  const tableHeaders = [
    t('receivables.date'),
    t('receivables.referenceNumber'),
    t('receivables.status'),
    t('receivables.amount'),
  ];

  return (
    <div className="font-sans text-gray-800" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Filters */}
      <div className="flex flex-col gap-2.5 mb-5 sm:flex-row sm:items-center">
        <DateFilterDropdown
          selected={selectedDate}
          onChange={handleDateChange}
          transactions={transactions}
        />
        <StatusFilterDropdown
          selected={selectedStatus}
          onChange={handleStatusChange}
        />
      </div>

      {/* Table or mobile cards */}
      {isMobile ? (
        <div className="flex flex-col gap-3">
          {isLoading ? (
            <div className="text-center py-10 text-gray-400 animate-pulse">
              <p>{t('settings.loading') || 'Loading...'}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <i
                className="ti ti-receipt-off text-2xl block mb-2"
                aria-hidden="true"
              />
              <p>{t('receivables.noTransactions')}</p>
            </div>
          ) : (
            filtered.map((tx, i) => (
              <MobileTransactionCard
                key={tx.referenceNumber}
                transaction={tx}
                index={i}
              />
            ))
          )}
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="first:bg-gray-100">
                {tableHeaders.map((h) => (
                  <th
                    key={h}
                    className="px-3 py-2.5 border-b border-gray-100 text-start text-xs font-medium text-gray-500 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center py-10 text-gray-400 animate-pulse"
                  >
                    <p>{t('settings.loading') || 'Loading...'}</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-gray-400">
                    <i
                      className="ti ti-receipt-off text-2xl block mb-2"
                      aria-hidden="true"
                    />
                    <p>{t('receivables.noTransactions')}</p>
                  </td>
                </tr>
              ) : (
                filtered.map((tx, i) => (
                  <TransactionRow
                    key={tx.referenceNumber}
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
      <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
        <span className="text-sm text-gray-400">
          {t('receivables.showing', {
            start: rangeStart,
            end: rangeEnd,
            total: totalItems,
          })}
        </span>

        {totalPages > 1 && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPage(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
              aria-label="Previous page"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40"
            >
              {isArabic ? (
                <ChevronRight size={16} />
              ) : (
                <ChevronLeft size={16} />
              )}
            </button>

            {Array.from({ length: totalPages }).map((_, i) => {
              const n = i + 1;
              return (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium border transition-colors ${
                    n === currentPage
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {n}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage >= totalPages}
              aria-label="Next page"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40"
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
