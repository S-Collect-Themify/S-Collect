import { useState, useMemo, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useBreakpoint } from '../hooks/useBreakpoint';
import {
  getAdminOrders,
  mapAdminOrderToTableItem,
  type AdminOrderItem,
} from '../services/orders';
import {
  OrderFilters,
  OrdersTable,
  Pagination,
  MobileOrderCard,
  EmptyState,
  OrdersSkeleton,
  type TableItem,
} from '../features/Orders';

// ── Mock Data for Refunds (Retained for refunds tab if needed) ────────────
const BASE_REFUNDS: TableItem[] = [
  { id: 'r1', code: '#REF-77492-CS', orderId: '#ORD-77492-CS', customer: 'Yousef Al-Harbi', vendor: 'Al-Falah Crafts', reason: 'Wrong product received', date: 'Oct 24, 2026', total: 450, totalFormatted: '450.00 SAR', status: 'Pending' },
  { id: 'r2', code: '#REF-77491-CS', orderId: '#ORD-77491-CS', customer: 'Layan Mansour', vendor: 'Desert Bloom', reason: 'Damaged item', date: 'Oct 24, 2026', total: 1200, totalFormatted: '1,200.00 SAR', status: 'Approved' },
  { id: 'r3', code: '#REF-77490-CS', orderId: '#ORD-77490-CS', customer: 'Fahad Al-Otaibi', vendor: 'Oasis Tech', reason: 'Canceled by customer', date: 'Oct 24, 2026', total: 85, totalFormatted: '85.00 SAR', status: 'Rejected' },
  { id: 'r4', code: '#REF-77489-CS', orderId: '#ORD-77489-CS', customer: 'Sarah Khalid', vendor: 'Red Sea Styles', reason: 'Wrong size delivered', date: 'Oct 23, 2026', total: 320, totalFormatted: '320.00 SAR', status: 'Pending' },
  { id: 'r5', code: '#REF-77488-CS', orderId: '#ORD-77488-CS', customer: 'Abdulrahman Ali', vendor: 'Dates & Co', reason: 'Item not needed', date: 'Oct 23, 2026', total: 150, totalFormatted: '150.00 SAR', status: 'Approved' },
];

const MOCK_REFUNDS: TableItem[] = Array.from({ length: 25 }, (_, i) => {
  const base = BASE_REFUNDS[i % BASE_REFUNDS.length];
  const num = 77492 - i;
  return {
    ...base,
    id: `r_${i + 1}`,
    code: `#REF-${num}-CS`,
    orderId: `#ORD-${num}-CS`,
  };
});

