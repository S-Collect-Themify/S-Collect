import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRight, AlertTriangle } from 'lucide-react';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { useAdminOrderDetail, useUpdateAdminSubOrderStatus } from '../features/Orders/hooks/useAdminOrders';
import { SubOrderCard } from '../features/Orders/components/SubOrderCard';

// Helper utilities for mock data fallbacks for fields not returned by backend
const getMockEmail = (name?: string) => {
  if (!name || name === 'Guest Buyer') return 'y.alharbi@gmail.com';
  const clean = name.toLowerCase().trim().replace(/[^a-z0-9]/g, '.');
  return `${clean}@gmail.com`;
};

const getVendorDisplayName = (vendorId?: string, index: number = 0) => {
  const defaultVendors = ['Al-Falah Crafts', 'Desert Bloom', 'Red Sea Styles', 'Oasis Tech', 'Dates & Co'];
  if (!vendorId || vendorId === 'string' || vendorId.length > 20) {
    return defaultVendors[index % defaultVendors.length];
  }
  return vendorId;
};

const getProductThumbnail = (name?: string) => {
  const lower = (name || '').toLowerCase();
  if (lower.includes('oud') || lower.includes('wood') || lower.includes('perfume')) return '🪵';
  if (lower.includes('shoe') || lower.includes('nike') || lower.includes('adidas')) return '👟';
  if (lower.includes('shirt') || lower.includes('hoodie') || lower.includes('jacket')) return '👕';
  if (lower.includes('bag') || lower.includes('pack')) return '🎒';
  if (lower.includes('watch') || lower.includes('tech')) return '⌚';
  return '📦';
};

