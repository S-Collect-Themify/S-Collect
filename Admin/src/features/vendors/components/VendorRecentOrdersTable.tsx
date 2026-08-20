import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card } from './VendorDetailsCards';
import type { MockOrder } from '../data/constant';

interface VendorRecentOrdersTableProps {
  vendorId: string;
  vendorName?: string;
  orders: MockOrder[];
  statusStyles: Record<string, { label: string; className: string }>;
}

export default function VendorRecentOrdersTable({
  vendorId,
  vendorName,
  orders,
  statusStyles,
}: VendorRecentOrdersTableProps) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const ordersUrl = `/orders?vendorId=${encodeURIComponent(vendorId)}${
    vendorName ? `&vendorName=${encodeURIComponent(vendorName)}` : ''
  }`;

  return (
    <Card className="mb-5 overflow-hidden border border-gray-100/80 shadow-2xs">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100/70 border-b border-gray-100">
              <th className="px-6 py-3.5 text-start text-xs font-bold text-gray-900">
                {t('vendors.details.recentOrders', 'Recent Orders')}
              </th>
              <th className="px-6 py-3.5 text-start text-xs font-medium text-gray-500">
                {t('vendors.details.submittedDate', 'Submitted Date')}
              </th>
              <th className="px-6 py-3.5 text-start text-xs font-medium text-gray-500">
                {t('vendors.details.customerName', 'Customer Name')}
              </th>
              <th className="px-6 py-3.5 text-start text-xs font-medium text-gray-500">
                {t('vendors.details.price', 'Price')}
              </th>
              <th className="px-6 py-3.5 text-start text-xs font-medium text-gray-500">
                {t('vendors.details.status', 'Status')}
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-xs text-gray-400">
                  {t('vendors.details.noOrdersYet', 'No orders yet')}
                </td>
              </tr>
            ) : (
              orders.slice(0, 5).map((order) => {
                const style = statusStyles[order.status] ?? {
                  label: order.status,
                  className: 'bg-emerald-50 text-emerald-600',
                };
                return (
                  <tr
                    key={order.id}
                    className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors"
                  >
                    <td className="px-6 py-4 text-amber-500 font-bold text-xs">{order.id}</td>
                    <td className="px-6 py-4 text-gray-400 text-xs">{order.submittedDate}</td>
                    <td className="px-6 py-4 text-gray-900 font-medium text-xs">
                      {order.customerName}
                    </td>
                    <td className="px-6 py-4 text-gray-900 text-xs font-bold">
                      {order.price.toLocaleString()} {isRtl ? '﷼' : 'SAR'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${style.className}`}
                      >
                        {style.label}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        <div className="py-3 border-t border-gray-100 text-center">
          <Link
            to={ordersUrl}
            className="inline-flex items-center justify-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            <span>{t('vendors.details.viewAllOrders', 'View All Orders')}</span>
            <span className="inline-block rtl:rotate-180">→</span>
          </Link>
        </div>
      </div>

      {/* Mobile Card List View (Sliced to 2 items) */}
      <div className="md:hidden p-4">
        <h2 className="text-sm font-bold text-gray-900 mb-3">
          {t('vendors.details.recentOrders', 'Recent Orders')}
        </h2>
        {orders.length === 0 ? (
          <p className="text-center text-xs text-gray-400 py-6">
            {t('vendors.details.noOrdersYet', 'No orders yet')}
          </p>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 2).map((order) => {
              const style = statusStyles[order.status] ?? {
                label: order.status,
                className: 'bg-emerald-50 text-emerald-600',
              };
              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-gray-100 p-4 shadow-2xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-500">{order.id}</span>
                    <span className="text-xs text-gray-400">{order.submittedDate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-900">
                      {order.customerName}
                    </span>
                    <span className="text-xs font-bold text-gray-900">
                      {order.price.toLocaleString()} {isRtl ? '﷼' : 'SAR'}
                    </span>
                  </div>
                  <div>
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${style.className}`}
                    >
                      {style.label}
                    </span>
                  </div>
                </div>
              );
            })}
            <div className="pt-2 text-center">
              <Link
                to={ordersUrl}
                className="inline-flex items-center justify-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                <span>{t('vendors.details.viewAllOrders', 'View All Orders')}</span>
                <span className="inline-block rtl:rotate-180">→</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
