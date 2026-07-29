import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useBreakpoint } from '../../../hooks/useBreakpoint';
import { mapAdminOrderToTableItem } from '../../../services/orders';
import { mapAdminRefundToTableItem } from '../../../services/refunds';
import { useVendors } from '../../vendors/hooks/useVendors';
import { useAdminOrders } from './useAdminOrders';
import { useAdminRefunds } from './useAdminRefunds';
import type { TableItem, OrderMainTab } from '../types';

export const useOrdersLogic = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlVendorId = searchParams.get('vendorId');
  const urlVendorName = searchParams.get('vendorName') || searchParams.get('vendor');
  const { isMobile } = useBreakpoint();

  // Tab State
  const [activeMainTab, setActiveMainTab] = useState<OrderMainTab>('allOrders');

  // Filters State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('all');
  const [vendorFilter, setVendorFilter] = useState(urlVendorName || urlVendorId || 'All');
  const [vendorIdFilter, setVendorIdFilter] = useState<string | undefined>(urlVendorId || undefined);

  // Fetch real vendors list from backend
  const { data: vendorsList } = useVendors();

  useEffect(() => {
    const vName = searchParams.get('vendorName') || searchParams.get('vendor');
    const vId = searchParams.get('vendorId');
    if (vName) {
      setVendorFilter(vName);
    } else if (vId) {
      setVendorFilter(vId);
    }
    setVendorIdFilter(vId || undefined);
  }, [searchParams]);

  // Pagination State
  const [page, setPage] = useState(1);

  const itemsPerPage = isMobile && activeMainTab === 'refunds' ? 10 : 20;

  // React Query Hook for API Orders
  const apiVendorParam = vendorIdFilter || (vendorFilter !== 'All' ? vendorFilter : undefined);
  const {
    orders,
    pagination: ordersPagination,
    isLoading: isOrdersLoading,
  } = useAdminOrders(
    page,
    itemsPerPage,
    activeMainTab === 'allOrders',
    apiVendorParam
  );

  // React Query Hook for API Refunds
  const refundStatusParam = statusFilter !== 'All' ? statusFilter.toUpperCase() : undefined;
  const {
    data: refundsData,
    isLoading: isRefundsLoading,
  } = useAdminRefunds(
    {
      pageNum: page,
      pageSize: itemsPerPage,
      status: refundStatusParam,
    },
    activeMainTab === 'refunds'
  );

  const isLoading = activeMainTab === 'allOrders' ? isOrdersLoading : isRefundsLoading;

  // Convert raw API orders to UI TableItem objects
  const liveOrders = useMemo(() => {
    const rawItems = orders || [];
    return rawItems.map((order) => mapAdminOrderToTableItem(order));
  }, [orders]);

  // Convert raw API refunds to UI TableItem objects
  const liveRefunds = useMemo(() => {
    const rawItems = refundsData?.items || [];
    return rawItems.map((refund) => mapAdminRefundToTableItem(refund));
  }, [refundsData]);

  // Dynamically compute vendor options list from real API vendors and loaded orders
  const vendorOptions = useMemo(() => {
    const namesSet = new Set<string>();

    if (vendorsList && Array.isArray(vendorsList)) {
      vendorsList.forEach((v) => {
        if (v.businessName) namesSet.add(v.businessName);
      });
    }

    liveOrders.forEach((item) => {
      if (item.vendor) namesSet.add(item.vendor);
    });

    liveRefunds.forEach((item) => {
      if (item.vendor) namesSet.add(item.vendor);
    });

    if (vendorFilter && vendorFilter !== 'All') {
      namesSet.add(vendorFilter);
    }

    const sortedNames = Array.from(namesSet).sort((a, b) => a.localeCompare(b));
    return ['All', ...sortedNames];
  }, [vendorsList, liveOrders, liveRefunds, vendorFilter]);

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
        vendorFilter === 'All' ||
        (item.vendor && item.vendor.toLowerCase() === vendorFilter.toLowerCase()) ||
        (item.vendorId && item.vendorId === vendorIdFilter) ||
        (item.vendorId && item.vendorId === vendorFilter);

      return matchesSearch && matchesStatus && matchesVendor;
    });
  }, [liveOrders, search, statusFilter, vendorFilter, vendorIdFilter]);

  const filteredRefunds = useMemo(() => {
    return liveRefunds.filter((item) => {
      const searchLower = search.toLowerCase();
      const matchesSearch =
        !searchLower ||
        item.code.toLowerCase().includes(searchLower) ||
        (item.orderId && item.orderId.toLowerCase().includes(searchLower)) ||
        item.customer.toLowerCase().includes(searchLower) ||
        (item.vendor && item.vendor.toLowerCase().includes(searchLower)) ||
        (item.reason && item.reason.toLowerCase().includes(searchLower));

      const matchesStatus =
        statusFilter === 'All' || item.status.toLowerCase() === statusFilter.toLowerCase();

      const matchesVendor =
        vendorFilter === 'All' ||
        (item.vendor && item.vendor.toLowerCase() === vendorFilter.toLowerCase()) ||
        (item.vendorId && item.vendorId === vendorIdFilter) ||
        (item.vendorId && item.vendorId === vendorFilter);

      return matchesSearch && matchesStatus && matchesVendor;
    });
  }, [liveRefunds, search, statusFilter, vendorFilter, vendorIdFilter]);

  const activeDataset = activeMainTab === 'allOrders' ? filteredOrders : filteredRefunds;
  const totalCount =
    activeMainTab === 'allOrders'
      ? (ordersPagination?.totalItems ?? filteredOrders.length)
      : (refundsData?.pagination?.totalItems ?? filteredRefunds.length);

  const totalPages =
    activeMainTab === 'allOrders'
      ? (ordersPagination?.totalPages ?? Math.max(1, Math.ceil(totalCount / itemsPerPage)))
      : (refundsData?.pagination?.totalPages ?? Math.max(1, Math.ceil(totalCount / itemsPerPage)));

  const safePage = Math.min(page, totalPages);

  const paginatedData = useMemo(() => {
    return activeDataset;
  }, [activeDataset]);

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
    setVendorIdFilter(undefined);
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
    vendorOptions,
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
