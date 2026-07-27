import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import type { Variants } from 'motion/react';
import type { BuyerOrder } from '../types/buyers';

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 16 } },
};

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

interface BuyerOrdersTableProps {
  orders: BuyerOrder[];
  isMobile: boolean;
}

export default function BuyerOrdersTable({ orders, isMobile }: BuyerOrdersTableProps) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const [page, setPage] = useState(1);
  const totalPages = 2;

  return (
    <motion.div variants={cardVariants} className="space-y-3 pt-2">
      <h2 className="text-base font-bold text-gray-900">
        {t('buyers.details.recentOrders', 'Recent Orders')}
      </h2>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400">
          <p className="text-sm">{t('buyers.details.noOrders', 'No orders yet')}</p>
        </div>
      ) : isMobile ? (
        /* Mobile Cards View */
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
        /* Desktop Table View */
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5">
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
  );
}
