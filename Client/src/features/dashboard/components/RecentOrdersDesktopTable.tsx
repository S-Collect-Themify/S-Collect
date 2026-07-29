import { useTranslation } from 'react-i18next';
import type { SubOrder, SubOrderStatus } from '../../Orders/types/subOrder';
import { STATUS_STYLES } from '../../Orders/types/subOrder';

interface RecentOrdersDesktopTableProps {
  orders: SubOrder[];
  getStatusLabel: (s: SubOrderStatus) => string;
  t: ReturnType<typeof useTranslation>['t'];
  onViewDetails: (id: string) => void;
}

const RecentOrdersDesktopTable = ({
  orders,
  getStatusLabel,
  t,
  onViewDetails,
}: RecentOrdersDesktopTableProps) => (
  <div className="overflow-x-auto overflow-y-auto">
    <table className="w-full border-collapse">
      <thead>
        <tr
          className="border-t border-gray-200 bg-gray-50 tbl-animate-in"
          style={{ animationDelay: '100ms' }}
        >
          <th className="px-8 py-4 text-left rtl:text-right text-sm font-medium text-gray-500">
            {t('recentOrders.table.id', 'Order ID')}
          </th>
          <th className="px-8 py-4 text-left rtl:text-right text-sm font-medium text-gray-500">
            {t('recentOrders.table.date', 'Date')}
          </th>
          <th className="px-8 py-4 text-left rtl:text-right text-sm font-medium text-gray-500">
            {t('recentOrders.table.customer', 'Items')}
          </th>
          <th className="px-8 py-4 text-left rtl:text-right text-sm font-medium text-gray-500">
            {t('recentOrders.table.amount', 'Amount')}
          </th>
          <th className="px-8 py-4 text-left rtl:text-right text-sm font-medium text-gray-500">
            {t('recentOrders.table.status', 'Status')}
          </th>
          <th className="px-8 py-4 text-left rtl:text-right text-sm font-medium text-gray-500">
            {t('recentOrders.table.action', 'Action')}
          </th>
        </tr>
      </thead>

      <tbody>
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
            <tr
              key={order.id}
              className="border-t border-gray-200 transition-colors hover:bg-gray-50 tbl-animate-in"
              style={{ animationDelay: `${200 + index * 60}ms` }}
            >
              <td className="px-8 py-6 font-medium text-amber-700">
                {formattedId}
              </td>

              <td className="px-8 py-6 text-gray-500 whitespace-nowrap">
                {new Date(order.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </td>

              <td className="px-8 py-6 font-medium text-gray-900 max-w-[220px] truncate">
                {firstProduct}
                {order.items?.length > 1 && (
                  <span className="text-gray-400 text-xs ml-1.5">
                    +{order.items.length - 1}
                  </span>
                )}
              </td>

              <td className="px-8 py-6 text-gray-900 whitespace-nowrap">
                {grandTotal.toLocaleString()}{' '}
                {t('dashboardMetrics.unit.sar', 'SAR')}
              </td>

              <td className="px-8 py-6">
                <span
                  className={`inline-flex rounded-full px-4 py-2 text-sm font-medium ${
                    STATUS_STYLES[order.status] ?? 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {getStatusLabel(order.status)}
                </span>
              </td>

              <td className="px-8 py-6">
                <button
                  onClick={() => onViewDetails(order.id)}
                  className="font-medium text-gray-900 underline hover:text-amber-700 transition-colors cursor-pointer"
                >
                  {t('recentOrders.table.view', 'View')}
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

export default RecentOrdersDesktopTable;
