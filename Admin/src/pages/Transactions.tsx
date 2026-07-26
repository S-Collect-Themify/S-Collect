import { useMemo, useEffect } from 'react';
import { useTransactionStore } from '../store/transactionStore';
import type { TransactionItem } from '../features/transactions/types/transaction.types';
import { TransactionsHeader } from '../features/transactions/components/TransactionsHeader';
import { TransactionsFilterBar } from '../features/transactions/components/TransactionsFilterBar';
import { TransactionsTable } from '../features/transactions/components/TransactionsTable';
import { TransactionsMobileList } from '../features/transactions/components/TransactionsMobileList';
import { TransactionsPagination } from '../features/transactions/components/TransactionsPagination';

const getRelativeDateStr = (daysAgo: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

const MOCK_TRANSACTIONS: TransactionItem[] = [
  { id: '1', orderNo: '#ORD-2024-089', date: getRelativeDateStr(1), buyerName: 'Mohammed Al-Rashid', amount: 12450, paymentMethod: 'Mada', status: 'Captured', fatoorahRef: 'MF-78432901' },
  { id: '2', orderNo: '#ORD-2024-088', date: getRelativeDateStr(2), buyerName: 'Sarah Al-Otaibi', amount: 8900, paymentMethod: 'Visa', status: 'Captured', fatoorahRef: 'MF-78432902' },
  { id: '3', orderNo: '#ORD-2024-087', date: getRelativeDateStr(3), buyerName: 'Abdulrahman Al-Saeed', amount: 15200, paymentMethod: 'Apple Pay', status: 'Pending', fatoorahRef: 'MF-78432903' },
  { id: '4', orderNo: '#ORD-2024-086', date: getRelativeDateStr(4), buyerName: 'Fatimah Al-Ghamdi', amount: 5640, paymentMethod: 'Mada', status: 'Captured', fatoorahRef: 'MF-78432904' },
  { id: '5', orderNo: '#ORD-2024-085', date: getRelativeDateStr(5), buyerName: 'Khaled Al-Harbi', amount: 22100, paymentMethod: 'Apple Pay', status: 'Captured', fatoorahRef: 'MF-78432905' },
  { id: '6', orderNo: '#ORD-2024-084', date: getRelativeDateStr(6), buyerName: 'Noura Al-Qahtani', amount: 3400, paymentMethod: 'Visa', status: 'Failed', fatoorahRef: 'MF-78432906' },
  { id: '7', orderNo: '#ORD-2024-083', date: getRelativeDateStr(8), buyerName: 'Faisal Al-Shammari', amount: 11200, paymentMethod: 'Mada', status: 'Captured', fatoorahRef: 'MF-78432907' },
  { id: '8', orderNo: '#ORD-2024-082', date: getRelativeDateStr(10), buyerName: 'Tariq Al-Zahrani', amount: 7600, paymentMethod: 'Visa', status: 'Refunded', fatoorahRef: 'MF-78432908' },
  { id: '9', orderNo: '#ORD-2024-081', date: getRelativeDateStr(12), buyerName: 'Reem Al-Dossary', amount: 14800, paymentMethod: 'Apple Pay', status: 'Captured', fatoorahRef: 'MF-78432909' },
  { id: '10', orderNo: '#ORD-2024-080', date: getRelativeDateStr(15), buyerName: 'Youssef Al-Malki', amount: 9300, paymentMethod: 'Mada', status: 'Pending', fatoorahRef: 'MF-78432910' },
  { id: '11', orderNo: '#ORD-2024-079', date: getRelativeDateStr(18), buyerName: 'Hoda Al-Subaie', amount: 18400, paymentMethod: 'Visa', status: 'Captured', fatoorahRef: 'MF-78432911' },
  { id: '12', orderNo: '#ORD-2024-078', date: getRelativeDateStr(20), buyerName: 'Bandar Al-Mutairi', amount: 6200, paymentMethod: 'Mada', status: 'Captured', fatoorahRef: 'MF-78432912' },
  { id: '13', orderNo: '#ORD-2024-077', date: getRelativeDateStr(22), buyerName: 'Mona Al-Shehri', amount: 25100, paymentMethod: 'Apple Pay', status: 'Captured', fatoorahRef: 'MF-78432913' },
  { id: '14', orderNo: '#ORD-2024-076', date: getRelativeDateStr(25), buyerName: 'Sultan Al-Nasser', amount: 4900, paymentMethod: 'Visa', status: 'Pending', fatoorahRef: 'MF-78432914' },
  { id: '15', orderNo: '#ORD-2024-075', date: getRelativeDateStr(28), buyerName: 'Amal Al-Harthi', amount: 13700, paymentMethod: 'Mada', status: 'Captured', fatoorahRef: 'MF-78432915' },
  { id: '16', orderNo: '#ORD-2024-074', date: getRelativeDateStr(32), buyerName: 'Omar Al-Ghamdi', amount: 8400, paymentMethod: 'Apple Pay', status: 'Captured', fatoorahRef: 'MF-78432916' },
  { id: '17', orderNo: '#ORD-2024-073', date: getRelativeDateStr(35), buyerName: 'Laila Al-Rashid', amount: 16900, paymentMethod: 'Visa', status: 'Failed', fatoorahRef: 'MF-78432917' },
  { id: '18', orderNo: '#ORD-2024-072', date: getRelativeDateStr(40), buyerName: 'Ziad Al-Otaibi', amount: 5100, paymentMethod: 'Mada', status: 'Captured', fatoorahRef: 'MF-78432918' },
  { id: '19', orderNo: '#ORD-2024-071', date: getRelativeDateStr(45), buyerName: 'Asma Al-Saeed', amount: 19800, paymentMethod: 'Apple Pay', status: 'Refunded', fatoorahRef: 'MF-78432919' },
  { id: '20', orderNo: '#ORD-2024-070', date: getRelativeDateStr(50), buyerName: 'Hamad Al-Harbi', amount: 7200, paymentMethod: 'Mada', status: 'Captured', fatoorahRef: 'MF-78432920' },
];

const ITEMS_PER_PAGE = 20;

export default function Transactions() {
  const {
    search,
    statusFilter,
    minAmount,
    maxAmount,
    dateRangeKey,
    page,
    isLoading,
    setIsLoading,
  } = useTransactionStore();

  // Trigger skeleton loading on filter changes
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 350);
    return () => clearTimeout(timer);
  }, [search, statusFilter, minAmount, maxAmount, dateRangeKey, page, setIsLoading]);

  // Helper for date range filtering
  const isWithinDateRange = (dateStr: string, rangeKey: string): boolean => {
    if (!dateStr) return true;
    const itemDate = new Date(dateStr);
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
    return MOCK_TRANSACTIONS.filter((item) => {
      const searchLower = search.toLowerCase();
      const matchesSearch =
        item.orderNo.toLowerCase().includes(searchLower) ||
        item.buyerName.toLowerCase().includes(searchLower) ||
        item.fatoorahRef.toLowerCase().includes(searchLower);

      const matchesStatus =
        statusFilter === 'All' || item.status === statusFilter;

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
  }, [search, statusFilter, minAmount, maxAmount, dateRangeKey]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginatedData = useMemo(() => {
    return filtered.slice(
      (safePage - 1) * ITEMS_PER_PAGE,
      safePage * ITEMS_PER_PAGE
    );
  }, [filtered, safePage]);

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
                <div key={idx} className="h-12 w-full bg-gray-100 rounded-xl" />
              ))}
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <TransactionsTable data={paginatedData} />

              {/* Mobile Card List View */}
              <TransactionsMobileList data={paginatedData} />

              {/* Pagination Controls */}
              <TransactionsPagination
                totalItems={filtered.length}
                itemsPerPage={ITEMS_PER_PAGE}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
}
