import { useMemo } from 'react';
import { useTransactionStore } from '../store/transactionStore';
import {
  useAdminTransactions,
  TransactionsHeader,
  TransactionsFilterBar,
  TransactionsTable,
  TransactionsMobileList,
  TransactionsPagination,
} from '../features/transactions';

function getDateParamsFromRangeKey(rangeKey: string): { dateFrom?: string; dateTo?: string } {
  if (!rangeKey || rangeKey === 'all') return {};

  const now = new Date();
  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  if (rangeKey === 'last7Days') {
    const from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return { dateFrom: formatDate(from), dateTo: formatDate(now) };
  }
  if (rangeKey === 'last30Days') {
    const from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    return { dateFrom: formatDate(from), dateTo: formatDate(now) };
  }
  if (rangeKey === 'thisMonth') {
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    return { dateFrom: formatDate(from), dateTo: formatDate(now) };
  }
  if (rangeKey === 'thisYear') {
    const from = new Date(now.getFullYear(), 0, 1);
    return { dateFrom: formatDate(from), dateTo: formatDate(now) };
  }
  return {};
}

export default function Transactions() {
  const search = useTransactionStore((s) => s.search);
  const statusFilter = useTransactionStore((s) => s.statusFilter);
  const minAmount = useTransactionStore((s) => s.minAmount);
  const maxAmount = useTransactionStore((s) => s.maxAmount);
  const dateRangeKey = useTransactionStore((s) => s.dateRangeKey);
  const page = useTransactionStore((s) => s.page);
  const pageSize = useTransactionStore((s) => s.pageSize);

  const { dateFrom, dateTo } = useMemo(
    () => getDateParamsFromRangeKey(dateRangeKey),
    [dateRangeKey]
  );

  const parsedMin = minAmount !== '' ? parseFloat(minAmount) : undefined;
  const parsedMax = maxAmount !== '' ? parseFloat(maxAmount) : undefined;
  const amountMin = parsedMin !== undefined && !isNaN(parsedMin) ? parsedMin : undefined;
  const amountMax = parsedMax !== undefined && !isNaN(parsedMax) ? parsedMax : undefined;

  const queryParams = useMemo(
    () => ({
      status: statusFilter === 'ALL' ? undefined : statusFilter,
      search: search.trim() || undefined,
      dateFrom,
      dateTo,
      amountMin,
      amountMax,
    }),
    [statusFilter, search, dateFrom, dateTo, amountMin, amountMax]
  );

  // React Query hook fetching from GET /api/v1/admin/transactions
  const { data, isLoading } = useAdminTransactions({
    pageNum: page,
    pageSize,
    ...queryParams,
  });

  const transactions = data?.items || [];
  const pagination = data?.pagination || {
    currentPage: page,
    pageSize,
    totalItems: 0,
    totalPages: 0,
  };

  return (
    <>
      {/* Header Container */}
      <TransactionsHeader
        filteredTransactions={transactions}
        filterParams={queryParams}
      />

      {/* Main Body Container */}
      <div className="flex-1 overflow-y-auto py-6 sidebar-page-container">
        {/* Search & Filter Controls Bar */}
        <TransactionsFilterBar />

        {/* Card / Table Container */}
        <div className="overflow-hidden">
          {isLoading ? (
            /* Skeleton Loading State */
            <div className="p-5 space-y-4 animate-pulse">
              <div className="h-4 w-48 bg-gray-200 rounded-md" />
              {Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className="h-12 w-full bg-gray-100 rounded-lg" />
              ))}
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <TransactionsTable data={transactions} />

              {/* Mobile Card List View */}
              <TransactionsMobileList data={transactions} />

              {/* Pagination Controls */}
              <TransactionsPagination
                totalItems={pagination.totalItems}
                itemsPerPage={pageSize}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
}
