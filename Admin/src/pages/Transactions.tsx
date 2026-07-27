import { useMemo, useEffect } from 'react';
import { useTransactionStore } from '../store/transactionStore';
import { mapAdminOrderToTransactionItem } from '../services/orders';
import { TransactionsHeader } from '../features/transactions/components/TransactionsHeader';
import { TransactionsFilterBar } from '../features/transactions/components/TransactionsFilterBar';
import { TransactionsTable } from '../features/transactions/components/TransactionsTable';
import { TransactionsMobileList } from '../features/transactions/components/TransactionsMobileList';
import { TransactionsPagination } from '../features/transactions/components/TransactionsPagination';

export default function Transactions() {
  const {
    rawOrders,
    search,
    statusFilter,
    minAmount,
    maxAmount,
    dateRangeKey,
    pageSize,
    totalItems,
    isLoading,
    fetchOrders,
  } = useTransactionStore();

  // Fetch orders from /api/v1/admin/orders on component mount
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Convert raw API orders to UI TransactionItem objects
  const transactions = useMemo(() => {
    return rawOrders.map((order) => mapAdminOrderToTransactionItem(order));
  }, [rawOrders]);

  // Helper for date range filtering
  const isWithinDateRange = (dateStr: string, rangeKey: string): boolean => {
    if (!dateStr || rangeKey === 'all' || !rangeKey) return true;
    const itemDate = new Date(dateStr);
    if (isNaN(itemDate.getTime())) return true;

    const now = new Date();
    const diffTime = now.getTime() - itemDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (rangeKey === 'last7Days') return diffDays >= 0 && diffDays <= 7;
    if (rangeKey === 'last30Days') return diffDays >= 0 && diffDays <= 30;
    if (rangeKey === 'thisMonth') {
      return (
        itemDate.getMonth() === now.getMonth() &&
        itemDate.getFullYear() === now.getFullYear()
      );
    }
    if (rangeKey === 'thisYear') {
      return itemDate.getFullYear() === now.getFullYear();
    }
    return true;
  };

  // Filtered transactions
  const filtered = useMemo(() => {
    return transactions.filter((item) => {
      const searchLower = search.toLowerCase();
      const matchesSearch =
        item.orderNo.toLowerCase().includes(searchLower) ||
        item.buyerName.toLowerCase().includes(searchLower) ||
        item.fatoorahRef.toLowerCase().includes(searchLower);

      const itemStatusUpper = (item.status || item.rawPaymentStatus || '').toUpperCase();
      const filterUpper = statusFilter.toUpperCase();

      let matchesStatus = true;
      if (filterUpper !== 'ALL') {
        if (filterUpper === 'PAID') {
          matchesStatus = ['PAID', 'CAPTURED', 'COMPLETED'].includes(itemStatusUpper);
        } else if (filterUpper === 'PENDING') {
          matchesStatus = ['PENDING', 'UNPAID', 'PROCESSING'].includes(itemStatusUpper);
        } else if (filterUpper === 'FAILED') {
          matchesStatus = ['FAILED', 'EXPIRED'].includes(itemStatusUpper);
        } else if (filterUpper === 'CANCELLED') {
          matchesStatus = ['CANCELLED', 'REFUNDED'].includes(itemStatusUpper);
        } else {
          matchesStatus = itemStatusUpper === filterUpper;
        }
      }

      let matchesAmount = true;
      const min = minAmount !== '' ? parseFloat(minAmount) : null;
      const max = maxAmount !== '' ? parseFloat(maxAmount) : null;

      if (min !== null && !isNaN(min)) {
        matchesAmount = matchesAmount && item.amount >= min;
      }
      if (max !== null && !isNaN(max)) {
        matchesAmount = matchesAmount && item.amount <= max;
      }

      const matchesDate = isWithinDateRange(item.date, dateRangeKey);

      return matchesSearch && matchesStatus && matchesAmount && matchesDate;
    });
  }, [transactions, search, statusFilter, minAmount, maxAmount, dateRangeKey]);

  return (
    <>
      {/* Header Container */}
      <TransactionsHeader filteredTransactions={filtered} />

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
              <TransactionsTable data={filtered} />

              {/* Mobile Card List View */}
              <TransactionsMobileList data={filtered} />

              {/* Pagination Controls */}
              <TransactionsPagination
                totalItems={totalItems || filtered.length}
                itemsPerPage={pageSize}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
}
