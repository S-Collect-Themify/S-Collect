import { useTranslation } from 'react-i18next';
import type { DetailedOrder } from '../types';
import VendorReportStatusBadge from './VendorReportStatusBadge';

interface VendorReportOrdersMobileListProps {
  orders: DetailedOrder[];
  itemsPerPage: number;
  isLoading?: boolean;
}

export default function VendorReportOrdersMobileList({
  orders,
  itemsPerPage,
  isLoading = false,
}: VendorReportOrdersMobileListProps) {
  const { t } = useTranslation();

  return (
    <div className="block md:hidden divide-y divide-gray-100">
      {isLoading ? (
        Array.from({ length: itemsPerPage }).map((_, idx) => (
          <div key={`skel-mob-${idx}`} className="p-4 space-y-3 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="h-4 w-28 bg-gray-200 rounded-md" />
              <div className="h-6 w-18 bg-gray-200 rounded-full" />
            </div>
            <div className="grid grid-cols-4 gap-2 pt-1">
              {Array.from({ length: 4 }).map((_, cIdx) => (
                <div key={cIdx} className="space-y-1">
                  <div className="h-3 w-12 bg-gray-200 rounded-sm" />
                  <div className="h-3.5 w-16 bg-gray-200 rounded-sm" />
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        orders.map((order, idx) => (
          <div key={`${order.id}-mob-${idx}`} className="p-4 space-y-2.5">
            {/* Header: Order ID & Status */}
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-sm text-gray-900">
                {order.id}
              </span>
              <VendorReportStatusBadge status={order.status} />
            </div>

            {/* Data Grid */}
            <div className="grid grid-cols-4 gap-2 pt-1">
              <div>
                <p className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider mb-0.5">
                  {t('vendorReports.tableDate', 'Date')}
                </p>
                <p className="text-xs text-gray-600 font-medium whitespace-nowrap">
                  {order.date}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider mb-0.5">
                  {t('vendorReports.mobAmount', 'Amount')}
                </p>
                <p className="text-xs text-gray-900 font-bold whitespace-nowrap">
                  {order.amount.toLocaleString()} {t('vendorReports.currency', 'SAR')}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider mb-0.5">
                  {t('vendorReports.mobCommission', 'Commission')}
                </p>
                <p className="text-xs text-gray-500 font-medium whitespace-nowrap">
                  {order.commission.toLocaleString()} {t('vendorReports.currency', 'SAR')}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider mb-0.5">
                  {t('vendorReports.mobNet', 'Net')}
                </p>
                <p className="text-xs text-gray-900 font-bold whitespace-nowrap">
                  {order.net.toLocaleString()} {t('vendorReports.currency', 'SAR')}
                </p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
