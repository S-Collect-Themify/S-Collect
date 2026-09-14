import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { mapAdminRefundToTableItem } from '../services/refunds';
import { useAdminRefunds } from '../features/Orders/hooks/useAdminRefunds';
import {
  OrderFilters,
  OrdersTable,
  Pagination,
  MobileOrderCard,
  EmptyState,
  OrdersSkeleton,
} from '../features/Orders';
import type { TableItem } from '../features/Orders/types';

export default function Refunds() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlVendorId = searchParams.get('vendorId');
  const urlBuyerAccountId = searchParams.get('buyerAccountId');
  const { isMobile } = useBreakpoint();

  // Pagination
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;

  // Filters State
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('all');
  const [customRange, setCustomRange] = useState<{ dateFrom: string; dateTo: string }>(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    return {
      dateFrom: thirtyDaysAgo.toISOString().split('T')[0],
      dateTo: now.toISOString().split('T')[0],
    };
  });

  const [vendorIdFilter] = useState<string | undefined>(urlVendorId || undefined);
  const [buyerAccountIdFilter] = useState<string | undefined>(urlBuyerAccountId || undefined);

  // Derived server params
  const startDateParam = useMemo(() => {
    const now = new Date();
    if (dateFilter === 'last7Days') return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    if (dateFilter === 'last30Days') return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    if (dateFilter === 'thisMonth') return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    if (dateFilter === 'thisYear') return new Date(now.getFullYear(), 0, 1).toISOString();
    if (dateFilter === 'custom' && customRange.dateFrom) {
      return new Date(customRange.dateFrom).toISOString();
    }
    return undefined;
  }, [dateFilter, customRange]);

  const endDateParam = useMemo(() => {
    if (dateFilter === 'custom' && customRange.dateTo) {
      const end = new Date(customRange.dateTo);
      end.setHours(23, 59, 59, 999);
      return end.toISOString();
    }
    return undefined;
  }, [dateFilter, customRange]);

  const statusParam = statusFilter !== 'All' ? statusFilter.toUpperCase() : undefined;
  const searchParam = debouncedSearch.trim() || undefined;

  // ─── Refunds Data ───
  const { data: refundsData, isLoading } = useAdminRefunds(
    {
      pageNum: page,
      pageSize: itemsPerPage,
      status: statusParam,
      vendorId: vendorIdFilter,
      buyerAccountId: buyerAccountIdFilter,
      search: searchParam,
      refundNumber: searchParam ? searchParam.trim().replace(/^(#?REF-|#)/i, '').trim() : undefined,
      dateFilter: dateFilter !== 'all' && dateFilter !== 'custom' ? dateFilter : undefined,
      startDate: startDateParam,
      endDate: endDateParam,
      sortBy: 'createdAt',
      sortOrder: 'DESC',
    },
    true
  );

  const displayRefunds = useMemo(() => {
    const list = (refundsData?.items || []).map(mapAdminRefundToTableItem);
    return list.sort((a, b) => {
      const timeA = a.rawCreatedAt ? new Date(a.rawCreatedAt).getTime() : 0;
      const timeB = b.rawCreatedAt ? new Date(b.rawCreatedAt).getTime() : 0;
      if (timeA !== timeB) return timeB - timeA;
      return String(b.code || '').localeCompare(String(a.code || ''), undefined, { numeric: true });
    });
  }, [refundsData?.items]);

  const refundsTotalCount = refundsData?.pagination?.totalItems ?? displayRefunds.length;
  const refundsTotalPages = refundsData?.pagination?.totalPages ?? Math.max(1, Math.ceil(refundsTotalCount / itemsPerPage));
  const safePage = Math.min(page, Math.max(1, refundsTotalPages));

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleStatusFilterChange = (val: string) => {
    setStatusFilter(val);
    setPage(1);
  };

  const handleDateFilterChange = (val: string) => {
    setDateFilter(val);
    setPage(1);
  };

  const handleApplyCustomDate = (from: string, to: string) => {
    setCustomRange({ dateFrom: from, dateTo: to });
    setDateFilter('custom');
    setPage(1);
  };

  const handleViewDetails = (item: TableItem) => {
    navigate(`/returns/${item.id}`);
  };

  return (
    <>
      {/* Header Container */}
      <div className="sidebar-page-container-header">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="font-bold text-gray-900 heading-page-title">
              {t('ordersPage.refunds', 'Refunds')}
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto py-6 sidebar-page-container">
        {/* Modular Filter Controls */}
        <OrderFilters
          activeMainTab="refunds"
          search={search}
          onSearchChange={handleSearchChange}
          statusFilter={statusFilter}
          onStatusFilterChange={handleStatusFilterChange}
          dateFilter={dateFilter}
          onDateFilterChange={handleDateFilterChange}
          customFrom={customRange.dateFrom}
          customTo={customRange.dateTo}
          onApplyCustomDate={handleApplyCustomDate}
        />

        {/* Content Views: Skeleton vs Mobile Cards vs Desktop Table */}
        {isLoading ? (
          <OrdersSkeleton isMobile={isMobile} />
        ) : isMobile ? (
          <div>
            {displayRefunds.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
                <EmptyState />
              </div>
            ) : (
              <>
                {displayRefunds.map((item) => (
                  <MobileOrderCard
                    key={item.id}
                    item={item}
                    type="refunds"
                    onViewDetails={handleViewDetails}
                  />
                ))}
                <Pagination
                  currentPage={safePage}
                  totalPages={refundsTotalPages}
                  totalItems={refundsTotalCount}
                  itemsPerPage={itemsPerPage}
                  displayedCount={displayRefunds.length}
                  onPageChange={setPage}
                  isMobile
                />
              </>
            )}
          </div>
        ) : (
          <div>
            <OrdersTable
              items={displayRefunds}
              activeMainTab="refunds"
              onViewDetails={handleViewDetails}
            />
            {refundsTotalCount > 0 && (
              <Pagination
                currentPage={safePage}
                totalPages={refundsTotalPages}
                totalItems={refundsTotalCount}
                itemsPerPage={itemsPerPage}
                displayedCount={displayRefunds.length}
                onPageChange={setPage}
              />
            )}
          </div>
        )}
      </div>
    </>
  );
}
