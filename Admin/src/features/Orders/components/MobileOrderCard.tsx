import React from 'react';
import { useTranslation } from 'react-i18next';
import { StatusBadge } from './OrdersTable';
import type { TableItem } from '../types';

interface MobileOrderCardProps {
  item: TableItem;
  type: 'allOrders' | 'refunds';
  onViewDetails: (item: TableItem) => void;
}

export const MobileOrderCard: React.FC<MobileOrderCardProps> = ({
  item,
  type,
  onViewDetails,
}) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-2xl border border-gray-200/90 p-4 shadow-2xs mb-3">
      {/* Top Card Row */}
      <div className="flex items-center justify-between mb-3">
        <span className="font-bold text-gray-900 text-sm">{item.code}</span>
        <StatusBadge status={item.status} />
      </div>

      {/* Card Details Grid */}
      <div className="space-y-2 py-2 text-xs border-t border-b border-gray-100 mb-3">
        {type === 'refunds' ? (
          <>
            <div className="flex justify-between">
              <span className="text-gray-400">{t('ordersPage.orderId', 'Order ID')}</span>
              <span className="font-bold text-gray-900">{item.orderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">{t('ordersPage.customer', 'Customer')}</span>
              <span className="font-medium text-gray-800">{item.customer}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">{t('ordersPage.reason', 'Reason')}</span>
              <span className="text-gray-600 text-end max-w-45">{item.reason}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">{t('ordersPage.date', 'Date')}</span>
              <span className="text-gray-500">{item.date}</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-between">
              <span className="text-gray-400">{t('ordersPage.customer', 'Customer')}</span>
              <span className="font-medium text-gray-800">{item.customer}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">{t('ordersPage.vendor', 'Vendor')}</span>
              <span className="text-gray-600">{item.vendor}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">{t('ordersPage.subOrders', 'Sub-orders')}</span>
              <span className="text-gray-600">{item.subOrdersCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">{t('ordersPage.date', 'Date')}</span>
              <span className="text-gray-500">{item.date}</span>
            </div>
          </>
        )}
      </div>

      {/* Bottom Card Row */}
      <div className="flex items-center justify-between">
        <span className="font-bold text-gray-900 text-sm sm:text-base">
          {item.totalFormatted}
        </span>
        <button
          type="button"
          onClick={() => onViewDetails(item)}
          className="text-blue-600 font-semibold text-xs sm:text-sm hover:underline cursor-pointer"
        >
          {t('ordersPage.viewDetails', 'View details')}
        </button>
      </div>
    </div>
  );
};
