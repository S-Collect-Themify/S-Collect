import { useTranslation } from 'react-i18next';
import type { OrderStatus } from '../types';

interface VendorReportStatusBadgeProps {
  status: OrderStatus;
}

export default function VendorReportStatusBadge({ status }: VendorReportStatusBadgeProps) {
  const { t } = useTranslation();

  switch (status) {
    case 'delivered':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-100/50">
          {t('vendorReports.statusDelivered', 'Delivered')}
        </span>
      );
    case 'processing':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-600 border border-amber-100/50">
          {t('vendorReports.statusProcessing', 'Processing')}
        </span>
      );
    case 'shipped':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600 border border-blue-100/50">
          {t('vendorReports.statusShipped', 'Shipped')}
        </span>
      );
    case 'canceled':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-600 border border-rose-100/50">
          {t('vendorReports.statusCanceled', 'Canceled')}
        </span>
      );
    default:
      return null;
  }
}
