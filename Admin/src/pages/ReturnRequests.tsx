import { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'motion/react';
import { useAdminRefunds } from '../features/Orders/hooks/useAdminRefunds';
import { getPaginationRange, DOTS } from '../utils/pagination';

const ITEMS_PER_PAGE = 7;

export function StatusBadge({ status }: { status: string }) {
  const { t } = useTranslation();

  const config: Record<string, { labelKey: string; defaultLabel: string; cls: string }> = {
    PENDING_REVIEW: {
      labelKey: 'returnsPage.statuses.pendingReview',
      defaultLabel: 'Pending Review',
      cls: 'bg-amber-100/90 text-amber-900 border-amber-300/70',
    },
    PENDING: {
      labelKey: 'returnsPage.statuses.pendingReview',
      defaultLabel: 'Pending Review',
      cls: 'bg-amber-100/90 text-amber-900 border-amber-300/70',
    },
    APPROVED: {
      labelKey: 'returnsPage.statuses.approved',
      defaultLabel: 'Approved',
      cls: 'bg-emerald-100/90 text-emerald-900 border-emerald-300/70',
    },
    REJECTED: {
      labelKey: 'returnsPage.statuses.rejected',
      defaultLabel: 'Rejected',
      cls: 'bg-rose-100/90 text-rose-900 border-rose-300/70',
    },
    AWAITING_ITEM: {
      labelKey: 'returnsPage.statuses.awaitingItem',
      defaultLabel: 'Awaiting Item',
      cls: 'bg-sky-100/90 text-sky-900 border-sky-300/70',
    },
    COMPLETED: {
      labelKey: 'returnsPage.statuses.completed',
      defaultLabel: 'Completed',
      cls: 'bg-emerald-100/90 text-emerald-900 border-emerald-300/70',
    },
  };

  const current = config[status] || config.PENDING;

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${current.cls}`}
    >
      {t(current.labelKey, { defaultValue: current.defaultLabel })}
    </span>
  );
}

export default function ReturnRequestsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  const statusParam = statusFilter !== 'ALL' ? statusFilter : undefined;

  const { data: refundsResponse, isLoading: loading } = useAdminRefunds({
    pageNum: currentPage,
    pageSize: ITEMS_PER_PAGE,
    status: statusParam,
  });

  const apiItems = useMemo(() => refundsResponse?.items || [], [refundsResponse?.items]);
  const totalItemsCount = refundsResponse?.pagination?.totalItems ?? apiItems.length;
  const totalPages = refundsResponse?.pagination?.totalPages ?? Math.max(1, Math.ceil(totalItemsCount / ITEMS_PER_PAGE));
  const activePage = Math.min(currentPage, totalPages);

  const mappedItems = useMemo(() => {
    return apiItems.map((ref) => {
      const firstProduct = ref.items?.[0];
      const customerName = ref.customer
        ? `${ref.customer.firstName || ''} ${ref.customer.lastName || ''}`.trim() || '--'
        : ref.shipping?.recipientName || '--';

      const shortId = ref.id ? (ref.id.length > 8 ? ref.id.slice(-6).toUpperCase() : ref.id) : '--';
      const orderShortId = ref.orderId ? (ref.orderId.length > 8 ? ref.orderId.slice(-6).toUpperCase() : ref.orderId) : '--';

      const dateObj = new Date(ref.createdAt);
      const formattedDate = isNaN(dateObj.getTime())
        ? '--'
        : dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

      return {
        rawId: ref.id,
        id: `#REF-${shortId}`,
        orderId: `#ORD-${orderShortId}`,
        customerName,
        productTitle: firstProduct?.productNameSnapshot || '--',
        productQty: (firstProduct as { quantity?: number })?.quantity || 1,
        productPrice: `SAR ${(ref.totalRefundAmount || 0).toFixed(2)}`,
        productImage: typeof firstProduct?.thumbnailUrl === 'string' && firstProduct.thumbnailUrl
          ? firstProduct.thumbnailUrl
          : 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=150',
        reason: firstProduct?.reason
          ? firstProduct.reason.replace(/_/g, ' ')
          : typeof ref.rejectionReason === 'string'
          ? ref.rejectionReason
          : 'Return request',
        requestedDate: formattedDate,
        status: ref.status || 'PENDING',
      };
    });
  }, [apiItems]);

  const filteredItems = useMemo(() => {
    if (!search.trim()) return mappedItems;
    const lower = search.toLowerCase();
    return mappedItems.filter(
      (item) =>
        item.id.toLowerCase().includes(lower) ||
        item.orderId.toLowerCase().includes(lower) ||
        item.customerName.toLowerCase().includes(lower) ||
        item.productTitle.toLowerCase().includes(lower)
    );
  }, [mappedItems, search]);

  const startIndex = (activePage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItemsCount);

  const paginationRange = useMemo(() => {
    return getPaginationRange({ currentPage: activePage, totalPages });
  }, [activePage, totalPages]);

  return (
    <div className="p-4 sm:p-6 md:p-8 flex-1">
      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 md:mb-6"
      >
        {t('returnsPage.title', { defaultValue: 'Return Requests' })}
      </motion.h1>

      {/* Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5"
      >
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label={t('returnsPage.searchPlaceholder', { defaultValue: 'Search by ID or Customer...' })}
            placeholder={t('returnsPage.searchPlaceholder', { defaultValue: 'Search by ID or Customer...' })}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-gray-900 transition-colors bg-gray-50/50 placeholder-gray-500"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
          <div className="relative flex-1 sm:flex-initial">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label={t('returnsPage.filterStatus', { defaultValue: 'Filter by Status' })}
              className="w-full appearance-none bg-white border border-gray-200 rounded-lg py-2.5 pl-3.5 pr-9 text-xs sm:text-sm font-medium text-gray-700 outline-none focus:border-gray-900 cursor-pointer"
            >
              <option value="ALL">{t('returnsPage.allStatuses', { defaultValue: 'Status: All Statuses' })}</option>
              <option value="PENDING_REVIEW">Pending Review</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="AWAITING_ITEM">Awaiting Item</option>
              <option value="COMPLETED">Completed</option>
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>

          <div className="relative flex-1 sm:flex-initial">
            <select
              aria-label={t('returnsPage.filterDate', { defaultValue: 'Filter by Date' })}
              className="w-full appearance-none bg-white border border-gray-200 rounded-lg py-2.5 pl-3.5 pr-9 text-xs sm:text-sm font-medium text-gray-700 outline-none focus:border-gray-900 cursor-pointer"
            >
              <option>{t('returnsPage.last30Days', { defaultValue: 'Date: Last 30 Days' })}</option>
              <option>Last 7 Days</option>
              <option>Last 90 Days</option>
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>
        </div>
      </motion.div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/70 text-xs font-bold text-gray-700 uppercase tracking-wider">
              <th className="py-4 px-4">{t('returnsPage.returnId', { defaultValue: 'Return ID' })}</th>
              <th className="py-4 px-4">{t('returnsPage.customer', { defaultValue: 'Customer' })}</th>
              <th className="py-4 px-4">{t('returnsPage.product', { defaultValue: 'Product' })}</th>
              <th className="py-4 px-4">{t('returnsPage.reason', { defaultValue: 'Reason' })}</th>
              <th className="py-4 px-4">{t('returnsPage.requestedDate', { defaultValue: 'Requested Date' })}</th>
              <th className="py-4 px-4">{t('returnsPage.status', { defaultValue: 'Status' })}</th>
              <th className="py-4 px-4 text-right">{t('returnsPage.action', { defaultValue: 'Action' })}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-gray-400">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-gray-900 border-t-transparent"></div>
                </td>
              </tr>
            ) : (
              <AnimatePresence mode="wait">
                {filteredItems.length > 0 ? (
                  filteredItems.map((item, idx) => (
                    <motion.tr
                      key={item.rawId}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15, delay: idx * 0.03 }}
                      className="hover:bg-gray-50/80 transition-colors"
                    >
                      <td className="py-4 px-4 font-bold text-amber-600 font-mono text-sm">{item.id}</td>
                      <td className="py-4 px-4 font-medium text-gray-900">{item.customerName}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.productImage}
                            alt={item.productTitle}
                            className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0"
                          />
                          <span className="font-semibold text-gray-900 truncate max-w-55">
                            {item.productTitle}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-600">{item.reason}</td>
                      <td className="py-4 px-4 text-gray-700 text-xs sm:text-sm">{item.requestedDate}</td>
                      <td className="py-4 px-4">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => navigate(`/returns/${encodeURIComponent(item.rawId)}`)}
                          className="font-bold text-gray-900 hover:text-gray-600 underline cursor-pointer transition-colors"
                        >
                          {t('returnsPage.review', { defaultValue: 'Review' })}
                        </button>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-400 text-sm">
                      No return requests found.
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View (Optimized for Mobile) */}
      <div className="md:hidden space-y-4">
        {loading ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-gray-200">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-gray-900 border-t-transparent"></div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {filteredItems.map((item, idx) => (
              <motion.div
                key={item.rawId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15, delay: idx * 0.03 }}
                className="bg-white rounded-2xl border border-gray-200 p-4.5 shadow-xs space-y-3.5"
              >
                {/* Top row: ID + Status */}
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-600 font-mono text-base">{item.id}</span>
                  <StatusBadge status={item.status} />
                </div>

                {/* Middle row: Thumbnail + Title + Customer */}
                <div className="flex items-start gap-3.5">
                  <img
                    src={item.productImage}
                    alt={item.productTitle}
                    className="w-14 h-14 rounded-lg object-cover border border-gray-200 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-gray-900 truncate">{item.productTitle}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Customer: <span className="font-medium text-gray-700">{item.customerName}</span>
                    </p>
                  </div>
                </div>

                {/* Bottom row: Reason + Date + Review button */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs">
                  <div>
                    <p className="text-gray-500">
                      Reason: <span className="text-gray-800 font-semibold">{item.reason}</span>
                    </p>
                    <p className="text-gray-400 text-[11px] mt-0.5">{item.requestedDate}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate(`/returns/${encodeURIComponent(item.rawId)}`)}
                    className="py-2 px-4 rounded-lg bg-gray-950 text-white text-xs font-semibold hover:bg-gray-800 transition-all cursor-pointer shadow-xs active:scale-95"
                  >
                    {t('returnsPage.review', { defaultValue: 'Review' })}
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Pagination Footer */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-gray-500">
        <p className="font-semibold text-gray-600">
          {filteredItems.length > 0
            ? `${startIndex + 1} - ${endIndex} of ${filteredItems.length} return requests`
            : '0 return requests'}
        </p>

        {/* Dynamic Interactive Pagination Controls */}
        <div className="flex items-center gap-2">
          {/* Previous Button */}
          <button
            type="button"
            disabled={activePage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed transition-all active:scale-95"
            aria-label="Previous Page"
          >
            <ChevronLeft size={18} />
          </button>

          {/* Page Number Buttons & Ellipsis */}
          {paginationRange.map((pageItem, idx) => {
            if (pageItem === DOTS) {
              return (
                <span
                  key={`dots-${idx}`}
                  className="w-10 h-10 flex items-center justify-center font-bold text-xs sm:text-sm text-gray-400 select-none tracking-widest"
                >
                  &#8230;
                </span>
              );
            }

            const page = Number(pageItem);
            const isActive = page === activePage;
            return (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs sm:text-sm font-mono transition-all cursor-pointer active:scale-95 ${
                  isActive
                    ? 'bg-gray-950 text-white shadow-md'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            );
          })}

          {/* Next Button */}
          <button
            type="button"
            disabled={activePage === totalPages || totalPages === 0}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed transition-all active:scale-95"
            aria-label="Next Page"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
