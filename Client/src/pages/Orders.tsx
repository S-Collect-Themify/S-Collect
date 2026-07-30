import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSubOrders } from '../features/Orders/useSubOrders';
import type {
  SubOrder,
  SubOrderStatus,
} from '../features/Orders/types/subOrder';
import { STATUS_STYLES } from '../features/Orders/types/subOrder';
import { OrderFilters } from '../features/Orders/components/OrderFilters';
import { Pagination } from '../features/Orders/components/Pagination';
import { EmptyState } from '../features/Orders/components/ EmptyState';
import { useBreakpoint } from '../hooks/useBreakpoint';
import MobileIncomingOrders from '../features/Orders/mobile/MobileIncomingOrders';

const ITEMS_PER_PAGE = 8;

const TAB_TO_STATUS: Record<string, SubOrderStatus | undefined> = {
  allOrders: undefined,
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
};

// ── Status label map ───────────────────────────────────────────────────────
const STATUS_LABEL: Record<SubOrderStatus, string> = {
  PENDING: 'Pending',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

// ── Skeleton loader ────────────────────────────────────────────────────────
const TableSkeleton = () => (
  <div className="animate-pulse">
    {Array.from({ length: 6 }).map((_, i) => (
      <div
        key={i}
        className="flex gap-6 items-center px-4 py-4 border-b border-gray-50 animate-pulse"
      >
        <div className="h-3.5 w-20 bg-gray-200 rounded" />
        <div className="h-3.5 w-24 bg-gray-200 rounded" />
        <div className="h-3.5 w-36 bg-gray-200 rounded flex-1" />
        <div className="h-3.5 w-20 bg-gray-200 rounded" />
        <div className="h-7 w-28 bg-gray-200 rounded-lg animate-pulse" />
        <div className="h-3.5 w-16 bg-gray-200 rounded" />
      </div>
    ))}
  </div>
);

// ── Desktop table ──────────────────────────────────────────────────────────
const SubOrdersTable = ({
  orders,
  onViewDetails,
}: {
  orders: SubOrder[];
  onViewDetails: (o: SubOrder) => void;
}) => {
  const { t } = useTranslation();

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50">
            {[
              t('ordersPage.orderId'),
              t('ordersPage.orderDate'),
              t('ordersPage.customerName'),
              t('ordersPage.totalAmount'),
              t('ordersPage.orderStatus'),
              t('ordersPage.actions'),
            ].map((h) => (
              <th
                key={h}
                className="text-left rtl:text-right py-3 px-4 text-xs text-gray-600 font-semibold"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {orders.map((order, index) => {
            const itemsTotal = order.items.reduce((s, i) => s + i.lineTotal, 0);
            const grandTotal = order.totalAmount ?? (itemsTotal + order.shippingRateApplied);
            const displayOrderId = order.orderNumber ? `#${order.orderNumber}` : `#${order.id.slice(0, 8).toUpperCase()}`;
            const customerName = order.customer
              ? `${order.customer.firstName} ${order.customer.lastName}`.trim()
              : (order.items[0]?.productName ?? '—');

            return (
              <motion.tr
                key={order.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: index * 0.04 }}
                className="border-b border-gray-100 hover:bg-gray-50/60 transition-colors"
              >
                {/* Order ID */}
                <td className="py-4 px-4 font-semibold text-gray-800 text-sm">
                  {displayOrderId}
                </td>

                {/* Date */}
                <td className="py-4 px-4 text-gray-500 text-sm whitespace-nowrap">
                  {new Date(order.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </td>

                {/* Customer Name */}
                <td className="py-4 px-4 text-gray-700 text-sm max-w-[200px] truncate font-medium">
                  {customerName}
                </td>

                {/* Total */}
                <td className="py-4 px-4 font-medium text-gray-900 text-sm whitespace-nowrap">
                  {grandTotal.toLocaleString()} SAR
                </td>

                {/* Status dropdown */}
                <td className="py-4 px-4">
                  <span
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium ${STATUS_STYLES[order.status]}`}
                  >
                    {STATUS_LABEL[order.status]}
                  </span>
                </td>

                {/* Actions */}
                <td className="py-4 px-4">
                  <button
                    onClick={() => onViewDetails(order)}
                    className="text-sm font-medium text-gray-800 underline underline-offset-2 hover:text-gray-500 cursor-pointer transition-colors whitespace-nowrap"
                  >
                    {t('ordersPage.viewDetails')}
                  </button>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// ── Desktop page ───────────────────────────────────────────────────────────
const IncomingOrdersDesktop = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('allOrders');
  const [sortNewest, setSortNewest] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const statusFilter = TAB_TO_STATUS[activeTab];

  const { data, isLoading, isError } = useSubOrders({
    pageNum: currentPage,
    pageSize: ITEMS_PER_PAGE,
    status: statusFilter,
  });

  const orders = data?.items ?? [];
  const totalItems = data?.pagination?.totalItems ?? 0;
  const totalPages = data?.pagination?.totalPages ?? 0;

  const sorted = sortNewest ? orders : [...orders].reverse();

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  return (
    <>
      <div className="sidebar-page-container-header heading-page-title font-bold">
        {t('ordersPage.title')}
      </div>
      <div className="flex-1 overflow-y-auto py-6 sidebar-page-container">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          {/* Filters row */}
          <div className="px-4 sm:px-5 pt-4 sm:pt-5 pb-0">
            <OrderFilters
              activeTab={activeTab}
              onTabChange={handleTabChange}
              sortNewest={sortNewest}
              onSortChange={(v) => setSortNewest(v === 'newest')}
            />
          </div>

          {/* Table / states */}
          {isLoading ? (
            <TableSkeleton />
          ) : isError ? (
            <div className="py-16 text-center text-red-500 text-sm">
              {t(
                'ordersPage.loadError',
                'Failed to load orders. Please try again.'
              )}
            </div>
          ) : sorted.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <SubOrdersTable
                orders={sorted}
                onViewDetails={(o) => navigate(`/incoming-orders/${o.id}`)}
              />
              <div className="px-4 py-3 border-t border-gray-100">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  itemsPerPage={ITEMS_PER_PAGE}
                  onPageChange={setCurrentPage}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

// ── Route component ────────────────────────────────────────────────────────
const IncomingOrders = () => {
  const { isMobile } = useBreakpoint();
  return isMobile ? <MobileIncomingOrders /> : <IncomingOrdersDesktop />;
};

export default IncomingOrders;
