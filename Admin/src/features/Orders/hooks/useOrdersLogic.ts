import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useBreakpoint } from '../../../hooks/useBreakpoint';
import {
  mapAdminOrderToTableItem,
  mapAdminSubOrderToTableItem,
} from '../../../services/orders';
import { mapAdminRefundToTableItem } from '../../../services/refunds';
import { useAdminOrders } from './useAdminOrders';
import { useAdminSubOrders } from './useAdminSubOrders';
import { useAdminRefunds } from './useAdminRefunds';
import type { TableItem, OrderMainTab } from '../types';

export const useOrdersLogic = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlVendorId = searchParams.get('vendorId');
  const { isMobile } = useBreakpoint();

  // Tab State
  const [activeMainTab, setActiveMainTab] = useState<OrderMainTab>('allOrders');

  // Filters State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('all');

  // vendorId from URL — triggers sub-orders mode
  const [vendorIdFilter, setVendorIdFilter] = useState<string | undefined>(urlVendorId || undefined);

  useEffect(() => {
    const vId = searchParams.get('vendorId');
    setVendorIdFilter(vId || undefined);
    setPage(1);
  }, [searchParams]);

  // Pagination
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;

  // Derived server params
  const startDateParam = useMemo(() => {
    const now = new Date();
    if (dateFilter === 'last7Days') return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    if (dateFilter === 'last30Days') return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    if (dateFilter === 'thisMonth') return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    if (dateFilter === 'thisYear') return new Date(now.getFullYear(), 0, 1).toISOString();
    return undefined;
  }, [dateFilter]);

  const statusParam = statusFilter !== 'All' ? statusFilter.toUpperCase() : undefined;
  const searchParam = search.trim() || undefined;

  // ─── Mode: vendor-filtered sub-orders vs. all orders ─────────────────────────
  // When a vendorId is in the URL, we switch to /admin/sub-orders?vendorId=xxx
  // so the server returns only that vendor's sub-orders with accurate pagination.
  const isVendorFiltered = Boolean(vendorIdFilter);

  // ─── Sub-orders (vendor-filtered mode) ───────────────────────────────────────
  const {
    subOrders,
    pagination: subOrdersPagination,
    isLoading: isSubOrdersLoading,
  } = useAdminSubOrders(
    {
      vendorId: vendorIdFilter,
      pageNum: page,
      pageSize: itemsPerPage,
      status: statusParam,
      search: searchParam,
      startDate: startDateParam,
    },
    isVendorFiltered // only enabled when vendor filter is active
  );

  // ─── All orders (default mode) ────────────────────────────────────────────────
  const {
    orders,
    pagination: ordersPagination,
    isLoading: isOrdersLoading,
  } = useAdminOrders(
    {
      pageNum: page,
      pageSize: itemsPerPage,
      status: statusParam,
      search: searchParam,
      dateFilter: dateFilter !== 'all' ? dateFilter : undefined,
      startDate: startDateParam,
    },
    !isVendorFiltered // only enabled when NOT in vendor-filtered mode
  );

  // ─── Refunds ─────────────────────────────────────────────────────────────────
  const {
    data: refundsData,
    isLoading: isRefundsLoading,
  } = useAdminRefunds(
    {
      pageNum: page,
      pageSize: itemsPerPage,
      status: statusParam,
      vendorId: vendorIdFilter,
      search: searchParam,
      startDate: startDateParam,
    },
    true
  );

  const isLoading =
    activeMainTab === 'allOrders'
      ? isVendorFiltered ? isSubOrdersLoading : isOrdersLoading
      : isRefundsLoading;

  // ─── Map to TableItem (no client-side filtering — server already filtered) ───
  const displayOrders = useMemo(() => {
    if (isVendorFiltered) {
      return subOrders.map(mapAdminSubOrderToTableItem);
    }
    return (orders ?? []).map(mapAdminOrderToTableItem);
  }, [isVendorFiltered, subOrders, orders]);

  const displayRefunds = useMemo(
    () => (refundsData?.items || []).map(mapAdminRefundToTableItem),
    [refundsData]
  );

  // ─── Pagination numbers (always from server) ─────────────────────────────────
  const activePagination = isVendorFiltered ? subOrdersPagination : ordersPagination;

  const ordersTotalCount = activePagination?.totalItems ?? displayOrders.length;
  const ordersTotalPages = activePagination?.totalPages ?? Math.max(1, Math.ceil(ordersTotalCount / itemsPerPage));

  const refundsTotalCount = refundsData?.pagination?.totalItems ?? displayRefunds.length;
  const refundsTotalPages = refundsData?.pagination?.totalPages ?? Math.max(1, Math.ceil(refundsTotalCount / itemsPerPage));

  const totalCount = activeMainTab === 'allOrders' ? ordersTotalCount : refundsTotalCount;
  const totalPages = activeMainTab === 'allOrders' ? ordersTotalPages : refundsTotalPages;
  const safePage = Math.min(page, Math.max(1, totalPages));

  // ─── Handlers ────────────────────────────────────────────────────────────────
  const handleMainTabChange = (tab: OrderMainTab) => {
    setActiveMainTab(tab);
    setStatusFilter('All');
    setPage(1);
  };

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

  const handleViewDetails = (item: TableItem) => {
    if (activeMainTab === 'refunds') {
      navigate(`/returns/${item.id}`);
    } else {
      navigate(`/incoming-orders/${item.id}`);
    }
  };

  return {
    activeMainTab,
    handleMainTabChange,
    search,
    handleSearchChange,
    statusFilter,
    handleStatusFilterChange,
    dateFilter,
    handleDateFilterChange,
    setPage,
    safePage,
    isLoading,
    isMobile,
    totalCount,
    totalPages,
    itemsPerPage,
    displayOrders,
    displayRefunds,
    ordersTotalCount,
    ordersTotalPages,
    refundsTotalCount,
    refundsTotalPages,
    isVendorFiltered,
    handleViewDetails,
  };
};
