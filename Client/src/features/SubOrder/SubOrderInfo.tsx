import { useTranslation } from 'react-i18next';
import type { SubOrderStatus } from '../Orders/types/subOrder';

interface Props {
  id: string;
  createdAt: string;
  trackingNumber: string | null;
  status: SubOrderStatus;
}

const STATUS_LABEL: Record<SubOrderStatus, string> = {
  PENDING: 'Pending',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

export const SubOrderInfo = ({
  id,
  createdAt,
  trackingNumber,
  status,
}: Props) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 text-sm">
      <div className="flex items-center justify-between mb-4">
        <h6 className="font-semibold text-gray-900">
          {t('ordersPage.orderInformation')}
        </h6>
        <span
          className={`text-xs font-semibold ${
            status === 'PROCESSING'
              ? 'text-blue-600'
              : status === 'SHIPPED'
                ? 'text-orange-500'
                : status === 'DELIVERED'
                  ? 'text-green-600'
                  : status === 'CANCELLED'
                    ? 'text-red-500'
                    : 'text-gray-500'
          }`}
        >
          {STATUS_LABEL[status]}
        </span>
      </div>
      {[
        [t('ordersPage.orderId'), `#${id.slice(0, 8).toUpperCase()}`],
        [
          t('ordersPage.orderDate'),
          new Date(createdAt).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          }),
        ],
        ['Payment Status', 'Paid'],
        [t('ordersPage.trackingNumber'), trackingNumber ?? '—'],
      ].map(([label, val]) => (
        <div
          key={label}
          className="flex justify-between gap-4 py-2 border-b border-gray-50 last:border-none"
        >
          <span className="text-gray-400">{label}</span>
          <span
            className={`font-medium text-right ${label === 'Payment Status' ? 'text-green-600' : 'text-gray-800'}`}
          >
            {val}
          </span>
        </div>
      ))}
    </div>
  );
};
