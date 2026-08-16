import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import type { Variants } from 'motion/react';
import { useBuyerOrders } from '../hooks/useBuyerOrders';

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 16 } },
};

function OrderStatusBadge({ status }: { status: string }) {
  const s = (status || '').toUpperCase();
  let badgeClass = 'bg-gray-100 text-gray-600';

  if (s === 'ACTIVE' || s === 'DELIVERED' || s === 'COMPLETED') {
    badgeClass = 'bg-emerald-100/80 text-emerald-700';
  } else if (s === 'SHIPPED' || s === 'PARTIALLY_SHIPPED') {
    badgeClass = 'bg-blue-100/80 text-blue-700';
  } else if (s === 'CANCELLED' || s === 'CANCELED') {
    badgeClass = 'bg-rose-100/80 text-rose-700';
  } else if (s === 'PENDING' || s === 'PROCESSING') {
    badgeClass = 'bg-amber-100/80 text-amber-800';
  }

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${badgeClass}`}>
      {status || '---'}
    </span>
  );
}

interface BuyerOrdersTableProps {
  buyerAccountId: string;
  isMobile: boolean;
}

export default function BuyerOrdersTable({ buyerAccountId, isMobile }: BuyerOrdersTableProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Fetch ONLY 4 orders for the Buyer Details page
  const { data, isLoading } = useBuyerOrders(buyerAccountId, 1, 4);

  const orders = data?.items || [];

  const handleSeeMore = () => {
    navigate(`/incoming-orders?buyerAccountId=${buyerAccountId}`);
  };

  return (
    <motion.div variants={cardVariants} className="space-y-3 pt-2">
      <h2 className="text-base font-bold text-gray-900">
        {isMobile ? t('buyers.details.recentOrders', 'Recent Orders') : t('buyers.details.allOrders', 'All Orders')}
      </h2>

      {isLoading ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-3 shadow-2xs">
          <div className="h-4 w-40 bg-gray-200 animate-pulse rounded" />
          <div className="h-4 w-full bg-gray-100 animate-pulse rounded" />
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400">
          <p className="text-sm">{t('buyers.details.noOrders', 'No orders found')}</p>
        </div>
      ) : isMobile ? (
        /* Mobile Cards View */
        <div className="space-y-3">
          {orders.map((order) => {
            const formattedAmount =
              typeof order.amount === 'number'
                ? `${order.amount.toFixed(2)} SAR`
                : order.amount === '---'
                ? '---'
                : `${order.amount} SAR`;

            return (
              <div
                key={order.rawId || order.id}
                className="bg-white rounded-2xl border border-gray-100 p-4 shadow-2xs"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-gray-900">{order.id}</span>
                  <OrderStatusBadge status={order.status} />
                </div>
                <p className="text-xs text-gray-400 mb-2">{order.date}</p>
                <p className="text-xs text-gray-500 mb-3">{order.products}</p>
                <div className="flex items-center justify-between pt-2 border-t border-gray-100/80">
                  <span className="font-bold text-sm text-emerald-600">
                    {formattedAmount}
                  </span>
                  <button
                    onClick={() => navigate(`/incoming-orders/${order.rawId}`)}
                    className="text-xs font-bold text-gray-900 underline hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    {t('buyers.table.viewDetails', 'View details')}
                  </button>
                </div>
              </div>
            );
          })}

          {/* Mobile See More Link */}
          <div className="flex justify-center pt-2 pb-1">
            <button
              onClick={handleSeeMore}
              className="text-xs font-semibold text-gray-500 hover:text-gray-900 underline cursor-pointer transition-colors"
            >
              {t('buyers.details.seeMore', 'See More')}
            </button>
          </div>
        </div>
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
                {orders.map((order) => {
                  const formattedAmount =
                    typeof order.amount === 'number'
                      ? `${order.amount.toFixed(2)} SAR`
                      : order.amount === '---'
                      ? '---'
                      : `${order.amount} SAR`;

                  return (
                    <tr
                      key={order.rawId || order.id}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-4 py-3.5 text-sm font-bold text-gray-900 whitespace-nowrap">
                        {order.id}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-gray-500 max-w-xs truncate">
                        {order.products}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-gray-400 whitespace-nowrap">
                        {order.date}
                      </td>
                      <td className="px-4 py-3.5 text-sm font-bold text-gray-900 whitespace-nowrap">
                        {formattedAmount}
                      </td>
                      <td className="px-4 py-3.5">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => navigate(`/incoming-orders/${order.rawId}`)}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium underline transition-colors cursor-pointer"
                        >
                          {t('buyers.details.view', 'View')}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Desktop See More Link */}
          <div className="flex justify-center pt-4 border-t border-gray-100 mt-2">
            <button
              onClick={handleSeeMore}
              className="text-xs font-semibold text-gray-500 hover:text-gray-900 underline cursor-pointer transition-colors"
            >
              {t('buyers.details.seeMore', 'See More')}
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
