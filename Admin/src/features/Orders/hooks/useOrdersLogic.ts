import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBreakpoint } from '../../../hooks/useBreakpoint';
import { mapAdminOrderToTableItem } from '../../../services/orders';
import { useAdminOrders } from './useAdminOrders';
import { MOCK_REFUNDS } from '../data/mockRefunds';
import type { TableItem, OrderMainTab } from '../types';

export const useOrdersLogic = () => {
  const navigate = useNavigate();
  const { isMobile } = useBreakpoint();

  // Tab State
  const [activeMainTab, setActiveMainTab] = useState<OrderMainTab>('allOrders');

  // Filters State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('all');
  const [vendorFilter, setVendorFilter] = useState('All');

  // Pagination State
  const [page, setPage] = useState(1);

  const itemsPerPage = isMobile && activeMainTab === 'refunds' ? 10 : 20;

  // React Query Hook for API Orders
  const {
    orders,
    pagination,
    isLoading: isApiLoading,
  } = useAdminOrders(page, itemsPerPage, activeMainTab === 'allOrders');

  const isLoading = isApiLoading;

  // Convert raw API orders to UI TableItem objects
  const liveOrders = useMemo(() => {
    const rawItems = orders || [];
    return rawItems.map((order) => mapAdminOrderToTableItem(order));
  }, [orders]);

  // Filter Data
  const filteredOrders = useMemo(() => {
    return liveOrders.filter((item) => {
      const searchLower = search.toLowerCase();
      const matchesSearch =
        !searchLower ||
        item.code.toLowerCase().includes(searchLower) ||
        item.customer.toLowerCase().includes(searchLower) ||
        (item.vendor && item.vendor.toLowerCase().includes(searchLower));

      const matchesStatus =
        statusFilter === 'All' || item.status.toLowerCase() === statusFilter.toLowerCase();

      const matchesVendor =
        vendorFilter === 'All' || item.vendor === vendorFilter;

      return matchesSearch && matchesStatus && matchesVendor;
    });
  }, [liveOrders, search, statusFilter, vendorFilter]);

  const filteredRefunds = useMemo(() => {
    return MOCK_REFUNDS.filter((item) => {
      const searchLower = search.toLowerCase();
      const matchesSearch =
        !searchLower ||
        item.code.toLowerCase().includes(searchLower) ||
        (item.orderId && item.orderId.toLowerCase().includes(searchLower)) ||
        item.customer.toLowerCase().includes(searchLower) ||
        (item.vendor && item.vendor.toLowerCase().includes(searchLower)) ||
        (item.reason && item.reason.toLowerCase().includes(searchLower));

      const matchesStatus =
        statusFilter === 'All' || item.status === statusFilter;

      const matchesVendor =
        vendorFilter === 'All' || item.vendor === vendorFilter;

      return matchesSearch && matchesStatus && matchesVendor;
    });
  }, [search, statusFilter, vendorFilter]);

  const activeDataset = activeMainTab === 'allOrders' ? filteredOrders : filteredRefunds;
  const totalCount =
    activeMainTab === 'allOrders'
      ? (pagination?.totalItems ?? filteredOrders.length)
      : filteredRefunds.length;

  const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage));
  const safePage = Math.min(page, totalPages);

  const paginatedData = useMemo(() => {
    if (activeMainTab === 'allOrders') {
      return activeDataset;
    }
    const start = (safePage - 1) * itemsPerPage;
    return activeDataset.slice(start, start + itemsPerPage);
  }, [activeMainTab, activeDataset, safePage, itemsPerPage]);

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

  const handleVendorFilterChange = (val: string) => {
    setVendorFilter(val);
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
    vendorFilter,
    handleVendorFilterChange,
    page,
    setPage,
    safePage,
    isLoading,
    isMobile,
    totalCount,
    totalPages,
    itemsPerPage,
    paginatedData,
    handleViewDetails,
  };
};
