import React from 'react';
import { useTranslation } from 'react-i18next';
import { EmptyState } from './EmptyState';
import type { TableItem } from '../types';

export type { TableItem };


interface OrdersTableProps {
  items: TableItem[];
  activeMainTab: 'allOrders' | 'refunds';
  onViewDetails: (item: TableItem) => void;
  isVendorFiltered?: boolean;
}

export const StatusBadge = ({ status }: { status: string }) => {
  const { t } = useTranslation();
  const upper = (status || '').toUpperCase();
  let badgeStyle = 'bg-gray-100 text-gray-700';

  if (['DELIVERED', 'APPROVED', 'PAID', 'COMPLETED'].includes(upper)) {
    badgeStyle = 'bg-emerald-100/70 text-emerald-700';
  } else if (['CANCELED', 'CANCELLED', 'REJECTED', 'FAILED'].includes(upper)) {
    badgeStyle = 'bg-rose-100/70 text-rose-700';
  } else if (['PENDING', 'PARTIALLY_SHIPPED', 'UNPAID'].includes(upper)) {
    badgeStyle = 'bg-amber-100/70 text-amber-700';
  } else if (['PROCESSING', 'SHIPPED'].includes(upper)) {
    badgeStyle = 'bg-blue-100/70 text-blue-700';
  }

  const defaultLabel = status
    ? status
        .split('_')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ')
    : 'Pending';

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${badgeStyle}`}>
      {t(`ordersPage.statuses.${status}`, defaultLabel)}
    </span>
  );
};

export const OrdersTable: React.FC<OrdersTableProps> = ({
  items,
  activeMainTab,
  onViewDetails,
  isVendorFiltered = false,
}) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-start border-collapse">
          <thead>
            <tr className="border-b border-gray-100 bg-white text-xs font-bold text-gray-900">
              <th className="py-4 px-4 text-start font-bold">
                {activeMainTab === 'allOrders'
                  ? t('ordersPage.orderId', 'Order ID')
                  : t('ordersPage.refundId', 'Refund ID')}
              </th>
              <th className="py-4 px-4 text-start font-bold">
                {t('ordersPage.customer', 'Customer')}
              </th>
              {activeMainTab === 'refunds' && (
                <th className="py-4 px-4 text-start font-bold">
                  {t('ordersPage.orderId', 'Order ID')}
                </th>
              )}
              <th className="py-4 px-4 text-start font-bold">
                {t('ordersPage.totalSar', 'Total (SAR)')}
              </th>
              <th className="py-4 px-4 text-start font-bold">
                {t('ordersPage.status', 'Status')}
              </th>
              <th className="py-4 px-4 text-start font-bold">
                {activeMainTab === 'allOrders'
                  ? isVendorFiltered
                    ? t('ordersPage.items', 'Items')
                    : t('ordersPage.subOrders', 'Sub-orders')
                  : t('ordersPage.reason', 'Reason')}
              </th>
              <th className="py-4 px-4 text-start font-bold">
                {t('ordersPage.date', 'Date')}
              </th>
              {!isVendorFiltered && (
                <th className="py-4 px-4 text-start font-bold">
                  {t('ordersPage.actions', 'Actions')}
                </th>
              )}
            </tr>
          </thead>
          {items.length > 0 && (
            <tbody className="divide-y divide-gray-100 text-sm">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-4 px-4 font-bold text-gray-900 whitespace-nowrap">
                    {item.code}
                  </td>
                  <td className="py-4 px-4 text-gray-700 whitespace-nowrap">
                    {item.customer}
                  </td>
                  {activeMainTab === 'refunds' && (
                    <td className="py-4 px-4 text-gray-500 whitespace-nowrap">
                      {item.orderId}
                    </td>
                  )}
                  <td className="py-4 px-4 font-bold text-gray-900 whitespace-nowrap">
                    {item.totalFormatted}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="py-4 px-4 text-gray-500 whitespace-nowrap">
                    {activeMainTab === 'allOrders' ? item.subOrdersCount : item.reason}
                  </td>
                  <td className="py-4 px-4 text-gray-500 whitespace-nowrap">
                    {item.date}
                  </td>
                  {!isVendorFiltered && (
                    <td className="py-4 px-4 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onViewDetails(item)}
                        className="text-blue-600 font-semibold hover:underline text-sm cursor-pointer"
                      >
                        {t('ordersPage.viewDetails', 'View details')}
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>

      {items.length === 0 && <EmptyState />}
    </div>
  );
};
