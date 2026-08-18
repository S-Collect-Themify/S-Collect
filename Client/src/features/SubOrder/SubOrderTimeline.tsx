import { useTranslation } from 'react-i18next';
import { Ban, Check, Truck } from 'lucide-react';
import type { SubOrderStatus } from '../Orders/types/subOrder';

interface Props {
  status: SubOrderStatus;
  createdAt: string;
  shippedAt: string | null;
  deliveredAt: string | null;
  statusOverrideReason: string | null;
}

const TIMELINE_STEPS: {
  status: SubOrderStatus;
  label: string;
  desc: string;
}[] = [
  {
    status: 'PENDING',
    label: 'Order Placed',
    desc: 'Order received and confirmed',
  },
  {
    status: 'PROCESSING',
    label: 'Processing',
    desc: 'Payment verified, order being prepared',
  },
  {
    status: 'SHIPPED',
    label: 'Shipped',
    desc: 'Handed to courier for delivery',
  },
  {
    status: 'DELIVERED',
    label: 'Delivered',
    desc: 'Awaiting delivery confirmation',
  },
];

export const SubOrderTimeline = ({
  status,
  createdAt,
  shippedAt,
  deliveredAt,
  statusOverrideReason,
}: Props) => {
  const { t, i18n } = useTranslation();
  const currentStepIdx = TIMELINE_STEPS.findIndex((s) => s.status === status);
  const locale = i18n.language === 'ar' ? 'ar-EG' : 'en-US';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <h6 className="font-semibold text-gray-900 mb-5">
        {t('ordersPage.orderTimeline')}
      </h6>

      {status === 'CANCELLED' ? (
        <div className="flex items-center gap-3 text-red-500 py-2">
          <Ban size={20} />
          <div>
            <p className="font-semibold">
              {t('ordersPage.orderCancelled', {
                defaultValue: 'Order Cancelled',
              })}
            </p>
            {statusOverrideReason && (
              <p className="text-gray-500 text-sm mt-0.5">
                {t('ordersPage.reason', { defaultValue: 'Reason' })}: {statusOverrideReason}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div>
          {TIMELINE_STEPS.map((step, i) => {
            const done = i <= currentStepIdx;
            const isCurrent = step.status === status;
            const isLast = i === TIMELINE_STEPS.length - 1;

            const getStepLabel = (label: string) => {
              if (label === 'Order Placed')
                return t('ordersPage.orderPlaced', {
                  defaultValue: 'Order Placed',
                });
              if (label === 'Processing')
                return t('ordersPage.processing', {
                  defaultValue: 'Processing',
                });
              if (label === 'Shipped')
                return t('ordersPage.shipped', { defaultValue: 'Shipped' });
              if (label === 'Delivered')
                return t('ordersPage.delivered', { defaultValue: 'Delivered' });
              return label;
            };

            const getStepDesc = (s: SubOrderStatus, defaultDesc: string) => {
              switch (s) {
                case 'PENDING':
                  return t('ordersPage.timeline.orderPlacedDesc', {
                    defaultValue: defaultDesc,
                  });
                case 'PROCESSING':
                  return t('ordersPage.timeline.processingDesc', {
                    defaultValue: defaultDesc,
                  });
                case 'SHIPPED':
                  return t('ordersPage.timeline.shippedDesc', {
                    defaultValue: defaultDesc,
                  });
                case 'DELIVERED':
                  return t('ordersPage.timeline.deliveredDesc', {
                    defaultValue: defaultDesc,
                  });
                default:
                  return defaultDesc;
              }
            };

            // Date label
            let dateLabel = '';
            if (step.status === 'PENDING')
              dateLabel = new Date(createdAt).toLocaleString(locale, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });
            if (step.status === 'SHIPPED' && shippedAt)
              dateLabel = new Date(shippedAt).toLocaleString(locale, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });
            if (step.status === 'DELIVERED' && deliveredAt)
              dateLabel = new Date(deliveredAt).toLocaleString(locale, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });
            if (!done)
              dateLabel = t('ordersPage.pendingLabel', {
                defaultValue: 'Pending',
              });

            return (
              <div key={step.status} className="flex gap-4">
                {/* Icon + connector */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <div
                    className={`
                      w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full border transition-colors duration-200
                      ${
                        done
                          ? isCurrent && step.status === 'SHIPPED'
                            ? 'bg-amber-500 border-amber-500 text-white shadow-sm'
                            : isCurrent && step.status === 'PROCESSING'
                              ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                              : 'bg-green-600 border-green-600 text-white shadow-sm'
                          : 'border-gray-300 bg-white text-gray-400'
                      }
                    `}
                  >
                    {done ? (
                      isCurrent && step.status === 'SHIPPED' ? (
                        <Truck size={14} className="text-white" />
                      ) : (
                        <Check
                          size={14}
                          strokeWidth={3.5}
                          className="text-white"
                        />
                      )
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-gray-400" />
                    )}
                  </div>
                  {!isLast && (
                    <div
                      className={`w-[2px] flex-1 my-1 transition-colors duration-200 ${
                        i + 1 <= currentStepIdx ? 'bg-green-600' : 'bg-gray-100'
                      }`}
                      style={{ minHeight: 36 }}
                    />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 flex justify-between pb-8 last:pb-2 gap-4 min-w-0 items-start">
                  <div className="flex flex-col min-w-0">
                    <p
                      className={`font-semibold text-sm transition-colors duration-200 ${done ? 'text-gray-900' : 'text-gray-400'}`}
                    >
                      {getStepLabel(step.label)}
                    </p>
                    <p
                      className={`text-xs sm:text-sm mt-1 transition-colors duration-200 ${done ? 'text-gray-500' : 'text-gray-300'}`}
                    >
                      {getStepDesc(step.status, step.desc)}
                    </p>
                  </div>
                  <p
                    className={`text-xs sm:text-sm whitespace-nowrap pt-0.5 text-right rtl:text-left transition-colors duration-200 ${done ? 'text-gray-400' : 'text-gray-300'}`}
                  >
                    {dateLabel}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
