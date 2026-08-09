import { useState, useMemo } from 'react';
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
  const urlBuyerAccountId = searchParams.get('buyerAccountId');
  const { isMobile } = useBreakpoint();

  // Tab State
  const [activeMainTab, setActiveMainTab] = useState<OrderMainTab>('allOrders');

  // Pagination
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;

  // Filters State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('all');

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
      buyerAccountId: buyerAccountIdFilter,
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

  // ─── Map to TableItem with Date Filter fallback ───
  const displayOrders = useMemo(() => {
    let list: TableItem[] = isVendorFiltered
      ? subOrders.map(mapAdminSubOrderToTableItem)
      : (orders ?? []).map(mapAdminOrderToTableItem);

    if (dateFilter && dateFilter !== 'all') {
      const now = new Date();
      let threshold = 0;

      if (dateFilter === 'last7Days' || dateFilter === '7days' || dateFilter === '7d') {
        threshold = now.getTime() - 7 * 24 * 60 * 60 * 1000;
      } else if (dateFilter === 'last30Days' || dateFilter === '30days' || dateFilter === '30d') {
        threshold = now.getTime() - 30 * 24 * 60 * 60 * 1000;
      } else if (dateFilter === 'thisMonth') {
        threshold = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
      } else if (dateFilter === 'thisYear') {
        threshold = new Date(now.getFullYear(), 0, 1).getTime();
      }

      if (threshold > 0) {
        list = list.filter((item) => {
          const timeStr = item.rawCreatedAt || item.date;
          if (!timeStr) return true;
          const itemTime = new Date(timeStr).getTime();
          return isNaN(itemTime) || itemTime >= threshold;
        });
      }
    }

    return list;
  }, [isVendorFiltered, subOrders, orders, dateFilter]);

  const displayRefunds = useMemo(() => {
    let list = (refundsData?.items || []).map(mapAdminRefundToTableItem);

    if (dateFilter && dateFilter !== 'all') {
      const now = new Date();
      let threshold = 0;

      if (dateFilter === 'last7Days' || dateFilter === '7days' || dateFilter === '7d') {
        threshold = now.getTime() - 7 * 24 * 60 * 60 * 1000;
      } else if (dateFilter === 'last30Days' || dateFilter === '30days' || dateFilter === '30d') {
        threshold = now.getTime() - 30 * 24 * 60 * 60 * 1000;
      } else if (dateFilter === 'thisMonth') {
        threshold = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
      } else if (dateFilter === 'thisYear') {
        threshold = new Date(now.getFullYear(), 0, 1).getTime();
      }

      if (threshold > 0) {
        list = list.filter((item) => {
          const timeStr = item.rawCreatedAt || item.date;
          if (!timeStr) return true;
          const itemTime = new Date(timeStr).getTime();
          return isNaN(itemTime) || itemTime >= threshold;
        });
      }
    }

    return list;
  }, [refundsData, dateFilter]);

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