// ── Status Pill Component ───────────────────────────────────────────────────
const StatusBadge = ({ status }: { status?: string }) => {
  const { t } = useTranslation();
  const upper = (status || '').toUpperCase();
  let badgeStyle = 'bg-gray-100 text-gray-700';

  if (['DELIVERED', 'APPROVED', 'PAID', 'COMPLETED'].includes(upper)) {
    badgeStyle = 'bg-emerald-100/80 text-emerald-700';
  } else if (['CANCELED', 'CANCELLED', 'REJECTED', 'FAILED'].includes(upper)) {
    badgeStyle = 'bg-rose-100/80 text-rose-700';
  } else if (['PENDING', 'PARTIALLY_SHIPPED', 'UNPAID'].includes(upper)) {
    badgeStyle = 'bg-amber-100/80 text-amber-700';
  } else if (['PROCESSING', 'SHIPPED'].includes(upper)) {
    badgeStyle = 'bg-blue-100/80 text-blue-700';
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

// ── Dynamic Timeline Component based on overallStatus ─────────────────────
const OrderTimeline = ({ overallStatus, date }: { overallStatus?: string; date: string }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const status = (overallStatus || 'PENDING').toUpperCase();

  const isCancelled = status === 'CANCELLED';

  const statusRanks: Record<string, number> = {
    PENDING: 1,
    PROCESSING: 2,
    PARTIALLY_SHIPPED: 3,
    SHIPPED: 4,
    DELIVERED: 5,
    CANCELLED: -1,
  };

  const currentRank = statusRanks[status] ?? 1;

  const timelineSteps = isCancelled
    ? [
        { labelKey: 'ordersPage.timeline.orderPlaced', defaultLabel: 'Order Placed', rank: 1 },
        { labelKey: 'ordersPage.statuses.CANCELLED', defaultLabel: 'Cancelled', rank: -1, isCancelledStep: true },
      ]
    : [
        { labelKey: 'ordersPage.timeline.orderPlaced', defaultLabel: 'Order Placed', rank: 1 },
        { labelKey: 'ordersPage.statuses.PROCESSING', defaultLabel: 'Processing', rank: 2 },
        { labelKey: 'ordersPage.statuses.PARTIALLY_SHIPPED', defaultLabel: 'Partially Shipped', rank: 3 },
        { labelKey: 'ordersPage.statuses.SHIPPED', defaultLabel: 'Shipped', rank: 4 },
        { labelKey: 'ordersPage.statuses.DELIVERED', defaultLabel: 'Delivered', rank: 5 },
      ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs">
      <h2 className="font-bold text-gray-900 text-sm mb-4">
        {t('ordersPage.orderTimeline', 'Order Timeline')}
      </h2>
      <div className={`space-y-5 relative ${isRtl ? 'pr-5' : 'pl-5'}`}>
        {/* Connector Line */}
        <div
          className={`absolute top-2 bottom-2 w-0.5 bg-gray-200 ${
            isRtl ? 'right-1.75' : 'left-1.75'
          }`}
        />

        {timelineSteps.map((step, idx) => {
          const isCompleted = !isCancelled && currentRank > step.rank;
          const isCurrent = !isCancelled && currentRank === step.rank;
          const isStepCancelled = step.isCancelledStep;

          let dotStyle = 'bg-gray-300 ring-gray-100';
          let textColor = 'text-gray-400 font-medium';

          if (isStepCancelled) {
            dotStyle = 'bg-rose-500 ring-rose-100';
            textColor = 'text-rose-600 font-bold';
          } else if (isCompleted) {
            dotStyle = 'bg-emerald-500 ring-emerald-100';
            textColor = 'text-gray-900 font-bold';
          } else if (isCurrent) {
            dotStyle = 'bg-blue-600 ring-blue-100';
            textColor = 'text-blue-600 font-bold';
          }

          return (
            <div key={idx} className="relative">
              <span
                className={`absolute top-1 w-3.5 h-3.5 rounded-full ring-4 ring-white ${dotStyle} ${
                  isRtl ? '-right-5' : '-left-5'
                }`}
              />
              <p className={`text-xs ${textColor}`}>
                {t(step.labelKey, step.defaultLabel)}
              </p>
              <p className="text-[11px] text-gray-400">
                {isCompleted || isCurrent || isStepCancelled
                  ? date
                  : t('ordersPage.timeline.pendingFulfillment', 'Pending')}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function OrderDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { isMobile } = useBreakpoint();
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const { data: orderData, isLoading, isError } = useAdminOrderDetail(id);
  const updateSubOrderStatusMutation = useUpdateAdminSubOrderStatus(id);

  const handleSubOrderUpdate = async (
    subOrderId: string,
    payload: { status: string; trackingNumber?: string; reason?: string }
  ) => {
    await updateSubOrderStatusMutation.mutateAsync({
      subOrderId,
      payload,
    });
  };

  const shortId = id ? (id.length > 8 ? id.slice(-6).toUpperCase() : id) : '77492-CS';
  const orderIdCode = `#ORD-${shortId}`;

  const formattedDate = orderData?.createdAt
    ? new Date(orderData.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Oct 24, 2026, 09:41 AM';

  const addressString = [
    orderData?.shippingStreetAddress || 'King Fahd Road, Al Olaya District',
    orderData?.shippingCity || 'Riyadh, 12211',
    orderData?.shippingZone || 'RIYADH',
  ]
    .filter(Boolean)
    .join(', ');

  const customerEmail = getMockEmail(orderData?.recipientName);
  const customerPhone = orderData?.recipientPhone || '+966 50 123 4567';

  const allOrderItems = orderData?.subOrders
    ? orderData.subOrders.flatMap((so) => so.items || [])
    : [];

  const estimatedVat = (orderData?.subtotalAmount ?? 0) * 0.15;

  if (isLoading) {
    return (
      <div className="flex-1 p-6 bg-gray-50/80 min-h-screen">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded-lg w-64" />
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
            <div className="space-y-6">
              <div className="h-48 bg-gray-200 rounded-2xl" />
              <div className="h-32 bg-gray-200 rounded-2xl" />
              <div className="h-64 bg-gray-200 rounded-2xl" />
            </div>
            <div className="space-y-6">
              <div className="h-40 bg-gray-200 rounded-2xl" />
              <div className="h-40 bg-gray-200 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !orderData) {
    return (
      <div className="flex-1 p-8 bg-gray-50/80 min-h-screen flex flex-col items-center justify-center text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Order Not Found</h2>
        <p className="text-sm text-gray-500 mb-4">Could not load details for order ID: {id}</p>
        <button
          type="button"
          onClick={() => navigate('/incoming-orders')}
          className="px-4 py-2 bg-black text-white text-xs font-semibold rounded-lg"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50/80 min-h-screen">
      {/* Page Header Area */}
      <div className="sidebar-page-container-header bg-white border-b border-gray-200/80 py-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-bold text-gray-900 heading-page-title">
            {t('ordersPage.orderDetails', 'Order Details')}
          </h1>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <span
              onClick={() => navigate('/incoming-orders')}
              className="hover:underline cursor-pointer text-gray-500 font-medium"
            >
              {t('ordersPage.title', 'Orders')}
            </span>
            <ChevronRight size={12} className={isRtl ? 'rotate-180' : ''} />
            <span className="text-gray-900 font-semibold">{orderIdCode}</span>
          </div>
        </div>
      </div>

      {/* Main Body Container */}
      <div className="sidebar-page-container py-6">
        {isMobile ? (
          /* Mobile Stacked View */
          <div className="space-y-4">
            {/* 1. Order Info */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-2xs">
              <h2 className="font-bold text-gray-900 text-sm mb-3">
                {t('ordersPage.orderInfo', 'Order Info')}
              </h2>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">{t('ordersPage.orderIdColon', 'Order ID:')}</span>
                  <span className="font-bold text-gray-900">{orderIdCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">{t('ordersPage.dateColon', 'Date:')}</span>
                  <span className="text-gray-700">{formattedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">{t('ordersPage.paymentMethodColon', 'Payment Method:')}</span>
                  <span className="text-gray-700">{t('ordersPage.creditCardMada', 'Credit Card (Mada)')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">{t('ordersPage.paymentStatusColon', 'Payment Status:')}</span>
                  <StatusBadge status={orderData.paymentStatus} />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">{t('ordersPage.overallStatusColon', 'Overall Status:')}</span>
                  <StatusBadge status={orderData.overallStatus} />
                </div>
              </div>
            </div>

            {/* 2. Customer Details */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-2xs">
              <h2 className="font-bold text-gray-900 text-sm mb-3">
                {t('ordersPage.customerDetails', 'Customer Details')}
              </h2>
              <div className="space-y-1.5 text-xs">
                <p className="font-bold text-gray-900 text-sm">{orderData.recipientName || 'Yousef Al-Harbi'}</p>
                <p className="text-gray-500">{t('ordersPage.emailColon', 'Email:')} {customerEmail}</p>
                <p className="text-gray-500">{t('ordersPage.phoneColon', 'Phone:')} {customerPhone}</p>
              </div>
            </div>

            {/* 3. Shipping Address */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-2xs">
              <h2 className="font-bold text-gray-900 text-sm mb-3">
                {t('ordersPage.shippingAddress', 'Shipping Address')}
              </h2>
              <div className="space-y-1 text-xs text-gray-600">
                <p>{addressString}</p>
                <p className="text-gray-400">Saudi Arabia</p>
              </div>
            </div>

            {/* 4. Timeline */}
            <OrderTimeline overallStatus={orderData.overallStatus} date={formattedDate} />

            {/* 5. Summary */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-2xs">
              <h2 className="font-bold text-gray-900 text-sm mb-3">
                {t('ordersPage.summary', 'Summary')}
              </h2>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-gray-500">
                  <span>{t('ordersPage.subtotal', 'Subtotal')}</span>
                  <span>{orderData.subtotalAmount.toFixed(2)} SAR</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>{t('ordersPage.shippingFee', 'Shipping Fee')}</span>
                  <span>{orderData.shippingTotalAmount.toFixed(2)} SAR</span>
                </div>
                {estimatedVat > 0 && (
                  <div className="flex justify-between text-gray-500">
                    <span>{t('ordersPage.estimatedTax', 'Estimated Tax (15% VAT)')}</span>
                    <span>{estimatedVat.toFixed(2)} SAR</span>
                  </div>
                )}
                {orderData.discountAmount > 0 && (
                  <div className="flex justify-between text-gray-500">
                    <span>{t('ordersPage.discount', 'Discount')}</span>
                    <span className="text-emerald-600">-{orderData.discountAmount.toFixed(2)} SAR</span>
                  </div>
                )}
                <div className="pt-2 border-t border-gray-100 flex justify-between items-center font-bold">
                  <span className="text-gray-900 text-sm">{t('ordersPage.grandTotal', 'Grand Total')}</span>
                  <span className="text-rose-500 text-sm">{orderData.grandTotalAmount.toFixed(2)} SAR</span>
                </div>
              </div>
            </div>

            {/* 6. Sub-Orders */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-gray-900 text-sm">
                  {t('ordersPage.subOrdersTitle', 'Sub-Orders')}
                </h2>
                <span className="text-xs text-gray-400">{orderData.subOrders.length} {t('ordersPage.itemsCount', 'items')}</span>
              </div>
              <div className="space-y-4">
                {orderData.subOrders.map((sub, sIdx) => {
                  const vendorName = getVendorDisplayName(sub.vendorId, sIdx);
                  return (
                    <SubOrderCard
                      key={sub.id}
                      subOrder={sub}
                      vendorName={vendorName}
                      orderId={id}
                      onUpdateStatus={(payload) => handleSubOrderUpdate(sub.id, payload)}
                      isUpdating={updateSubOrderStatusMutation.isPending && updateSubOrderStatusMutation.variables?.subOrderId === sub.id}
                      StatusBadge={StatusBadge}
                      getProductThumbnail={getProductThumbnail}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Desktop Grid Layout */
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6 items-start">
            {/* Left Column */}
            <div className="space-y-6">
              {/* 1. Order Items Table */}
              <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs">
                <h2 className="font-bold text-gray-900 text-base mb-4">
                  {t('ordersPage.orderItems', 'Order Items')}
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-start text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 text-gray-400 font-medium pb-2">
                        <th className="text-start pb-3 font-medium">{t('ordersPage.product', 'Product')}</th>
                        <th className="text-center pb-3 font-medium">{t('ordersPage.qty', 'Qty')}</th>
                        <th className="text-end pb-3 font-medium">{t('ordersPage.price', 'Price')}</th>
                        <th className="text-end pb-3 font-medium">{t('ordersPage.subtotal', 'Subtotal')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {allOrderItems.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-4 text-center text-gray-400">
                            No items found
                          </td>
                        </tr>
                      ) : (
                        allOrderItems.map((it) => (
                          <tr key={it.id}>
                            <td className="py-4 text-start">
                              <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-lg bg-amber-900/10 border border-gray-100 shrink-0 flex items-center justify-center text-xl">
                                  {getProductThumbnail(it.productName)}
                                </div>
                                <div>
                                  <p className="font-bold text-gray-900 text-sm">{it.productName}</p>
                                  {Boolean(it.variantLabel) && (
                                    <p className="text-gray-400 text-xs">
                                      {String(it.variantLabel)}
                                    </p>
                                  )}
                                  <p className="text-gray-400 text-[11px]">
                                    {t('ordersPage.vendorColon', 'Vendor:')} {getVendorDisplayName()}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 text-center text-gray-700 font-medium text-xs">{it.quantity}</td>
                            <td className="py-4 text-end text-gray-700 font-medium text-xs">{it.unitPrice.toFixed(2)} SAR</td>
                            <td className="py-4 text-end font-bold text-gray-900 text-sm">{it.lineTotal.toFixed(2)} SAR</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 2. Summary Card */}
              <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs">
                <h2 className="font-bold text-gray-900 text-base mb-4">
                  {t('ordersPage.summary', 'Summary')}
                </h2>
                <div className="space-y-2.5 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>{t('ordersPage.subtotal', 'Subtotal')}</span>
                    <span className="font-medium text-gray-900">{orderData.subtotalAmount.toFixed(2)} SAR</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('ordersPage.shippingFee', 'Shipping Fee')}</span>
                    <span className="font-medium text-gray-900">{orderData.shippingTotalAmount.toFixed(2)} SAR</span>
                  </div>
                  {estimatedVat > 0 && (
                    <div className="flex justify-between">
                      <span>{t('ordersPage.estimatedTax', 'Estimated Tax (15% VAT)')}</span>
                      <span className="font-medium text-gray-900">{estimatedVat.toFixed(2)} SAR</span>
                    </div>
                  )}
                  {orderData.discountAmount > 0 && (
                    <div className="flex justify-between">
                      <span>{t('ordersPage.discount', 'Discount')}</span>
                      <span className="font-medium text-emerald-600">-{orderData.discountAmount.toFixed(2)} SAR</span>
                    </div>
                  )}
                  <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                    <span className="font-bold text-gray-900 text-sm">{t('ordersPage.grandTotal', 'Grand Total')}</span>
                    <span className="font-bold text-rose-500 text-base">{orderData.grandTotalAmount.toFixed(2)} SAR</span>
                  </div>
                </div>
              </div>

              {/* 3. Sub-Orders Block */}
              <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-6">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h2 className="font-bold text-gray-900 text-base">
                    {t('ordersPage.subOrdersTitle', 'Sub-Orders')}
                  </h2>
                  <span className="text-xs text-gray-400 font-medium">{orderData.subOrders.length} {t('ordersPage.itemsCount', 'items')}</span>
                </div>

                {orderData.subOrders.map((sub, sIdx) => {
                  const vendorName = getVendorDisplayName(sub.vendorId, sIdx);
                  return (
                    <SubOrderCard
                      key={sub.id}
                      subOrder={sub}
                      vendorName={vendorName}
                      orderId={id}
                      onUpdateStatus={(payload) => handleSubOrderUpdate(sub.id, payload)}
                      isUpdating={updateSubOrderStatusMutation.isPending && updateSubOrderStatusMutation.variables?.subOrderId === sub.id}
                      StatusBadge={StatusBadge}
                      getProductThumbnail={getProductThumbnail}
                    />
                  );
                })}

                {/* Out of stock / refund warning notice */}
                {allOrderItems.some((it) => it.isRefunded) && (
                  <div className="bg-rose-50 border border-rose-100 rounded-lg p-3.5 flex items-center gap-2 text-xs text-rose-600">
                    <AlertTriangle size={15} className="shrink-0 text-rose-500" />
                    <span>
                      {t(
                        'ordersPage.outOfStockWarning',
                        'Some products in your order are out of stock. You can reorder without these items.'
                      )}
                    </span>
                  </div>
                )}

                {/* Sub-orders Summary Footer */}
                <div className="pt-4 border-t border-gray-100 text-end text-xs space-y-1">
                  <p className="text-gray-500">{t('ordersPage.totalItemsColon', 'Total Items:')} <span className="font-bold text-gray-900">{orderData.subtotalAmount.toFixed(2)} SAR</span></p>
                  <p className="text-gray-500">{t('ordersPage.totalShippingColon', 'Total Shipping:')} <span className="font-bold text-gray-900">{orderData.shippingTotalAmount.toFixed(2)} SAR</span></p>
                  <p className="text-sm font-bold text-gray-900 pt-1">{t('ordersPage.grandTotalColon', 'Grand Total:')} <span className="text-gray-900">{orderData.grandTotalAmount.toFixed(2)} SAR</span></p>
                </div>
              </div>
            </div>

            {/* Right Column Sidebar */}
            <div className="space-y-5">
              {/* 1. Order Info Card */}
              <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs">
                <h2 className="font-bold text-gray-900 text-sm mb-3">
                  {t('ordersPage.orderInfo', 'Order Info')}
                </h2>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">{t('ordersPage.orderIdColon', 'Order ID:')}</span>
                    <span className="font-bold text-gray-900">{orderIdCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">{t('ordersPage.dateColon', 'Date:')}</span>
                    <span className="text-gray-600">{formattedDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">{t('ordersPage.paymentMethodColon', 'Payment Method:')}</span>
                    <span className="text-gray-600">{t('ordersPage.creditCardMada', 'Credit Card (Mada)')}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-gray-400">{t('ordersPage.paymentStatusColon', 'Payment Status:')}</span>
                    <StatusBadge status={orderData.paymentStatus} />
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-gray-400">{t('ordersPage.overallStatusColon', 'Overall Status:')}</span>
                    <StatusBadge status={orderData.overallStatus} />
                  </div>
                </div>
              </div>

              {/* 2. Customer Details */}
              <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs">
                <h2 className="font-bold text-gray-900 text-sm mb-3">
                  {t('ordersPage.customerDetails', 'Customer Details')}
                </h2>
                <div className="space-y-1.5 text-xs">
                  <p className="font-bold text-gray-900 text-sm">{orderData.recipientName || 'Yousef Al-Harbi'}</p>
                  <p className="text-gray-500">{t('ordersPage.emailColon', 'Email:')} {customerEmail}</p>
                  <p className="text-gray-500">{t('ordersPage.phoneColon', 'Phone:')} {customerPhone}</p>
                </div>
              </div>

              {/* 3. Shipping Address */}
              <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs">
                <h2 className="font-bold text-gray-900 text-sm mb-3">
                  {t('ordersPage.shippingAddress', 'Shipping Address')}
                </h2>
                <div className="space-y-1 text-xs text-gray-600">
                  <p className="font-medium text-gray-900">{addressString}</p>
                  <p className="text-gray-400">Saudi Arabia</p>
                </div>
              </div>

              {/* 4. Order Timeline (Dynamic from overallStatus) */}
              <OrderTimeline overallStatus={orderData.overallStatus} date={formattedDate} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
