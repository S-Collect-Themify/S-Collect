import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useBreakpoint } from '../../../hooks/useBreakpoint';
import {
  mapAdminOrderToTableItem,
  mapAdminSubOrderToTableItem,
} from '../../../services/orders';
import { useAdminOrders } from './useAdminOrders';
import { useAdminSubOrders } from './useAdminSubOrders';
import type { TableItem } from '../types';

export const useOrdersLogic = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
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

  // vendorId & buyerAccountId from URL
  const [prevSearchParams, setPrevSearchParams] = useState(searchParams.toString());
  const [vendorIdFilter, setVendorIdFilter] = useState<string | undefined>(urlVendorId || undefined);
  const [buyerAccountIdFilter, setBuyerAccountIdFilter] = useState<string | undefined>(urlBuyerAccountId || undefined);

  const currentParamsStr = searchParams.toString();
  if (currentParamsStr !== prevSearchParams) {
    setPrevSearchParams(currentParamsStr);
    setVendorIdFilter(urlVendorId || undefined);
    setBuyerAccountIdFilter(urlBuyerAccountId || undefined);
    setPage(1);
  }

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

  // ─── Mode: vendor-filtered sub-orders vs. all orders ─────────────────────────
  const isVendorFiltered = Boolean(vendorIdFilter);

  // ─── Sub-orders (vendor-filtered mode) ───────────────────────────────────────
  const {
    subOrders,
    pagination: subOrdersPagination,
    isLoading: isSubOrdersLoading,
  } = useAdminSubOrders(
    {
      vendorId: vendorIdFilter,
      buyerAccountId: buyerAccountIdFilter,
      pageNum: page,
      pageSize: itemsPerPage,
      status: statusParam,
      search: searchParam,
      orderNumber: searchParam ? searchParam.trim().replace(/^(#?ORD-|#)/i, '').trim() : undefined,
      startDate: startDateParam,
      endDate: endDateParam,
    },
    isVendorFiltered
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
      buyerAccountId: buyerAccountIdFilter,
      status: statusParam,
      search: searchParam,
      orderNumber: searchParam ? searchParam.trim().replace(/^(#?ORD-|#)/i, '').trim() : undefined,
      dateFilter: dateFilter !== 'all' && dateFilter !== 'custom' ? dateFilter : undefined,
      startDate: startDateParam,
      endDate: endDateParam,
    },
    !isVendorFiltered
  );

  const isLoading = isVendorFiltered ? isSubOrdersLoading : isOrdersLoading;

  // ─── Map to TableItem for table rendering ───
  const displayOrders = useMemo(() => {
    return isVendorFiltered
      ? subOrders.map(mapAdminSubOrderToTableItem)
      : (orders ?? []).map(mapAdminOrderToTableItem);
  }, [isVendorFiltered, subOrders, orders]);

  // ─── Pagination numbers (always from server) ─────────────────────────────────
  const activePagination = isVendorFiltered ? subOrdersPagination : ordersPagination;

  const ordersTotalCount = activePagination?.totalItems ?? displayOrders.length;
  const ordersTotalPages = activePagination?.totalPages ?? Math.max(1, Math.ceil(ordersTotalCount / itemsPerPage));

  const totalCount = ordersTotalCount;
  const totalPages = ordersTotalPages;
  const safePage = Math.min(page, Math.max(1, totalPages));

  // ─── Handlers ────────────────────────────────────────────────────────────────
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

  const handleBuyerFilterChange = (id: string | undefined) => {
    setBuyerAccountIdFilter(id);
    setPage(1);
    const newParams = new URLSearchParams(searchParams);
    if (id) {
      newParams.set('buyerAccountId', id);
    } else {
      newParams.delete('buyerAccountId');
    }
    setSearchParams(newParams);
  };

  const handleViewDetails = (item: TableItem) => {
    navigate(`/incoming-orders/${item.id}`);
  };

  return {
    activeMainTab: 'allOrders' as const,
    search,
    handleSearchChange,
    statusFilter,
    handleStatusFilterChange,
    dateFilter,
    handleDateFilterChange,
    customRange,
    handleApplyCustomDate,
    buyerAccountIdFilter,
    handleBuyerFilterChange,
    setPage,
    safePage,
    isLoading,
    isMobile,
    totalCount,
    totalPages,
    itemsPerPage,
    displayOrders,
    ordersTotalCount,
    ordersTotalPages,
    isVendorFiltered,
    handleViewDetails,
  };
};
