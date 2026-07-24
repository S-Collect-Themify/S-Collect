import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ChevronDown,
  Edit2,
  AlertTriangle,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useBreakpoint } from '../hooks/useBreakpoint';
import PortalDropdown from '../components/ui/PortalDropdown';

// ── Status Pill Component ───────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: string }) => {
  const { t } = useTranslation();
  let badgeStyle = 'bg-gray-100 text-gray-700';

  if (status === 'Delivered' || status === 'Approved' || status === 'Paid') {
    badgeStyle = 'bg-emerald-100/80 text-emerald-700';
  } else if (status === 'Returned') {
    badgeStyle = 'bg-amber-100/80 text-amber-700';
  } else if (status === 'Cancelled' || status === 'Canceled' || status === 'Rejected') {
    badgeStyle = 'bg-rose-100/80 text-rose-700';
  } else if (status === 'Processing') {
    badgeStyle = 'bg-blue-100/80 text-blue-700';
  }

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${badgeStyle}`}>
      {t(`ordersPage.statuses.${status}`, status)}
    </span>
  );
};

export default function OrderDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { isMobile } = useBreakpoint();
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const orderIdCode = id ? (id.startsWith('#') ? id : `#${id}`) : '#ORD-77492-CS';

  // Sub-order tracking & status states
  const [subOrders, setSubOrders] = useState([
    {
      id: 'sub-1',
      vendor: 'Nike Store',
      status: 'Delivered',
      trackingNo: '12390AA18123456784',
      subtotal: 'EGP 1,200.00',
      shipping: 'EGP 45.00',
      items: [
        {
          name: 'Air Max 270',
          variant: 'Size: 10 | Color: Black/White',
          qty: 1,
          date: 'Delivered Oct 12, 2024',
          price: '$150.00',
          img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100',
        },
        {
          name: 'Nike Hoodie',
          variant: 'Size: M | Color: Gray',
          qty: 1,
          date: 'Delivered Oct 12, 2024',
          price: '$69.99',
          img: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=100',
        },
      ],
    },
    {
      id: 'sub-2',
      vendor: 'Adidas Official',
      status: 'Returned',
      trackingNo: '12390AA18123456784',
      subtotal: 'EGP 1,200.00',
      shipping: 'EGP 40.00',
      items: [
        {
          name: 'Adidas Backpack',
          variant: 'Color: Black',
          qty: 1,
          date: 'Returned Oct 15, 2024',
          price: '$45.00',
          img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=100',
        },
      ],
    },
    {
      id: 'sub-3',
      vendor: 'Puma Store',
      status: 'Cancelled',
      trackingNo: '12390AA18123456784',
      subtotal: '',
      shipping: '',
      items: [
        {
          name: "Levi's 501 Original Jeans",
          variant: 'Size: 32W | Color: Indigo',
          qty: 2,
          date: 'Shipped Jul 5, 2025',
          price: '$89.50',
          img: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=100',
        },
        {
          name: 'Nike Air Max 90',
          variant: 'Size: 10 | Color: Black',
          qty: 1,
          date: 'Delivered Jun 28, 2025',
          price: '$134.99',
          img: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=100',
        },
        {
          name: 'Patagonia Nano Puff Jacket',
          variant: 'Size: M | Color: Forge Grey',
          qty: 1,
          date: 'Processing Jul 12, 2025',
          price: '$199.00',
          img: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=100',
        },
      ],
    },
  ]);

  const handleStatusChange = (subId: string, newStatus: string) => {
    setSubOrders((prev) =>
      prev.map((s) => (s.id === subId ? { ...s, status: newStatus } : s))
    );
  };

  const handleTrackingChange = (subId: string, newTracking: string) => {
    setSubOrders((prev) =>
      prev.map((s) => (s.id === subId ? { ...s, trackingNo: newTracking } : s))
    );
  };

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
                  <span className="text-gray-700">Oct 24, 2026, 09:41 AM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">{t('ordersPage.paymentMethodColon', 'Payment Method:')}</span>
                  <span className="text-gray-700">{t('ordersPage.creditCardMada', 'Credit Card (Mada)')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">{t('ordersPage.paymentStatusColon', 'Payment Status:')}</span>
                  <StatusBadge status="Paid" />
                </div>
              </div>
            </div>

            {/* 2. Customer Details */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-2xs">
              <h2 className="font-bold text-gray-900 text-sm mb-3">
                {t('ordersPage.customerDetails', 'Customer Details')}
              </h2>
              <div className="space-y-1.5 text-xs">
                <p className="font-bold text-gray-900 text-sm">Yousef Al-Harbi</p>
                <p className="text-gray-500">{t('ordersPage.emailColon', 'Email:')} y.alharbi@gmail.com</p>
                <p className="text-gray-500">{t('ordersPage.phoneColon', 'Phone:')} +966 50 123 4567</p>
              </div>
            </div>

            {/* 3. Shipping Address */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-2xs">
              <h2 className="font-bold text-gray-900 text-sm mb-3">
                {t('ordersPage.shippingAddress', 'Shipping Address')}
              </h2>
              <div className="space-y-1 text-xs text-gray-600">
                <p>King Fahd Road, Al Olaya District</p>
                <p>Riyadh, 12211</p>
                <p className="text-gray-400">Saudi Arabia</p>
              </div>
            </div>

            {/* 4. Order Timeline */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-2xs">
              <h2 className="font-bold text-gray-900 text-sm mb-4">
                {t('ordersPage.orderTimeline', 'Order Timeline')}
              </h2>
              <div className={`space-y-4 relative ${isRtl ? 'pr-5' : 'pl-5'}`}>
                {/* Connecting line */}
                <div
                  className={`absolute top-2 bottom-2 w-0.5 bg-gray-200 ${
                    isRtl ? 'right-1.75' : 'left-1.75'
                  }`}
                />
                
                {/* Step 1 */}
                <div className="relative">
                  <span
                    className={`absolute top-1 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-white ${
                      isRtl ? '-right-5' : '-left-5'
                    }`}
                  />
                  <p className="font-bold text-gray-900 text-xs">
                    {t('ordersPage.timeline.orderPlaced', 'Order Placed')}
                  </p>
                  <p className="text-[11px] text-gray-400">Oct 24, 2026 - 09:41 AM</p>
                </div>
                {/* Step 2 */}
                <div className="relative">
                  <span
                    className={`absolute top-1 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-white ${
                      isRtl ? '-right-5' : '-left-5'
                    }`}
                  />
                  <p className="font-bold text-gray-900 text-xs">
                    {t('ordersPage.timeline.paymentConfirmed', 'Payment Confirmed')}
                  </p>
                  <p className="text-[11px] text-gray-400">Oct 24, 2026 - 09:43 AM</p>
                </div>
                {/* Step 3 */}
                <div className="relative">
                  <span
                    className={`absolute top-1 w-3 h-3 rounded-full bg-blue-600 ring-4 ring-white ${
                      isRtl ? '-right-5' : '-left-5'
                    }`}
                  />
                  <p className="font-bold text-blue-600 text-xs">
                    {t('ordersPage.timeline.processing', 'Processing')}
                  </p>
                  <p className="text-[11px] text-gray-400">Oct 24, 2026 - 10:15 AM</p>
                </div>
                {/* Step 4 */}
                <div className="relative">
                  <span
                    className={`absolute top-1 w-3 h-3 rounded-full bg-gray-300 ring-4 ring-white ${
                      isRtl ? '-right-5' : '-left-5'
                    }`}
                  />
                  <p className="font-medium text-gray-400 text-xs">
                    {t('ordersPage.timeline.shipped', 'Shipped')}
                  </p>
                  <p className="text-[11px] text-gray-400">
                    {t('ordersPage.timeline.pendingFulfillment', 'Pending Fulfillment')}
                  </p>
                </div>
              </div>
            </div>

            {/* 5. Order Items */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-2xs">
              <h2 className="font-bold text-gray-900 text-sm mb-3">
                {t('ordersPage.orderItems', 'Order Items')}
              </h2>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-900/10 border border-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                    <span className="text-xl">🪵</span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-xs">Luxury Arabic Oud</p>
                    <p className="text-gray-400 text-[11px]">
                      {t('ordersPage.vendorColon', 'Vendor:')} Al-Falah Crafts
                    </p>
                  </div>
                </div>
                <div className="text-end">
                  <p className="text-gray-500 text-xs">{t('ordersPage.qtyShort', 'Qty')} 1</p>
                  <p className="font-bold text-gray-900 text-xs">450.00 SAR</p>
                </div>
              </div>
            </div>

            {/* 6. Summary */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-2xs">
              <h2 className="font-bold text-gray-900 text-sm mb-3">
                {t('ordersPage.summary', 'Summary')}
              </h2>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-gray-500">
                  <span>{t('ordersPage.subtotal', 'Subtotal')}</span>
                  <span>450.00 SAR</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>{t('ordersPage.shippingFee', 'Shipping Fee')}</span>
                  <span>25.00 SAR</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>{t('ordersPage.estimatedTax', 'Estimated Tax (15% VAT)')}</span>
                  <span>67.50 SAR</span>
                </div>
                <div className="pt-2 border-t border-gray-100 flex justify-between items-center font-bold">
                  <span className="text-gray-900 text-sm">{t('ordersPage.grandTotal', 'Grand Total')}</span>
                  <span className="text-emerald-600 text-sm">542.50 SAR</span>
                </div>
              </div>
            </div>

            {/* 7. Sub-Orders */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-gray-900 text-sm">
                  {t('ordersPage.subOrdersTitle', 'Sub-Orders')}
                </h2>
                <span className="text-xs text-gray-400">3 {t('ordersPage.itemsCount', 'items')}</span>
              </div>
              <div className="space-y-3">
                {subOrders.map((sub) => (
                  <div key={sub.id} className="p-3 border border-gray-100 rounded-xl bg-gray-50/50">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-bold text-gray-900 text-xs">{sub.vendor}</p>
                      <StatusBadge status={sub.status} />
                    </div>
                    {sub.items.map((it, idx) => (
                      <p key={idx} className="text-[11px] text-gray-500">
                        {it.name} ({it.price})
                      </p>
                    ))}
                  </div>
                ))}
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
                      <tr>
                        <td className="py-4 text-start">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-amber-900/10 border border-gray-100 overflow-hidden shrink-0 flex items-center justify-center text-xl">
                              🪵
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 text-sm">Luxury Arabic Oud</p>
                              <p className="text-gray-400 text-xs">
                                {t('ordersPage.vendorColon', 'Vendor:')} Al-Falah Crafts
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 text-center text-gray-700 font-medium text-xs">1</td>
                        <td className="py-4 text-end text-gray-700 font-medium text-xs">450.00 SAR</td>
                        <td className="py-4 text-end font-bold text-gray-900 text-sm">450.00 SAR</td>
                      </tr>
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
                    <span className="font-medium text-gray-900">450.00 SAR</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('ordersPage.shippingFee', 'Shipping Fee')}</span>
                    <span className="font-medium text-gray-900">25.00 SAR</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('ordersPage.estimatedTax', 'Estimated Tax (15% VAT)')}</span>
                    <span className="font-medium text-gray-900">67.50 SAR</span>
                  </div>
                  <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                    <span className="font-bold text-gray-900 text-sm">{t('ordersPage.grandTotal', 'Grand Total')}</span>
                    <span className="font-bold text-rose-500 text-base">542.50 SAR</span>
                  </div>
                </div>
              </div>

              {/* 3. Sub-Orders Block */}
              <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-6">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h2 className="font-bold text-gray-900 text-base">
                    {t('ordersPage.subOrdersTitle', 'Sub-Orders')}
                  </h2>
                  <span className="text-xs text-gray-400 font-medium">3 {t('ordersPage.itemsCount', 'items')}</span>
                </div>

                {subOrders.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-4 rounded-2xl border border-gray-200/70 bg-white space-y-4"
                  >
                    {/* Sub-order Header */}
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-gray-900 text-sm">{sub.vendor}</h3>
                      <StatusBadge status={sub.status} />
                    </div>

                    {/* Controls Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {/* Tracking No */}
                      <div>
                        <label className="block text-[11px] text-gray-400 mb-1 font-medium">
                          {t('ordersPage.trackingNoLabel', 'Tracking No.')}
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={sub.trackingNo}
                            onChange={(e) => handleTrackingChange(sub.id, e.target.value)}
                            className={`w-full py-2 rounded-xl border border-gray-200 text-xs font-mono text-gray-800 bg-gray-50/50 focus:outline-none focus:border-gray-900 ${
                              isRtl ? 'pl-8 pr-3' : 'pr-8 pl-3'
                            }`}
                          />
                          <button
                            type="button"
                            className={`absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 ${
                              isRtl ? 'left-2.5' : 'right-2.5'
                            }`}
                          >
                            <Edit2 size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Change Status */}
                      <div>
                        <label className="block text-[11px] text-gray-400 mb-1 font-medium">
                          {t('ordersPage.changeStatus', 'Change Status')}
                        </label>
                        <PortalDropdown
                          minWidth={150}
                          animate={false}
                          menuClassName="bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden z-50 py-1"
                          trigger={({ isOpen, toggle }) => (
                            <button
                              type="button"
                              onClick={toggle}
                              className="w-full flex items-center justify-between py-2 px-3 rounded-xl border border-gray-200 text-xs text-gray-800 bg-gray-50/50 hover:bg-white focus:outline-none cursor-pointer"
                            >
                              <span>{t(`ordersPage.statuses.${sub.status}`, sub.status)}</span>
                              <ChevronDown
                                size={14}
                                className={`text-gray-400 transition-transform ${
                                  isOpen ? 'rotate-180' : ''
                                }`}
                              />
                            </button>
                          )}
                        >
                          {({ close }) => (
                            <div>
                              {['Pending', 'Processing', 'Shipped', 'Delivered', 'Returned', 'Cancelled'].map(
                                (st) => (
                                  <button
                                    key={st}
                                    type="button"
                                    onClick={() => {
                                      handleStatusChange(sub.id, st);
                                      close();
                                    }}
                                    className={`w-full text-start px-3 py-2 text-xs font-medium hover:bg-gray-50 cursor-pointer ${
                                      sub.status === st ? 'font-bold bg-gray-100' : 'text-gray-700'
                                    }`}
                                  >
                                    {t(`ordersPage.statuses.${st}`, st)}
                                  </button>
                                )
                              )}
                            </div>
                          )}
                        </PortalDropdown>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        className="text-[11px] text-blue-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>{t('ordersPage.viewProduct', 'View Product')}</span>
                        <ExternalLink size={11} />
                      </button>
                    </div>

                    {/* Sub-order Items List */}
                    <div className="space-y-3 pt-2 border-t border-gray-100">
                      {sub.items.map((it, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            <img
                              src={it.img}
                              alt={it.name}
                              className="w-11 h-11 rounded-lg object-cover border border-gray-100 shrink-0"
                            />
                            <div>
                              <p className="font-bold text-gray-900">{it.name}</p>
                              <p className="text-gray-400 text-[11px]">{it.variant}</p>
                              <p className="text-gray-400 text-[11px]">{t('ordersPage.qtyColon', 'Qty:')} {it.qty}</p>
                              <p className="text-gray-400 text-[11px]">{it.date}</p>
                            </div>
                          </div>
                          <span className="font-bold text-gray-900 text-xs">{it.price}</span>
                        </div>
                      ))}
                    </div>

                    {sub.subtotal && (
                      <div className="pt-2 border-t border-gray-100 text-end text-xs space-y-0.5 text-gray-500">
                        <p>{t('ordersPage.subtotalColon', 'Subtotal:')} <span className="font-semibold text-gray-900">{sub.subtotal}</span></p>
                        <p>{t('ordersPage.shippingColon', 'Shipping:')} <span className="font-semibold text-gray-900">{sub.shipping}</span></p>
                      </div>
                    )}
                  </div>
                ))}

                {/* Warning Alert */}
                <div className="bg-rose-50 border border-rose-100 rounded-xl p-3.5 flex items-center gap-2 text-xs text-rose-600">
                  <AlertTriangle size={15} className="shrink-0 text-rose-500" />
                  <span>
                    {t(
                      'ordersPage.outOfStockWarning',
                      'Some products in your order are out of stock. You can reorder without these items.'
                    )}
                  </span>
                </div>

                {/* Sub-orders Total Summary */}
                <div className="pt-4 border-t border-gray-100 text-end text-xs space-y-1">
                  <p className="text-gray-500">{t('ordersPage.totalItemsColon', 'Total Items:')} <span className="font-bold text-gray-900">EGP 1,650.00</span></p>
                  <p className="text-gray-500">{t('ordersPage.totalShippingColon', 'Total Shipping:')} <span className="font-bold text-gray-900">EGP 40.00</span></p>
                  <p className="text-sm font-bold text-gray-900 pt-1">{t('ordersPage.grandTotalColon', 'Grand Total:')} <span className="text-gray-900">EGP 1,690.00</span></p>
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
                    <span className="text-gray-600">Oct 24, 2026, 09:41 AM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">{t('ordersPage.paymentMethodColon', 'Payment Method:')}</span>
                    <span className="text-gray-600">{t('ordersPage.creditCardMada', 'Credit Card (Mada)')}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-gray-400">{t('ordersPage.paymentStatusColon', 'Payment Status:')}</span>
                    <StatusBadge status="Paid" />
                  </div>
                </div>
              </div>

              {/* 2. Customer Details */}
              <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs">
                <h2 className="font-bold text-gray-900 text-sm mb-3">
                  {t('ordersPage.customerDetails', 'Customer Details')}
                </h2>
                <div className="space-y-1 text-xs">
                  <p className="font-bold text-gray-900 text-sm">Yousef Al-Harbi</p>
                  <p className="text-gray-500">{t('ordersPage.emailColon', 'Email:')} y.alharbi@gmail.com</p>
                  <p className="text-gray-500">{t('ordersPage.phoneColon', 'Phone:')} +966 50 123 4567</p>
                </div>
              </div>

              {/* 3. Shipping Address */}
              <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs">
                <h2 className="font-bold text-gray-900 text-sm mb-3">
                  {t('ordersPage.shippingAddress', 'Shipping Address')}
                </h2>
                <div className="space-y-1 text-xs text-gray-600">
                  <p className="font-medium text-gray-900">King Fahd Road, Al Olaya District</p>
                  <p>Riyadh, 12211</p>
                  <p className="text-gray-400">Saudi Arabia</p>
                </div>
              </div>

              {/* 4. Order Timeline */}
              <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs">
                <h2 className="font-bold text-gray-900 text-sm mb-4">
                  {t('ordersPage.orderTimeline', 'Order Timeline')}
                </h2>
                <div className={`space-y-5 relative ${isRtl ? 'pr-5' : 'pl-5'}`}>
                  {/* Vertical connector line */}
                  <div
                    className={`absolute top-2 bottom-2 w-0.5 bg-gray-200 ${
                      isRtl ? 'right-1.75' : 'left-1.75'
                    }`}
                  />

                  {/* Step 1 */}
                  <div className="relative">
                    <span
                      className={`absolute top-1 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-4 ring-white ${
                        isRtl ? '-right-5' : '-left-5'
                      }`}
                    />
                    <p className="font-bold text-gray-900 text-xs">
                      {t('ordersPage.timeline.orderPlaced', 'Order Placed')}
                    </p>
                    <p className="text-[11px] text-gray-400">Oct 24, 2026 - 09:41 AM</p>
                  </div>
                  {/* Step 2 */}
                  <div className="relative">
                    <span
                      className={`absolute top-1 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-4 ring-white ${
                        isRtl ? '-right-5' : '-left-5'
                      }`}
                    />
                    <p className="font-bold text-gray-900 text-xs">
                      {t('ordersPage.timeline.paymentConfirmed', 'Payment Confirmed')}
                    </p>
                    <p className="text-[11px] text-gray-400">Oct 24, 2026 - 09:43 AM</p>
                  </div>
                  {/* Step 3 */}
                  <div className="relative">
                    <span
                      className={`absolute top-1 w-3.5 h-3.5 rounded-full bg-blue-600 ring-4 ring-white ${
                        isRtl ? '-right-5' : '-left-5'
                      }`}
                    />
                    <p className="font-bold text-blue-600 text-xs">
                      {t('ordersPage.timeline.processing', 'Processing')}
                    </p>
                    <p className="text-[11px] text-gray-400">Oct 24, 2026 - 10:15 AM</p>
                  </div>
                  {/* Step 4 */}
                  <div className="relative">
                    <span
                      className={`absolute top-1 w-3.5 h-3.5 rounded-full bg-gray-300 ring-4 ring-white ${
                        isRtl ? '-right-5' : '-left-5'
                      }`}
                    />
                    <p className="font-medium text-gray-400 text-xs">
                      {t('ordersPage.timeline.shipped', 'Shipped')}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      {t('ordersPage.timeline.pendingFulfillment', 'Pending Fulfillment')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