export default function Orders() {
  const { t } = useTranslation();
  const { isMobile } = useBreakpoint();
  const navigate = useNavigate();

  // Tab State
  const [activeMainTab, setActiveMainTab] = useState<'allOrders' | 'refunds'>('allOrders');

  // API State for Orders
  const [rawOrders, setRawOrders] = useState<AdminOrderItem[]>([]);
  const [totalItemsCount, setTotalItemsCount] = useState<number>(0);

  // Filters State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('all');
  const [vendorFilter, setVendorFilter] = useState('All');

  // Pagination State
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const itemsPerPage = isMobile && activeMainTab === 'refunds' ? 10 : 25;

  // Fetch orders from /api/v1/admin/orders
  const fetchApiOrders = useCallback(async (pageNum: number) => {
    setIsLoading(true);
    try {
      const data = await getAdminOrders({
        pageNum,
        pageSize: itemsPerPage,
      });
      setRawOrders(data.items || []);
      setTotalItemsCount(data.pagination?.totalItems ?? (data.items?.length || 0));
    } catch (err) {
      console.error('Failed to fetch admin orders:', err);
      setRawOrders([]);
      setTotalItemsCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [itemsPerPage]);

  useEffect(() => {
    if (activeMainTab === 'allOrders') {
      fetchApiOrders(page);
    } else {
      setIsLoading(true);
      const timer = setTimeout(() => setIsLoading(false), 300);
      return () => clearTimeout(timer);
    }
  }, [page, activeMainTab, fetchApiOrders]);

  // Convert raw API orders to UI TableItem objects
  const liveOrders = useMemo(() => {
    return rawOrders.map((order) => mapAdminOrderToTableItem(order));
  }, [rawOrders]);

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
      const matchesSearch =
        !search ||
        item.code.toLowerCase().includes(search.toLowerCase()) ||
        (item.orderId && item.orderId.toLowerCase().includes(search.toLowerCase())) ||
        item.customer.toLowerCase().includes(search.toLowerCase()) ||
        (item.vendor && item.vendor.toLowerCase().includes(search.toLowerCase())) ||
        (item.reason && item.reason.toLowerCase().includes(search.toLowerCase()));

      const matchesStatus =
        statusFilter === 'All' || item.status === statusFilter;

      const matchesVendor =
        vendorFilter === 'All' || item.vendor === vendorFilter;

      return matchesSearch && matchesStatus && matchesVendor;
    });
  }, [search, statusFilter, vendorFilter]);

  const activeDataset = activeMainTab === 'allOrders' ? filteredOrders : filteredRefunds;
  const totalCount = activeMainTab === 'allOrders' ? (totalItemsCount || filteredOrders.length) : filteredRefunds.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage));
  const safePage = Math.min(page, totalPages);

  const paginatedData = useMemo(() => {
    if (activeMainTab === 'allOrders') {
      // Backend handles pagination for orders
      return activeDataset;
    }
    const start = (safePage - 1) * itemsPerPage;
    return activeDataset.slice(start, start + itemsPerPage);
  }, [activeMainTab, activeDataset, safePage, itemsPerPage]);

  const handleViewDetails = (item: TableItem) => {
    if (activeMainTab === 'refunds') {
      navigate(`/returns/${item.id}`);
    } else {
      navigate(`/incoming-orders/${item.id}`);
    }
  };

  return (
    <>
      {/* Header Container */}
      <div className="sidebar-page-container-header">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="font-bold text-gray-900 heading-page-title">
              {activeMainTab === 'allOrders'
                ? t('ordersPage.title', 'Orders')
                : t('ordersPage.refunds', 'Refunds')}
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto py-6 sidebar-page-container">
        {/* Modular Filter Controls */}
        <OrderFilters
          activeMainTab={activeMainTab}
          onMainTabChange={(tab) => {
            setActiveMainTab(tab);
            setStatusFilter('All');
            setPage(1);
          }}
          search={search}
          onSearchChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          statusFilter={statusFilter}
          onStatusFilterChange={(val) => {
            setStatusFilter(val);
            setPage(1);
          }}
          dateFilter={dateFilter}
          onDateFilterChange={(val) => {
            setDateFilter(val);
            setPage(1);
          }}
          vendorFilter={vendorFilter}
          onVendorFilterChange={(val) => {
            setVendorFilter(val);
            setPage(1);
          }}
        />

        {/* Content Views: Skeleton vs Mobile Cards vs Desktop Table */}
        {isLoading ? (
          <OrdersSkeleton isMobile={isMobile} />
        ) : isMobile ? (
          <div>
            {paginatedData.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
                <EmptyState />
              </div>
            ) : (
              <>
                {paginatedData.map((item) => (
                  <MobileOrderCard
                    key={item.id}
                    item={item}
                    type={activeMainTab}
                    onViewDetails={handleViewDetails}
                  />
                ))}
                <Pagination
                  currentPage={safePage}
                  totalPages={totalPages}
                  totalItems={totalCount}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setPage}
                  isMobile
                />
              </>
            )}
          </div>
        ) : (
          <div>
            <OrdersTable
              items={paginatedData}
              activeMainTab={activeMainTab}
              onViewDetails={handleViewDetails}
            />
            {totalCount > 0 && (
              <Pagination
                currentPage={safePage}
                totalPages={totalPages}
                totalItems={totalCount}
                itemsPerPage={itemsPerPage}
                onPageChange={setPage}
              />
            )}
          </div>
        )}
      </div>
    </>
  );
}
