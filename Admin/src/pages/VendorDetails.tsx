import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronRight, Phone, Mail, MapPin, Hash } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import type { Variants } from 'motion/react';
import { useVendorStore } from '../features/vendors/store/vendorStore';
import {
  VENDOR_MOCK_ORDERS,
  VENDOR_MOCK_PRODUCTS,
  VENDOR_MOCK_PAYOUTS,
  type MockOrder,
  type MockProduct,
  type MockPayout,
} from '../features/vendors/data/constant';
import SuspendVendorModal from '../features/vendors/modals/SuspendVendorModal';
import ActivateVendorModal from '../features/vendors/modals/ActivateVendorModal';

// ── Motion variants ─────────────────────────────────────────────────────────────

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 16 } },
};

// ── Helpers ─────────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

// ── Card wrapper ────────────────────────────────────────────────────────────────

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      variants={cardVariants}
      className={`bg-white rounded-lg border border-gray-100 shadow-sm ${className}`}
    >
      {children}
    </motion.div>
  );
}

// ── Stat card ───────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  unit,
  highlight,
}: {
  label: string;
  value: number | string;
  unit?: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex-1 min-w-0 bg-white rounded-lg border border-gray-100 shadow-sm p-4">
      <p className="text-xs text-gray-500 mb-2">{label}</p>
      <p
        className={`text-xl font-bold truncate ${
          highlight ? 'text-amber-600' : 'text-gray-900'
        }`}
      >
        {typeof value === 'number' ? value.toLocaleString() : value}
        {unit && (
          <span className="text-xs font-normal text-gray-400 ms-1">{unit}</span>
        )}
      </p>
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────────

export default function VendorDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const ORDER_STATUS_STYLES: Record<MockOrder['status'], { label: string; className: string }> = useMemo(
    () => ({
      active: { label: t('vendors.details.statusActive', 'Active'), className: 'bg-green-50 text-green-700' },
      completed: { label: t('vendors.details.statusCompleted', 'Completed'), className: 'bg-blue-50 text-blue-700' },
      pending: { label: t('vendors.details.statusPending', 'Pending'), className: 'bg-amber-50 text-amber-700' },
      cancelled: { label: t('vendors.details.statusCancelled', 'Cancelled'), className: 'bg-red-50 text-red-600' },
    }),
    [t]
  );

  const PAYOUT_STATUS_STYLES: Record<MockPayout['status'], { label: string; className: string }> = useMemo(
    () => ({
      completed: { label: t('vendors.details.statusCompleted', 'Completed'), className: 'bg-blue-50 text-blue-700' },
      accepted: { label: t('vendors.details.statusAccepted', 'Accepted'), className: 'bg-green-50 text-green-700' },
      pending: { label: t('vendors.details.statusPending', 'Pending'), className: 'bg-amber-50 text-amber-700' },
      rejected: { label: t('vendors.details.statusRejected', 'Rejected'), className: 'bg-red-50 text-red-600' },
    }),
    [t]
  );

  const vendors = useVendorStore((s) => s.vendors);
  const suspendVendor = useVendorStore((s) => s.suspendVendor);
  const activateVendor = useVendorStore((s) => s.activateVendor);

  const vendorId = id ?? '';
  const vendor = vendors.find((v) => v.id === vendorId);

  const [showSuspend, setShowSuspend] = useState(false);
  const [showActivate, setShowActivate] = useState(false);

  const orders: MockOrder[] = VENDOR_MOCK_ORDERS[vendorId as unknown as keyof typeof VENDOR_MOCK_ORDERS] ?? [];
  const products: MockProduct[] = VENDOR_MOCK_PRODUCTS[vendorId as unknown as keyof typeof VENDOR_MOCK_PRODUCTS] ?? [];
  const payouts: MockPayout[] = VENDOR_MOCK_PAYOUTS[vendorId as unknown as keyof typeof VENDOR_MOCK_PAYOUTS] ?? [];

  if (!vendor) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 py-40 text-center">
        <p className="text-gray-500 text-sm">{t('vendors.details.vendorNotFound')}</p>
        <button
          onClick={() => navigate('/vendors')}
          className="text-sm underline text-gray-600 cursor-pointer"
        >
          {t('vendors.details.backToVendors')}
        </button>
      </div>
    );
  }

  const initials = getInitials(vendor.businessName);
  const isActive = vendor.active !== false;

  const handleSuspendConfirm = (reason: string) => {
    suspendVendor(vendorId, reason);
    setShowSuspend(false);
  };

  const handleActivateConfirm = () => {
    activateVendor(vendorId);
    setShowActivate(false);
  };

  return (
    <>
      {/* ── Page header ── */}
      <div
        className="sidebar-page-container flex items-center justify-between mb-6 bg-gray-50"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 py-5 text-sm text-gray-500">
          <Link to="/vendors" className="hover:text-gray-700 transition-colors">
            {t('vendors.details.breadcrumbParent')}
          </Link>
          <ChevronRight size={14} className="text-gray-400 shrink-0" />
          <span className="text-gray-900 font-medium">
            {t('vendors.details.breadcrumbCurrent')}
          </span>
        </div>

        {/* Single action button: Suspend or Activate */}
        {isActive ? (
          <button
            onClick={() => setShowSuspend(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-red-200 text-red-600 bg-white text-sm font-medium hover:bg-red-50 transition-colors"
          >
            {t('vendors.details.suspendVendor')}
          </button>
        ) : (
          <button
            onClick={() => setShowActivate(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-green-200 text-green-700 bg-white text-sm font-medium hover:bg-green-50 transition-colors"
          >
            {t('vendors.details.activateVendor', 'Activate Vendor')}
          </button>
        )}
      </div>

      {/* ── Scrollable content ── */}
      <motion.div
        className="sidebar-page-container flex-1 overflow-y-auto pt-0"
        variants={containerVariants}
        initial="hidden"
        animate="show"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* ── Vendor header card ── */}
        <Card className="p-5 mb-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center text-white text-lg font-bold shrink-0">
              {initials}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-600">
                  {vendor.category}
                </span>
                {/* Active/Inactive badge */}
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                    isActive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-50 text-red-600'
                  }`}
                >
                  {isActive
                    ? t('vendors.details.statusActive', 'Active')
                    : t('vendors.details.statusInactive', 'Inactive')}
                </span>
              </div>
              <h1 className="text-xl font-bold text-gray-900 leading-tight">
                {vendor.businessName}
              </h1>
              {vendor.joinedDate && (
                <p className="text-xs text-gray-400 mt-0.5">
                  {t('vendors.details.joined')} {vendor.joinedDate}
                </p>
              )}
              {vendor.description && (
                <p className="text-sm text-gray-500 mt-2 leading-relaxed line-clamp-2">
                  {vendor.description}
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* ── Contact information ── */}
        <Card className="p-5 mb-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">
            {t('vendors.details.contactInfo')}
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Phone size={12} />
                {t('vendors.details.phone')}
              </div>
              <p className="text-sm font-medium text-gray-800">{vendor.phone ?? '—'}</p>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Mail size={12} />
                {t('vendors.details.email')}
              </div>
              <p className="text-sm font-medium text-gray-800 break-all">{vendor.email}</p>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <MapPin size={12} />
                {t('vendors.details.location')}
              </div>
              <p className="text-sm font-medium text-gray-800">{vendor.location ?? '—'}</p>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Hash size={12} />
                {t('vendors.details.taxId')}
              </div>
              <p className="text-sm font-medium text-gray-800 font-mono">
                {vendor.taxId ?? '—'}
              </p>
            </div>
          </div>
        </Card>

        {/* ── Stats ── */}
        <motion.div variants={cardVariants} className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          <StatCard label={t('vendors.details.totalSales')} value={vendor.revenue ?? 0} unit="SAR" />
          <StatCard label={t('vendors.details.products')} value={vendor.products ?? 0} />
          <StatCard label={t('vendors.details.ordersCount')} value={vendor.orders ?? 0} />
          <StatCard label={t('vendors.details.totalDue')} value={vendor.totalDue ?? 0} unit="SAR" />
          <StatCard label={t('vendors.details.invoices')} value={vendor.invoices ?? 0} unit="SAR" />
          <StatCard
            label={t('vendors.details.pendingPayout')}
            value={vendor.pendingPayout ?? 0}
            unit="SAR"
            highlight
          />
        </motion.div>

        {/* ── Recent Orders ── */}
        <Card className="mb-4">
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <h2 className="text-sm font-semibold text-gray-800">
              {t('vendors.details.recentOrders')}
            </h2>
            <Link
              to={`/vendors/${vendorId}/orders`}
              className="text-xs text-gray-500 hover:text-gray-700 font-medium flex items-center gap-1 transition-colors"
            >
              {t('vendors.details.viewAllOrders')}
              <ChevronRight size={13} />
            </Link>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-5 py-2.5 text-start text-xs font-semibold text-gray-400">
                    {t('vendors.details.orderId')}
                  </th>
                  <th className="px-5 py-2.5 text-start text-xs font-semibold text-gray-400">
                    {t('vendors.details.submittedDate')}
                  </th>
                  <th className="px-5 py-2.5 text-start text-xs font-semibold text-gray-400">
                    {t('vendors.details.customerName')}
                  </th>
                  <th className="px-5 py-2.5 text-start text-xs font-semibold text-gray-400">
                    {t('vendors.details.status')}
                  </th>
                  <th className="px-5 py-2.5 text-start text-xs font-semibold text-gray-400">
                    {t('vendors.details.price')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-xs text-gray-400">
                      {t('vendors.details.noOrdersYet', 'No orders yet')}
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => {
                    const style = ORDER_STATUS_STYLES[order.status] ?? {
                      label: order.status,
                      className: 'bg-gray-100 text-gray-700',
                    };
                    return (
                      <tr
                        key={order.id}
                        className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors"
                      >
                        <td className="px-5 py-3 text-indigo-600 font-medium text-xs">
                          {order.id}
                        </td>
                        <td className="px-5 py-3 text-gray-500 text-xs">
                          {order.submittedDate}
                        </td>
                        <td className="px-5 py-3 text-gray-700 text-xs">
                          {order.customerName}
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${style.className}`}
                          >
                            {style.label}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-gray-700 text-xs font-medium">
                          SAR {order.price.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden px-4 pb-4 space-y-3">
            {orders.length === 0 ? (
              <p className="text-center text-xs text-gray-400 py-6">{t('vendors.details.noOrdersYet', 'No orders yet')}</p>
            ) : (
              orders.map((order) => {
                const style = ORDER_STATUS_STYLES[order.status] ?? {
                  label: order.status,
                  className: 'bg-gray-100 text-gray-700',
                };
                return (
                  <div
                    key={order.id}
                    className="bg-gray-50 rounded-lg border border-gray-100 p-3.5 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-600">{order.id}</span>
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${style.className}`}
                      >
                        {style.label}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 text-xs text-gray-500">
                      <p>
                        {t('vendors.details.customerLabel', 'Customer')}:{' '}
                        <span className="font-semibold text-gray-800">{order.customerName}</span>
                      </p>
                      <p>
                        {t('vendors.details.dateLabel', 'Date')}:{' '}
                        <span className="font-semibold text-gray-800">{order.submittedDate}</span>
                      </p>
                      <p className="col-span-2">
                        {t('vendors.details.amountLabel', 'Amount')}:{' '}
                        <span className="font-bold text-gray-900">
                          SAR {order.price.toLocaleString()}
                        </span>
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* ── Recent Products ── */}
        <Card className="mb-4">
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <h2 className="text-sm font-semibold text-gray-800">
              {t('vendors.details.recentProducts')}
            </h2>
            <Link
              to={`/vendors/${vendorId}/products`}
              className="text-xs text-gray-500 hover:text-gray-700 font-medium flex items-center gap-1 transition-colors"
            >
              {t('vendors.details.viewAllProducts')}
              <ChevronRight size={13} />
            </Link>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-5 py-2.5 text-start text-xs font-semibold text-gray-400">
                    {t('vendors.details.productName')}
                  </th>
                  <th className="px-5 py-2.5 text-start text-xs font-semibold text-gray-400">
                    {t('vendors.details.category')}
                  </th>
                  <th className="px-5 py-2.5 text-start text-xs font-semibold text-gray-400">
                    {t('vendors.details.price')}
                  </th>
                  <th className="px-5 py-2.5 text-start text-xs font-semibold text-gray-400">
                    {t('vendors.details.status')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-xs text-gray-400">
                      {t('vendors.details.noProductsYet', 'No products yet')}
                    </td>
                  </tr>
                ) : (
                  products.map((product, idx) => (
                    <tr
                      key={`${product.name}-${idx}`}
                      className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors"
                    >
                      <td className="px-5 py-3 text-gray-800 text-xs font-medium">
                        {product.name}
                      </td>
                      <td className="px-5 py-3 text-gray-500 text-xs">{product.category}</td>
                      <td className="px-5 py-3 text-gray-700 text-xs font-medium">
                        SAR {product.price.toLocaleString()}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            product.status === 'active'
                              ? 'bg-green-50 text-green-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {product.status === 'active'
                            ? t('vendors.details.statusActive')
                            : t('vendors.details.statusInactive')}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden px-4 pb-4 space-y-3">
            {products.length === 0 ? (
              <p className="text-center text-xs text-gray-400 py-6">{t('vendors.details.noProductsYet', 'No products yet')}</p>
            ) : (
              products.map((product, idx) => (
                <div
                  key={`${product.name}-${idx}`}
                  className="bg-gray-50 rounded-lg border border-gray-100 p-3.5 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-gray-800 truncate">
                      {product.name}
                    </span>
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold shrink-0 ${
                        product.status === 'active'
                          ? 'bg-green-50 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {product.status === 'active'
                        ? t('vendors.details.statusActive')
                        : t('vendors.details.statusInactive')}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 text-xs text-gray-500">
                    <p>
                      {t('vendors.details.categoryLabel', 'Category')}:{' '}
                      <span className="font-semibold text-gray-800">{product.category}</span>
                    </p>
                    <p>
                      {t('vendors.details.priceLabel', 'Price')}:{' '}
                      <span className="font-bold text-gray-900">
                        SAR {product.price.toLocaleString()}
                      </span>
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* ── Payouts Log ── */}
        <Card className="mb-6">
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <h2 className="text-sm font-semibold text-gray-800">
              {t('vendors.details.payoutsLog')}
            </h2>
            <Link
              to={`/vendors/${vendorId}/payouts`}
              className="text-xs text-gray-500 hover:text-gray-700 font-medium flex items-center gap-1 transition-colors"
            >
              {t('vendors.details.viewAllPayouts')}
              <ChevronRight size={13} />
            </Link>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-5 py-2.5 text-start text-xs font-semibold text-gray-400">
                    {t('vendors.details.payoutId')}
                  </th>
                  <th className="px-5 py-2.5 text-start text-xs font-semibold text-gray-400">
                    {t('vendors.details.date')}
                  </th>
                  <th className="px-5 py-2.5 text-start text-xs font-semibold text-gray-400">
                    {t('vendors.details.amount')}
                  </th>
                  <th className="px-5 py-2.5 text-start text-xs font-semibold text-gray-400">
                    {t('vendors.details.status')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {payouts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-xs text-gray-400">
                      {t('vendors.details.noPayoutsYet', 'No payouts yet')}
                    </td>
                  </tr>
                ) : (
                  payouts.slice(0, 5).map((payout) => {
                    const style = PAYOUT_STATUS_STYLES[payout.status] ?? {
                      label: payout.status,
                      className: 'bg-gray-100 text-gray-700',
                    };
                    return (
                      <tr
                        key={payout.id}
                        className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors"
                      >
                        <td className="px-5 py-3 text-amber-600 font-semibold text-xs">
                          {payout.id}
                        </td>
                        <td className="px-5 py-3 text-gray-500 text-xs">{payout.date}</td>
                        <td className="px-5 py-3 text-gray-700 text-xs font-medium">
                          SAR {payout.amount.toLocaleString()}
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${style.className}`}
                          >
                            {style.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden px-4 pb-4 space-y-3">
            {payouts.length === 0 ? (
              <p className="text-center text-xs text-gray-400 py-6">{t('vendors.details.noPayoutsYet', 'No payouts yet')}</p>
            ) : (
              payouts.slice(0, 5).map((payout) => {
                const style = PAYOUT_STATUS_STYLES[payout.status] ?? {
                  label: payout.status,
                  className: 'bg-gray-100 text-gray-700',
                };
                return (
                  <div
                    key={payout.id}
                    className="bg-gray-50 rounded-lg border border-gray-100 p-3.5 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-600">{payout.id}</span>
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${style.className}`}
                      >
                        {style.label}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 text-xs text-gray-500">
                      <p>
                        {t('vendors.details.dateLabel', 'Date')}:{' '}
                        <span className="font-semibold text-gray-800">{payout.date}</span>
                      </p>
                      <p>
                        {t('vendors.details.amountLabel', 'Amount')}:{' '}
                        <span className="font-bold text-gray-900">
                          SAR {payout.amount.toLocaleString()}
                        </span>
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </motion.div>

      {/* ── Modals ── */}
      <SuspendVendorModal
        isOpen={showSuspend}
        vendorName={vendor.businessName}
        onConfirm={handleSuspendConfirm}
        onCancel={() => setShowSuspend(false)}
      />
      <ActivateVendorModal
        isOpen={showActivate}
        vendorName={vendor.businessName}
        onConfirm={handleActivateConfirm}
        onCancel={() => setShowActivate(false)}
      />
    </>
  );
}
