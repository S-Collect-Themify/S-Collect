import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import type { Variants } from 'motion/react';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { useBuyerStore, BUYER_MOCK_ORDERS } from '../features/buyers';
import type { BuyerOrder } from '../features/buyers';

// ── Motion variants ──────────────────────────────────────────────────────────

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 16 } },
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

// ── Order Status Badge ────────────────────────────────────────────────────────

function OrderStatusBadge({ status }: { status: BuyerOrder['status'] }) {
  const config: Record<BuyerOrder['status'], string> = {
    Active: 'bg-emerald-100/80 text-emerald-700',
    Completed: 'bg-blue-100/80 text-blue-700',
    Cancelled: 'bg-rose-100/80 text-rose-700',
    Pending: 'bg-amber-100/80 text-amber-800',
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${config[status]}`}>
      {status}
    </span>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export default function BuyerDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isMobile } = useBreakpoint();
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const buyers = useBuyerStore((s) => s.buyers);

  const buyerId = id ? parseInt(id, 10) : NaN;
  const buyer = buyers.find((b) => b.id === buyerId);

  const orders: BuyerOrder[] = useMemo(
    () => BUYER_MOCK_ORDERS[buyerId] ?? BUYER_MOCK_ORDERS[1] ?? [],
    [buyerId]
  );

  const [page, setPage] = useState(1);
  const totalPages = 2;

  if (!buyer) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 py-40 text-center">
        <p className="text-gray-500 text-sm">{t('buyers.details.buyerNotFound', 'Buyer not found')}</p>
        <button
          onClick={() => navigate('/buyers')}
          className="text-sm underline text-gray-600 cursor-pointer font-medium"
        >
          {t('buyers.details.backToBuyers', 'Back to Buyers')}
        </button>
      </div>
    );
  }

  const initials = getInitials(buyer.name);
  const avgOrderValue =
    buyer.ordersNum > 0 && buyer.totalSpent
      ? Math.round(buyer.totalSpent / buyer.ordersNum)
      : 0;

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 min-h-screen" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* ── Page Header Area (Matching OrderDetails & ReturnRequestDetails) ── */}
      <div className="sidebar-page-container-header bg-white border-b border-gray-200/80 py-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-bold text-gray-900 heading-page-title">
            {t('buyers.details.breadcrumbCurrent', 'Buyer Details')}
          </h1>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Link
              to="/buyers"
              className="hover:underline cursor-pointer text-gray-500 font-medium"
            >
              {t('buyers.details.breadcrumbParent', 'Buyers')}
            </Link>
            <ChevronRight size={12} className={isRtl ? 'rotate-180' : ''} />
            <span className="text-gray-900 font-semibold">{buyer.name}</span>
          </div>
        </div>
      </div>

      {/* ── Main Body Container ── */}
      <div className="sidebar-page-container py-6 bg-[#F8F8F8]">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          {/* 1. Buyer Profile Card */}
          {isMobile ? (
            /* Mobile Centered Card (Image 2 design) */
            <motion.div
              variants={cardVariants}
              className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col items-center text-center shadow-2xs"
            >
              <div className="w-16 h-16 rounded-full bg-[#E9E9E9] text-gray-900 font-bold text-xl flex items-center justify-center mb-3 shrink-0">
                {initials}
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-0.5">{buyer.name}</h2>
              <p className="text-xs text-gray-400 mb-2">{buyer.email}</p>
              <p className="text-xs text-gray-500 mb-2">
                {t('buyers.details.registrationDate', 'Registration Date:')}{' '}
                <strong className="font-semibold text-gray-800">{buyer.date}</strong>
              </p>
              {buyer.location && (
                <div className="flex items-center gap-1 text-xs text-red-500 font-medium">
                  <MapPin size={12} className="shrink-0" />
                  <span>{buyer.location}</span>
                </div>
              )}
            </motion.div>
          ) : (
            /* Desktop Standard Profile Card */
            <motion.div
              variants={cardVariants}
              className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-gray-800 text-white font-bold text-lg flex items-center justify-center shrink-0">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-gray-900">{buyer.name}</h2>
                  <p className="text-sm text-gray-500 mt-0.5">{buyer.email}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {t('buyers.details.registrationDate', 'Registration Date:')} {buyer.date}
                  </p>
                  {buyer.location && (
                    <div className="flex items-center gap-1.5 mt-1.5 text-xs text-red-500 font-medium">
                      <MapPin size={13} className="shrink-0" />
                      <span>{buyer.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* 2. Stats Row */}
          {isMobile ? (
            /* Mobile 2x2 Stats Grid with Emerald Labels (Image 2 design) */
            <motion.div
              variants={cardVariants}
              className="grid grid-cols-2 gap-3"
            >
              <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-2xs">
                <p className="text-xs font-semibold text-emerald-600 mb-1">
                  {t('buyers.details.totalOrders', 'Total Orders')}
                </p>
                <p className="text-lg font-bold text-gray-900">{buyer.ordersNum}</p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-2xs">
                <p className="text-xs font-semibold text-emerald-600 mb-1">
                  {t('buyers.details.totalSpent', 'Total Spent')}
                </p>
                <p className="text-lg font-bold text-gray-900">
                  {(buyer.totalSpent ?? 0).toLocaleString()} SAR
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-2xs">
                <p className="text-xs font-semibold text-emerald-600 mb-1">
                  {t('buyers.details.avgOrderValue', 'Average Order')}
                </p>
                <p className="text-lg font-bold text-gray-900">
                  {avgOrderValue.toLocaleString()} SAR
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-2xs">
                <p className="text-xs font-semibold text-emerald-600 mb-1">
                  {t('buyers.details.lastActive', 'Last Active')}
                </p>
                <p className="text-lg font-bold text-gray-900">
                  {buyer.lastActive ?? '2 days ago'}
                </p>
              </div>
            </motion.div>
          ) : (
            /* Desktop 4-column Stats Row */
            <motion.div
              variants={cardVariants}
              className="grid grid-cols-4 gap-4"
            >
              {[
                {
                  label: t('buyers.details.totalOrders', 'Total Orders'),
                  value: buyer.ordersNum,
                  unit: '',
                },
                {
                  label: t('buyers.details.totalSpent', 'Total Spent'),
                  value: (buyer.totalSpent ?? 0).toLocaleString(),
                  unit: 'SAR',
                },
                {
                  label: t('buyers.details.avgOrderValue', 'Average Order Value'),
                  value: avgOrderValue.toLocaleString(),
                  unit: 'SAR',
                },
                {
                  label: t('buyers.details.lastActive', 'Last Active'),
                  value: buyer.lastActive ?? '—',
                  unit: '',
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm p-4"
                >
                  <p className="text-xs text-gray-500 mb-2">{stat.label}</p>
                  <p className="text-xl font-bold text-gray-900">
                    {stat.value}
                    {stat.unit && (
                      <span className="text-xs font-normal text-gray-400 ms-1">{stat.unit}</span>
                    )}
                  </p>
                </div>
              ))}
            </motion.div>
          )}

          {/* 3. Recent Orders Section */}
          <motion.div variants={cardVariants} className="space-y-3 pt-2">
            <h2 className="text-base font-bold text-gray-900">
              {t('buyers.details.recentOrders', 'Recent Orders')}
            </h2>

            {orders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400">
                <p className="text-sm">{t('buyers.details.noOrders', 'No orders yet')}</p>
              </div>
            ) : isMobile ? (
              /* Mobile View matching Image 2 */
              <>
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white rounded-2xl border border-gray-100 p-4 shadow-2xs"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm text-gray-900">{order.id}</span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100/80 text-emerald-700">
                          {order.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mb-2">{order.date}</p>
                      <p className="text-xs text-gray-500 mb-3">{order.products}</p>
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100/80">
                        <span className="font-bold text-sm text-emerald-600">
                          {order.amount.toFixed(2)} SAR
                        </span>
                        <button
                          onClick={() => navigate(`/incoming-orders/${order.id.replace('#', '')}`)}
                          className="text-xs font-bold text-gray-900 underline hover:text-blue-600 transition-colors cursor-pointer"
                        >
                          {t('buyers.table.viewDetails', 'View details')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Mobile Pagination */}
                <div className="flex items-center justify-between pt-4">
                  <span className="text-xs text-gray-400">
                    {t('buyers.table.showing', {
                      start: 1,
                      end: Math.min(10, orders.length),
                      total: 235,
                      defaultValue: `Showing 1-10 of 235`,
                    })}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      {isRtl ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                    </button>
                    <button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      {isRtl ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* Desktop View matching standard app table */
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="w-full overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr>
                        {[
                          t('buyers.details.orderId', 'Order ID'),
                          t('buyers.details.products', 'Products'),
                          t('buyers.details.date', 'Date'),
                          t('buyers.details.amount', 'Amount'),
                          t('buyers.details.status', 'Status'),
                          t('buyers.details.action', 'Action'),
                        ].map((h) => (
                          <th
                            key={h}
                            className="px-4 py-3 border-b border-gray-100 text-start text-xs font-semibold text-gray-500 whitespace-nowrap bg-gray-50"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr
                          key={order.id}
                          className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="px-4 py-3.5 text-sm font-medium text-gray-800 whitespace-nowrap">
                            {order.id}
                          </td>
                          <td className="px-4 py-3.5 text-sm text-gray-600 max-w-xs truncate">
                            {order.products}
                          </td>
                          <td className="px-4 py-3.5 text-sm text-gray-500 whitespace-nowrap">
                            {order.date}
                          </td>
                          <td className="px-4 py-3.5 text-sm font-semibold text-gray-800 whitespace-nowrap">
                            {order.amount.toLocaleString()} SAR
                          </td>
                          <td className="px-4 py-3.5">
                            <OrderStatusBadge status={order.status} />
                          </td>
                          <td className="px-4 py-3.5">
                            <button
                              onClick={() => navigate(`/incoming-orders/${order.id.replace('#', '')}`)}
                              className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors cursor-pointer"
                            >
                              {t('buyers.details.view', 'View')}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
