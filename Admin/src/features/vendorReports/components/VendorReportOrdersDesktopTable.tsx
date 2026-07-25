import { useTranslation } from 'react-i18next';
import type { DetailedOrder } from '../types';
import VendorReportStatusBadge from './VendorReportStatusBadge';

interface VendorReportOrdersDesktopTableProps {
  orders: DetailedOrder[];
  itemsPerPage: number;
  isLoading?: boolean;
}

export default function VendorReportOrdersDesktopTable({
  orders,
  itemsPerPage,
  isLoading = false,
}: VendorReportOrdersDesktopTableProps) {
  const { t } = useTranslation();

  return (
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full text-start border-collapse text-sm">
        <thead>
          <tr className="bg-gray-50/70 border-b border-gray-100 text-gray-700 text-xs font-bold">
            <th className="px-5 py-3.5 text-start font-bold text-gray-800">
              {t('vendorReports.tableOrderNo', 'Order #')}
            </th>
            <th className="px-5 py-3.5 text-start font-bold text-gray-800">
              {t('vendorReports.tableDate', 'Date')}
            </th>
            <th className="px-5 py-3.5 text-start font-bold text-gray-800">
              {t('vendorReports.tableAmount', 'Amount (SAR)')}
            </th>
            <th className="px-5 py-3.5 text-start font-bold text-gray-800">
              {t('vendorReports.tableCommission', 'Commission (SAR)')}
            </th>
            <th className="px-5 py-3.5 text-start font-bold text-gray-800">
              {t('vendorReports.tableNet', 'Net (SAR)')}
            </th>
            <th className="px-5 py-3.5 text-start font-bold text-gray-800">
              {t('vendorReports.tableStatus', 'Status')}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {isLoading ? (
            Array.from({ length: itemsPerPage }).map((_, idx) => (
              <tr key={`skel-${idx}`} className="animate-pulse">
                <td className="px-5 py-4">
                  <div className="h-4 w-28 bg-gray-200 rounded-md" />
                </td>
                <td className="px-5 py-4">
                  <div className="h-4 w-20 bg-gray-200 rounded-md" />
                </td>
                <td className="px-5 py-4">
                  <div className="h-4 w-16 bg-gray-200 rounded-md" />
                </td>
                <td className="px-5 py-4">
                  <div className="h-4 w-14 bg-gray-200 rounded-md" />
                </td>
                <td className="px-5 py-4">
                  <div className="h-4 w-16 bg-gray-200 rounded-md" />
                </td>
                <td className="px-5 py-4">
                  <div className="h-6 w-20 bg-gray-200 rounded-full" />
                </td>
              </tr>
            ))
          ) : (
            orders.map((order, idx) => (
              <tr
                key={`${order.id}-${idx}`}
                className="hover:bg-gray-50/50 transition-colors"
              >
                <td className="px-5 py-4 font-bold text-gray-900 whitespace-nowrap">
                  {order.id}
                </td>
                <td className="px-5 py-4 text-gray-400 font-medium whitespace-nowrap">
                  {order.date}
                </td>
                <td className="px-5 py-4 font-bold text-gray-900 whitespace-nowrap">
                  {order.amount.toLocaleString()}
                </td>
                <td className="px-5 py-4 text-gray-500 font-medium whitespace-nowrap">
                  {order.commission.toLocaleString()}
                </td>
                <td className="px-5 py-4 font-bold text-gray-900 whitespace-nowrap">
                  {order.net.toLocaleString()}
                </td>
                <td className="px-5 py-4 whitespace-nowrap">
                  <VendorReportStatusBadge status={order.status} />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
