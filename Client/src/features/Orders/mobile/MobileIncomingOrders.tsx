// features/Orders/mobile/MobileIncomingOrders.tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Loader2, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSubOrders } from '../useSubOrders';
import { getPaginationRange } from '../../../utils/pagination';
import type { SubOrder, SubOrderStatus } from '../types/subOrder';
import { STATUS_STYLES } from '../types/subOrder';
import MobileSubOrderDetails from './MobileSubOrderDetails';

const ITEMS_PER_PAGE = 8;

const TAB_TO_STATUS: Record<string, SubOrderStatus | undefined> = {
  allOrders: undefined,
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
};

const FILTER_TABS = [
  { key: 'allOrders', label: 'ordersPage.allOrders' },
  { key: 'PENDING', label: 'ordersPage.pending' },
  { key: 'PROCESSING', label: 'ordersPage.processing' },
  { key: 'SHIPPED', label: 'ordersPage.shipped' },
  { key: 'DELIVERED', label: 'ordersPage.delivered' },
  { key: 'CANCELLED', label: 'ordersPage.cancelled' },
];

const MobileIncomingOrders = () => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const [activeTab, setActiveTab] = useState('allOrders');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<SubOrder | null>(null);

  const statusFilter = TAB_TO_STATUS[activeTab];

  const { data, isLoading, isError } = useSubOrders({
    pageNum: currentPage,
    pageSize: ITEMS_PER_PAGE,
    status: statusFilter,
  });

  const orders = data?.items ?? [];
  const totalPages = data?.pagination?.totalPages ?? 0;
  const totalItems = data?.pagination?.totalItems ?? 0;
  const start = totalItems === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const end = Math.min(currentPage * ITEMS_PER_PAGE, totalItems);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  if (selectedOrder) {
    return (
      <MobileSubOrderDetails
        subOrderId={selectedOrder.id}
        onBack={() => setSelectedOrder(null)}
      />
    );
  }

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 px-4 pt-5 pb-6">
      <h1 className="text-xl font-bold text-gray-900 mb-4">
        {t('ordersPage.title', 'Orders')}
      </h1>

      {/* Filter tabs */}
      <div
        className="flex gap-2 overflow-x-auto mb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`relative px-4 py-1.5 rounded-xl text-sm font-medium whitespace-nowrap shrink-0 transition-colors ${
              activeTab === tab.key
                ? 'text-white'
                : 'border border-gray-200 text-gray-500 bg-white hover:bg-gray-50'
            }`}
          >
            {activeTab === tab.key && (
              <motion.div
                layoutId="mobile-orders-active-tab"
                className="absolute inset-0 bg-gray-900 rounded-xl"
                transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 35,
                  mass: 0.8,
                }}
              />
            )}
            <span className="relative z-10">{t(tab.label)}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${activeTab}-${currentPage}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
        >
          {isLoading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="animate-spin text-gray-400" size={32} />
            </div>
          ) : isError ? (
            <div className="text-center py-20 text-red-500 text-sm">
              {t('ordersPage.loadError', 'Failed to load orders.')}
            </div>
          ) : orders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-24 text-center"
            >
              <Package
                size={48}
                strokeWidth={1.2}
                className="text-gray-300 mb-4"
              />
              <h2 className="text-base font-semibold text-gray-700 mb-1">
                {t('ordersPage.noOrders', 'No orders yet')}
              </h2>
              <p className="text-sm text-gray-400">
                {t(
                  'ordersPage.noOrdersDesc',
                  'They will appear here once you receive your first order'
                )}
              </p>
            </motion.div>
          ) : (
            <div className="flex flex-col gap-3">
              {orders.map((order, index) => {
                const itemsTotal = order.items.reduce(
                  (s, i) => s + i.lineTotal,
                  0
                );
                const grandTotal = itemsTotal + order.shippingRateApplied;

                return (
                  <motion.button
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: index * 0.04 }}
                    onClick={() => setSelectedOrder(order)}
                    className="w-full text-left bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* Header row */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-gray-800">
                        #{order.id.slice(0, 8)}…
                      </span>
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[order.status]}`}
                      >
                        {order.status}
                      </span>
                    </div>

                    {/* Items */}
                    <p className="text-xs text-gray-500 mb-1">
                      {order.items.length}{' '}
                      {order.items.length === 1 ? 'item' : 'items'}
                      {order.items[0] && ` · ${order.items[0].productName}`}
                      {order.items.length > 1 &&
                        ` +${order.items.length - 1} more`}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        SAR {grandTotal.toLocaleString()}
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex items-center justify-between mt-5 pt-4 border-t border-gray-200"
            >
              <span className="text-xs text-gray-400">
                {t('ordersPage.showing', 'Showing')} {start}–{end}{' '}
                {t('ordersPage.of', 'of')} {totalItems}
              </span>
              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed transition-colors"
                    aria-label="Previous Page"
                  >
                    {isArabic ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                  </button>

                  {getPaginationRange(currentPage, totalPages).map((item, index) =>
                    item === '...' ? (
                      <span
                        key={`ellipsis-${index}`}
                        className="w-8 h-8 flex items-center justify-center text-xs text-gray-400 font-medium select-none"
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => setCurrentPage(item)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium border transition-colors ${
                          item === currentPage
                            ? 'bg-gray-900 text-white border-gray-900'
                            : 'border-gray-200 text-gray-500 bg-white hover:bg-gray-50'
                        }`}
                      >
                        {item}
                      </button>
                    )
                  )}

                  <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed transition-colors"
                    aria-label="Next Page"
                  >
                    {isArabic ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default MobileIncomingOrders;
