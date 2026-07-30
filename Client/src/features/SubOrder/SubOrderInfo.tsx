import { useTranslation } from 'react-i18next';
import type { SubOrderStatus, SubOrderCustomer } from '../Orders/types/subOrder';

interface Props {
  id: string;
  orderNumber?: number | string | null;
  createdAt: string;
  trackingNumber: string | null;
  status: SubOrderStatus;
  customer?: SubOrderCustomer | null;
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
  orderNumber,
  createdAt,
  trackingNumber,
  status,
  customer,
}: Props) => {
  const { t } = useTranslation();

  const displayOrderId = orderNumber ? `#${orderNumber}` : `#${id.slice(0, 8).toUpperCase()}`;

  const infoRows = [
    [t('ordersPage.orderId'), displayOrderId],
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
  ];

  if (customer) {
    infoRows.push([
      t('ordersPage.customerName', { defaultValue: 'Customer' }),
      `${customer.firstName} ${customer.lastName}`.trim(),
    ]);
    if (customer.phoneNumber) {
      infoRows.push([
        t('ordersPage.phone', { defaultValue: 'Phone' }),
        customer.phoneNumber,
      ]);
    }
  }

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
      {infoRows.map(([label, val]) => (
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
