import { useTranslation } from 'react-i18next';
import type { SubOrder, SubOrderStatus } from '../../Orders/types/subOrder';
import { STATUS_STYLES } from '../../Orders/types/subOrder';

interface MobileOrderCardsProps {
  orders: SubOrder[];
  getStatusLabel: (s: SubOrderStatus) => string;
  t: ReturnType<typeof useTranslation>['t'];
  onViewDetails: (id: string) => void;
}

const MobileOrderCards = ({
  orders,
  getStatusLabel,
  t,
  onViewDetails,
}: MobileOrderCardsProps) => (
  <div className="flex flex-col gap-3">
    {orders.map((order, index) => {
      const itemsTotal =
        order.items?.reduce((s, i) => s + (i.lineTotal ?? 0), 0) ?? 0;
      const grandTotal =
        typeof (order as any).totalAmount === 'number'
          ? (order as any).totalAmount
          : itemsTotal + (order.shippingRateApplied ?? 0);
      const firstProduct = order.items?.[0]?.productName ?? '—';
      const formattedId = `#${order.id.slice(0, 8).toUpperCase()}`;

      return (
        <div
          key={order.id}
          className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm tbl-animate-in"
          style={{ animationDelay: `${index * 70}ms` }}
        >
          {/* Top row: status badge + order ID */}
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
            <span className="text-xs font-semibold text-gray-700">
              {formattedId}
            </span>
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                STATUS_STYLES[order.status] ?? 'bg-gray-100 text-gray-600'
              }`}
            >
              {getStatusLabel(order.status)}
            </span>
          </div>

          {/* Bottom row: product info + date + amount + view button */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col min-w-0">
              <span className="font-medium text-gray-900 truncate leading-tight">
                {firstProduct}
                {order.items?.length > 1 && (
                  <span className="text-gray-400 text-xs ml-1">
                    +{order.items.length - 1}
                  </span>
                )}
              </span>
              <span className="text-xs text-gray-400">
                {new Date(order.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-900 tabular-nums shrink-0">
                {grandTotal.toLocaleString()}{' '}
                <span className="text-xs font-normal text-gray-500">
                  {t('dashboardMetrics.unit.sar', 'SAR')}
                </span>
              </span>
              <button
                onClick={() => onViewDetails(order.id)}
                className="text-xs font-medium text-amber-700 underline hover:text-amber-800 transition-colors"
              >
                {t('recentOrders.table.view', 'View')}
              </button>
            </div>
          </div>
        </div>
      );
    })}
  </div>
);

export default MobileOrderCards;
