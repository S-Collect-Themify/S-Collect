// features/Orders/mobile/MobileSubOrderDetails.tsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Loader2,
  Package,
  Check,
  Truck,
  Circle,
  Ban,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSubOrder, useUpdateSubOrder } from '../useSubOrders';
import type { SubOrderStatus } from '../types/subOrder';
import { STATUS_STYLES, NEXT_STATUS } from '../types/subOrder';

const TIMELINE_STEPS: SubOrderStatus[] = [
  'PENDING',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
];

interface Props {
  subOrderId: string;
  onBack: () => void;
}

const MobileSubOrderDetails = ({ subOrderId, onBack }: Props) => {
  const { t } = useTranslation();
  const { data: order, isLoading, isError, refetch } = useSubOrder(subOrderId);
  const { mutate: updateOrder, isPending } = useUpdateSubOrder();
  const [trackingInput, setTrackingInput] = useState('');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-40">
        <Loader2 className="animate-spin text-gray-400" size={32} />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="flex flex-col items-center gap-3 py-40 text-center px-4">
        <p className="text-red-500 text-sm">Failed to load order details.</p>
        <button
          onClick={() => refetch()}
          className="text-sm underline text-gray-600 cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  const nextStatus = NEXT_STATUS[order.status];
  const itemsTotal = order.items.reduce((s, i) => s + i.lineTotal, 0);
  const grandTotal = itemsTotal + order.shippingRateApplied;
  const currentStatusIndex = TIMELINE_STEPS.indexOf(
    order.status === 'CANCELLED' ? 'PENDING' : order.status
  );

  const handleAdvance = () => {
    if (!nextStatus) return;
    updateOrder({
      id: order.id,
      body: {
        status: nextStatus,
        ...(trackingInput.trim()
          ? { trackingNumber: trackingInput.trim() }
          : {}),
      },
    });
    setTrackingInput('');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex items-center gap-3 bg-white border-b border-gray-100 px-4 py-3.5">
        <button
          onClick={onBack}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 transition"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <p className="text-sm font-bold text-gray-900">
            #{order.id.slice(0, 8)}…
          </p>
          <p className="text-xs text-gray-400">
            {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>
        <span
          className={`ml-auto px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[order.status]}`}
        >
          {order.status}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
        {/* Items */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <h6 className="font-semibold text-gray-900 mb-3 text-sm">
            {t('ordersPage.orderItems')}
          </h6>
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex justify-between gap-2 py-2 border-b border-gray-50 last:border-none"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {item.productName}
                </p>
                {item.variantLabel && (
                  <p className="text-xs text-gray-400">{item.variantLabel}</p>
                )}
                <p className="text-xs text-gray-400">x{item.quantity}</p>
              </div>
              <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                SAR {item.lineTotal.toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 text-sm">
          <h6 className="font-semibold text-gray-900 mb-3">
            {t('ordersPage.orderSummary')}
          </h6>
          <div className="flex justify-between text-gray-500 py-1">
            <span>Items</span>
            <span>SAR {itemsTotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-gray-500 py-1">
            <span>Shipping</span>
            <span>SAR {order.shippingRateApplied.toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-semibold text-gray-900 pt-2 border-t border-gray-100 mt-1">
            <span>Total</span>
            <span>
              SAR{' '}
              {grandTotal.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>

        {/* Order info */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 text-sm">
          <h6 className="font-semibold text-gray-900 mb-3">
            {t('ordersPage.orderInformation')}
          </h6>
          {[
            ['Order ID', `#${order.orderId.slice(0, 8)}…`],
            ['Tracking', order.trackingNumber ?? '—'],
          ].map(([l, v]) => (
            <div
              key={l}
              className="flex justify-between py-1 border-b border-gray-50 last:border-none"
            >
              <span className="text-gray-400">{l}</span>
              <span className="font-medium text-gray-700 text-right break-all max-w-[60%]">
                {v}
              </span>
            </div>
          ))}
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <h6 className="font-semibold text-gray-900 mb-4 text-sm">
            {t('ordersPage.orderTimeline')}
          </h6>
          {order.status === 'CANCELLED' ? (
            <div className="flex items-center gap-2 text-red-500 text-sm">
              <Ban size={16} />
              <span>Cancelled</span>
            </div>
          ) : (
            TIMELINE_STEPS.map((step, i) => {
              const done = i <= currentStatusIndex;
              const isCurrent = step === order.status;
              return (
                <div key={step} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-6 h-6 flex items-center justify-center rounded-full ${
                        done
                          ? isCurrent
                            ? 'bg-amber-500 text-white'
                            : 'bg-green-600 text-white'
                          : 'border border-gray-300 bg-white text-gray-400'
                      }`}
                    >
                      {done ? (
                        isCurrent ? (
                          <Truck size={12} />
                        ) : (
                          <Check size={12} strokeWidth={3} />
                        )
                      ) : (
                        <Circle size={8} fill="currentColor" />
                      )}
                    </div>
                    {i < TIMELINE_STEPS.length - 1 && (
                      <div
                        className={`w-0.5 flex-1 ${done ? 'bg-green-500' : 'bg-gray-200'}`}
                        style={{ minHeight: 20 }}
                      />
                    )}
                  </div>
                  <p
                    className={`text-sm pb-4 ${done ? 'text-gray-900 font-medium' : 'text-gray-400'}`}
                  >
                    {step}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Update status */}
        {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4 text-sm">
            <h6 className="font-semibold text-gray-900 mb-3">
              {t('ordersPage.updateOrderStatus')}
            </h6>
            <input
              type="text"
              value={trackingInput}
              onChange={(e) => setTrackingInput(e.target.value)}
              placeholder="Tracking number (optional)"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm mb-3 focus:outline-none focus:border-gray-400"
            />
            {nextStatus && (
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleAdvance}
                disabled={isPending}
                className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-3 rounded-xl text-sm font-medium disabled:opacity-60"
              >
                {isPending ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Package size={15} />
                )}
                Mark as {nextStatus}
              </motion.button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileSubOrderDetails;
