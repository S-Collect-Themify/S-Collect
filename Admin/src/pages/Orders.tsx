import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useBreakpoint } from '../hooks/useBreakpoint';
import {
  OrderFilters,
  OrdersTable,
  Pagination,
  MobileOrderCard,
  EmptyState,
  OrdersSkeleton,
  type TableItem,
} from '../features/Orders';


// ── Mock Data for Orders ──────────────────────────────────────────────────
const BASE_ORDERS: TableItem[] = [
  { id: '1', code: '#ORD-77492-CS', customer: 'Yousef Al-Harbi', vendor: 'Al-Falah Crafts', total: 450, totalFormatted: '450.00 SAR', status: 'Delivered', subOrdersCount: 12, date: 'Oct 24, 2026' },
  { id: '2', code: '#ORD-77491-CS', customer: 'Layan Mansour', vendor: 'Desert Bloom', total: 1200, totalFormatted: '1,200.00 SAR', status: 'Delivered', subOrdersCount: 5, date: 'Oct 24, 2026' },
  { id: '3', code: '#ORD-77490-CS', customer: 'Fahad Al-Otaibi', vendor: 'Oasis Tech', total: 85, totalFormatted: '85.00 SAR', status: 'Canceled', subOrdersCount: 20, date: 'Oct 24, 2026' },
  { id: '4', code: '#ORD-77489-CS', customer: 'Sarah Khalid', vendor: 'Red Sea Styles', total: 320, totalFormatted: '320.00 SAR', status: 'Shipped', subOrdersCount: 11, date: 'Oct 24, 2026' },
  { id: '5', code: '#ORD-77488-CS', customer: 'Abdulrahman Ali', vendor: 'Dates & Co', total: 150, totalFormatted: '150.00 SAR', status: 'Delivered', subOrdersCount: 2, date: 'Oct 24, 2026' },
  { id: '6', code: '#ORD-77487-CS', customer: 'Reem Abdullah', vendor: 'Urban Elegance', total: 550, totalFormatted: '550.00 SAR', status: 'Shipped', subOrdersCount: 4, date: 'Oct 24, 2026' },
  { id: '7', code: '#ORD-77486-CS', customer: 'Khaled Al-Saeed', vendor: 'Beauty Lab', total: 240, totalFormatted: '240.00 SAR', status: 'Delivered', subOrdersCount: 3, date: 'Oct 24, 2026' },
];

const MOCK_ORDERS: TableItem[] = Array.from({ length: 48 }, (_, i) => {
  const base = BASE_ORDERS[i % BASE_ORDERS.length];
  const num = 77492 - i;
  return {
    ...base,
    id: `${i + 1}`,
    code: `#ORD-${num}-CS`,
  };
});

// ── Mock Data for Refunds ─────────────────────────────────────────────────
const BASE_REFUNDS: TableItem[] = [
  { id: 'r1', code: '#REF-77492-CS', orderId: '#ORD-77492-CS', customer: 'Yousef Al-Harbi', vendor: 'Al-Falah Crafts', reason: 'Wrong product received', date: 'Oct 24, 2026', total: 450, totalFormatted: '450.00 SAR', status: 'Pending' },
  { id: 'r2', code: '#REF-77491-CS', orderId: '#ORD-77491-CS', customer: 'Layan Mansour', vendor: 'Desert Bloom', reason: 'Damaged item', date: 'Oct 24, 2026', total: 1200, totalFormatted: '1,200.00 SAR', status: 'Approved' },
  { id: 'r3', code: '#REF-77490-CS', orderId: '#ORD-77490-CS', customer: 'Fahad Al-Otaibi', vendor: 'Oasis Tech', reason: 'Canceled by customer', date: 'Oct 24, 2026', total: 85, totalFormatted: '85.00 SAR', status: 'Rejected' },
  { id: 'r4', code: '#REF-77489-CS', orderId: '#ORD-77489-CS', customer: 'Sarah Khalid', vendor: 'Red Sea Styles', reason: 'Wrong size delivered', date: 'Oct 23, 2026', total: 320, totalFormatted: '320.00 SAR', status: 'Pending' },
  { id: 'r5', code: '#REF-77488-CS', orderId: '#ORD-77488-CS', customer: 'Abdulrahman Ali', vendor: 'Dates & Co', reason: 'Item not needed', date: 'Oct 23, 2026', total: 150, totalFormatted: '150.00 SAR', status: 'Approved' },
  { id: 'r6', code: '#REF-77487-CS', orderId: '#ORD-77487-CS', customer: 'Reem Abdullah', vendor: 'Urban Elegance', reason: 'Quality issue', date: 'Oct 21, 2026', total: 550, totalFormatted: '550.00 SAR', status: 'Rejected' },
  { id: 'r7', code: '#REF-77486-CS', orderId: '#ORD-77486-CS', customer: 'Khaled Al-Saeed', vendor: 'Beauty Lab', reason: 'Duplicate order', date: 'Oct 23, 2026', total: 240, totalFormatted: '240.00 SAR', status: 'Pending' },
];

const MOCK_REFUNDS: TableItem[] = Array.from({ length: 235 }, (_, i) => {
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

  // Filters State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('last30Days');
  const [vendorFilter, setVendorFilter] = useState('All');

  // Pagination State
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Trigger skeleton loading animation on filter changes
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter, dateFilter, vendorFilter, page, activeMainTab]);

  const itemsPerPage = isMobile && activeMainTab === 'refunds' ? 10 : 7;

  // Filter Data
  const filteredOrders = useMemo(() => {
    return MOCK_ORDERS.filter((item) => {
      const matchesSearch =
        item.code.toLowerCase().includes(search.toLowerCase()) ||
        item.customer.toLowerCase().includes(search.toLowerCase()) ||
        (item.vendor && item.vendor.toLowerCase().includes(search.toLowerCase()));

      const matchesStatus =
        statusFilter === 'All' || item.status === statusFilter;

      const matchesVendor =
        vendorFilter === 'All' || item.vendor === vendorFilter;

      return matchesSearch && matchesStatus && matchesVendor;
    });
  }, [search, statusFilter, vendorFilter]);

  const filteredRefunds = useMemo(() => {
    return MOCK_REFUNDS.filter((item) => {
      const matchesSearch =
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
  const totalCount = activeDataset.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage));
  const safePage = Math.min(page, totalPages);

  const paginatedData = useMemo(() => {
    const start = (safePage - 1) * itemsPerPage;
    return activeDataset.slice(start, start + itemsPerPage);
  }, [activeDataset, safePage, itemsPerPage]);

  const handleViewDetails = (item: TableItem) => {
    if (activeMainTab === 'refunds') {
      navigate(`/returns/${item.id}`);
    } else {
      navigate(`/incoming-orders/${item.id}`);
    }
  };

  return (
    <>
      {/* Header Container (Matching Categories & Transactions) */}
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
        {/* Modular Filter Controls (Search + Main Tab Pills + Dropdowns) */}
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
