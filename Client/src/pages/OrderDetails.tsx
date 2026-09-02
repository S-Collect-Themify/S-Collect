import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronsRight,
  Check,
  Truck,
} from 'lucide-react';
import { motion } from 'motion/react';
import {
  type Order,
  STATUS_STYLES,
} from '../features/Orders/types/order';

import { containerVariants, itemVariants } from '../utils/animations';

interface OrderDetailsProps {
  order: Order;
  onBack: () => void;
}

export const OrderDetails = ({
  order,
  onBack,
}: OrderDetailsProps) => {
  const { t } = useTranslation();

  return (
    <motion.div
      className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#f5f7fb]"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div
        variants={itemVariants}
        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3 mb-2"
      >
        <button
          onClick={onBack}
          className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer w-fit border border-gray-300 "
        >
          <ArrowLeft size={18} className="text-gray-900 " />
        </button>
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 wrap-break-word">
            {t('ordersPage.orderDetails')}{' '}
            <span className="text-gray-500">#{order.id}</span>
          </h1>
          <nav aria-label="Breadcrumb" className="text-xs text-gray-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
            <Link
              to="/incoming-orders"
              className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              {t('ordersPage.title')}
            </Link>
            <ChevronsRight size={12} className="text-gray-400 rtl:rotate-180 shrink-0" />
            <span className="text-gray-900 font-semibold" aria-current="page">
              {t('ordersPage.orderDetails')} #{order.id}
            </span>
          </nav>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_470px] gap-5 mt-5">
        {/* Left column */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col md:gap-5 gap-3 min-w-0"
        >
          {/* Order Items */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5">
            <h6 className="font-semibold text-gray-900 mb-4">
              {t('ordersPage.orderItems')}
            </h6>
            <div className="overflow-x-auto rounded-md">
              <table className="w-full min-w-160 text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-100 ">
                    {[
                      t('addProduct.nameEn'),
                      t('addProduct.sizes'),
                      t('addProduct.sku'),
                      'Qty',
                      t('ordersPage.subtotal'),
                      t('ordersPage.grandTotal'),
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left rtl:text-right pb-2 text-xs text-gray-950 font-bold px-2 py-3"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, i) => (
                    <tr
                      key={i}
                      className="border-b border-gray-50 last:border-none"
                    >
                      <td className="px-2 py-3 font-medium text-gray-900">
                        {item.name}
                      </td>
                      <td className="py-3 text-gray-500">{item.variant}</td>
                      <td className="py-3 text-gray-400">{item.sku}</td>
                      <td className="py-3">{item.qty}</td>
                      <td className="py-3">
                        SAR {item.unitPrice.toLocaleString()}
                      </td>
                      <td className="py-3 font-medium">
                        SAR {item.total.toLocaleString()}.00
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Order Timeline */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              {t('ordersPage.orderTimeline')}
            </h3>

            <div className="space-y-0">
              {order.timeline.map((item, i) => {
                const stepToStatusMap: Record<string, OrderStatus> = {
                  'Order Placed': 'Pending',
                  Processing: 'Processing',
                  Shipped: 'Shipped',
                  Delivered: 'Delivered',
                };
                const isCurrent = order.status === stepToStatusMap[item.step];

                const getStepLabel = (step: string) => {
                  if (step === 'Order Placed')
                    return t('ordersPage.orderPlaced', {
                      defaultValue: 'Order Placed',
                    });
                  if (step === 'Processing')
                    return t('ordersPage.processing', {
                      defaultValue: 'Processing',
                    });
                  if (step === 'Shipped')
                    return t('ordersPage.shipped', { defaultValue: 'Shipped' });
                  if (step === 'Delivered')
                    return t('ordersPage.delivered', {
                      defaultValue: 'Delivered',
                    });
                  return step;
                };

                return (
                  <div key={i} className="flex gap-4">
                    {/* Icon + Line */}
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div
                        className={`
                          w-8 h-8 flex items-center justify-center rounded-full transition-colors duration-200
                          ${
                            item.done
                              ? isCurrent && item.step === 'Shipped'
                                ? 'bg-amber-500 text-white shadow-sm'
                                : isCurrent && item.step === 'Processing'
                                  ? 'bg-blue-600 text-white shadow-sm'
                                  : 'bg-green-600 text-white shadow-sm'
                              : 'border border-gray-300 bg-white text-gray-400'
                          }
                        `}
                      >
                        {item.done ? (
                          isCurrent && item.step === 'Shipped' ? (
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

                      {i < order.timeline.length - 1 && (
                        <div
                          className={`w-[2px] flex-1 my-1 transition-colors duration-200 ${
                            item.done && order.timeline[i + 1]?.done
                              ? 'bg-green-600'
                              : 'bg-gray-100'
                          }`}
                          style={{ minHeight: 36 }}
                        />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex justify-between items-start gap-4 pb-8 last:pb-2 min-w-0">
                      <div className="flex flex-col min-w-0">
                        <h4
                          className={`font-semibold text-sm sm:text-base transition-colors duration-200 ${
                            item.done ? 'text-gray-900' : 'text-gray-400'
                          }`}
                        >
                          {getStepLabel(item.step)}
                        </h4>

                        {item.desc && (
                          <p
                            className={`text-xs sm:text-sm mt-1 transition-colors duration-200 ${
                              item.done ? 'text-gray-500' : 'text-gray-300'
                            }`}
                          >
                            {item.desc}
                          </p>
                        )}
                      </div>

                      <span
                        className={`text-xs sm:text-sm whitespace-nowrap pt-0.5 text-right rtl:text-left transition-colors duration-200 ${
                          item.done ? 'text-gray-400' : 'text-gray-300'
                        }`}
                      >
                        {item.done && item.date
                          ? item.date
                          : t('ordersPage.pendingLabel')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Right column */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col md:gap-5 gap-3 min-w-0"
        >
          {/* Order Information */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 text-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center mb-3">
              <h6 className="font-semibold text-gray-900">
                {t('ordersPage.orderInformation')}
              </h6>
              <span
                className={`w-fit px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[order.status]}`}
              >
                {order.status}
              </span>
            </div>
            {[
              [t('ordersPage.orderId'), `#${order.id}`],
              [t('ordersPage.orderDate'), order.date],
              [t('ordersPage.paymentStatus'), order.paymentStatus],
              [t('ordersPage.trackingNumber'), order.trackingNumber || '—'],
            ].map(([label, val]) => (
              <div
                key={label}
                className="flex justify-between gap-4 py-1.5 border-b border-gray-50 last:border-none"
              >
                <span className="text-gray-400">{label}</span>
                <span
                  className={`font-medium text-right ${
                    label === t('ordersPage.paymentStatus')
                      ? 'text-green-600'
                      : 'text-gray-700'
                  }`}
                >
                  {val}
                </span>
              </div>
            ))}
          </div>

          {/* Customer Information */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 text-sm">
            <h6 className="font-semibold text-gray-900 mb-3">
              {t('ordersPage.customerInformation')}
            </h6>
            {[
              [t('ordersPage.name'), order.customer.name],
              [t('ordersPage.email'), order.customer.email],
              [t('ordersPage.phone'), order.customer.phone],
            ].map(([label, val]) => (
              <div
                key={label}
                className="flex justify-between gap-4 py-1.5 border-b border-gray-50 last:border-none"
              >
                <span className="text-gray-400">{label}</span>
                <span className="text-gray-700 font-medium text-right break-all">
                  {val}
                </span>
              </div>
            ))}
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 text-sm">
            <h6 className="font-semibold text-gray-900 mb-2">
              {t('ordersPage.shippingAddress')}
            </h6>
            <p className="text-gray-500 leading-relaxed wrap-break-word">
              {order.shippingAddress}
            </p>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 text-sm">
            <h6 className="font-semibold text-gray-900 mb-3">
              {t('ordersPage.orderSummary')}
            </h6>
            {[
              [
                t('ordersPage.subtotal'),
                `SAR ${order.subtotal.toLocaleString()}.00`,
              ],
              [t('ordersPage.shippingFee'), `SAR ${order.shippingFee}.00`],
              [t('ordersPage.discount'), `-SAR ${order.discount}.00`],
              [t('ordersPage.tax'), `SAR ${order.tax.toFixed(2)}`],
            ].map(([label, val]) => (
              <div
                key={label}
                className="flex justify-between gap-4 py-1.5 text-gray-500"
              >
                <span>{label}</span>
                <span className="text-right">{val}</span>
              </div>
            ))}
            <div className="flex justify-between gap-4 pt-3 mt-1 border-t border-gray-100 font-semibold text-gray-900">
              <span>{t('ordersPage.grandTotal')}</span>
              <span className="text-right">
                SAR{' '}
                {order.grandTotal.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
