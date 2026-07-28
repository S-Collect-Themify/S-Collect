import { useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronRight, ChevronLeft, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import {
  useVendorDetails,
  useDeactivateVendor,
  useReactivateVendor,
  useApproveVendor,
  useRejectVendor,
} from '../features/vendors/hooks/useVendors';
import {
  VENDOR_MOCK_ORDERS,
  VENDOR_MOCK_PRODUCTS,
  VENDOR_MOCK_PAYOUTS,
  type MockOrder,
  type MockProduct,
  type MockPayout,
} from '../features/vendors/data/constant';
import RejectVendorModal from '../features/vendors/modals/RejectVendorModal';
import VendorConfirmModal from '../features/vendors/modals/VendorConfirmModal';
import { useVendorDetailsStore } from '../features/vendors/store/useVendorDetailsStore';
import {
  Card,
  StatCard,
  getInitials,
  containerVariants,
  cardVariants,
} from '../features/vendors/components/VendorDetailsCards';

// ── Main component ──────────────────────────────────────────────────────────────

export default function VendorDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const {
    showSuspend,
    showActivate,
    showReject,
    showApprove,
    openSuspend,
    closeSuspend,
    openActivate,
    closeActivate,
    openReject,
    closeReject,
    openApprove,
    closeApprove,
  } = useVendorDetailsStore();

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

  const vendorId = id ?? '';
  const { data: vendor, isLoading, isError } = useVendorDetails(vendorId);

  const approveMutation = useApproveVendor();
  const rejectMutation = useRejectVendor();
  const deactivateMutation = useDeactivateVendor();
  const reactivateMutation = useReactivateVendor();

  const orders: MockOrder[] = VENDOR_MOCK_ORDERS[vendorId as unknown as keyof typeof VENDOR_MOCK_ORDERS] ?? [];
  const products: MockProduct[] = VENDOR_MOCK_PRODUCTS[vendorId as unknown as keyof typeof VENDOR_MOCK_PRODUCTS] ?? [];
  const payouts: MockPayout[] = VENDOR_MOCK_PAYOUTS[vendorId as unknown as keyof typeof VENDOR_MOCK_PAYOUTS] ?? [];

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 py-40 text-center">
        <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 text-sm">{t('vendors.details.loading', 'Loading vendor details...')}</p>
      </div>
    );
  }

  if (isError || !vendor) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 py-40 text-center">
        <p className="text-gray-500 text-sm">{t('vendors.details.vendorNotFound', 'Vendor not found')}</p>
        <button
          onClick={() => navigate('/vendors')}
          className="text-sm underline text-gray-600 cursor-pointer"
        >
          {t('vendors.details.backToVendors', 'Back to Vendors')}
        </button>
      </div>
    );
  }

  const initials = getInitials(vendor.businessName);
  const rawStatus = vendor.rawStatus
    ? String(vendor.rawStatus).toUpperCase()
    : vendor.active
    ? 'ACTIVE'
    : 'PENDING_APPROVAL';

  const isRejected = rawStatus === 'REJECTED';

  const renderHeaderActions = () => {
    switch (rawStatus) {
      case 'PENDING_APPROVAL':
      case 'PENDING':
        return (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => openReject()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-red-200 text-red-600 bg-white text-sm font-medium hover:bg-red-50 transition-colors cursor-pointer"
            >
              {t('vendors.table.reject', 'Reject')}
            </button>
            <button
              type="button"
              onClick={() => openApprove()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-700 text-white text-sm font-semibold hover:bg-green-800 transition-colors cursor-pointer"
            >
              {t('vendors.table.accept', 'Accept')}
            </button>
          </div>
        );

      case 'ACTIVE':
      case 'APPROVED':
        return (
          <button
            type="button"
            onClick={() => openSuspend()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-red-200 text-red-600 bg-white text-sm font-medium hover:bg-red-50 transition-colors cursor-pointer"
          >
            {t('vendors.details.suspend', 'Suspend')}
          </button>
        );

      case 'DEACTIVATED':
      case 'SUSPENDED':
        return (
          <button
            type="button"
            onClick={() => openActivate()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-green-200 text-green-700 bg-white text-sm font-medium hover:bg-green-50 transition-colors cursor-pointer"
          >
            {t('vendors.details.activate', 'Activate')}
          </button>
        );

      case 'REJECTED':
        return (
          <span className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg">
            {t('vendors.details.rejectedNotice', 'Vendor is rejected')}
          </span>
        );

      default:
        return null;
    }
  };

  const renderStatusBadge = () => {
    switch (rawStatus) {
      case 'ACTIVE':
      case 'APPROVED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-600 border border-emerald-100/60">
            {t('vendors.details.statusActive', 'Active')}
          </span>
        );
      case 'PENDING_APPROVAL':
      case 'PENDING':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-100">
            {t('vendors.details.statusPending', 'Pending Approval')}
          </span>
        );
      case 'DEACTIVATED':
      case 'SUSPENDED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-red-50 text-red-600 border border-red-100">
            {t('vendors.details.statusDeactivated', 'Deactivated')}
          </span>
        );
      case 'REJECTED':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-red-50 text-red-600 border border-red-100">
            {t('vendors.details.statusRejected', 'Rejected')}
          </span>
        );
    }
  };

  const renderMobileHeaderActions = () => {
    switch (rawStatus) {
      case 'PENDING_APPROVAL':
      case 'PENDING':
        return (
          <div className="flex items-center gap-2.5 w-full">
            <button
              type="button"
              onClick={() => openReject()}
              className="flex-1 py-2.5 rounded-xl border border-red-200 text-red-600 bg-white text-xs font-semibold hover:bg-red-50 transition-colors cursor-pointer"
            >
              {t('vendors.table.reject', 'Reject')}
            </button>
            <button
              type="button"
              onClick={() => openApprove()}
              className="flex-1 py-2.5 rounded-xl bg-gray-900 text-white text-xs font-semibold hover:bg-black transition-colors cursor-pointer"
            >
              {t('vendors.table.accept', 'Accept')}
            </button>
          </div>
        );

      case 'ACTIVE':
      case 'APPROVED':
        return (
          <button
            type="button"
            onClick={() => openSuspend()}
            className="w-full py-2.5 rounded-xl border border-red-200 text-red-600 bg-white text-xs font-semibold hover:bg-red-50 transition-colors cursor-pointer text-center"
          >
            {t('vendors.details.suspend', 'Suspend')}
          </button>
        );

      case 'DEACTIVATED':
      case 'SUSPENDED':
        return (
          <button
            type="button"
            onClick={() => openActivate()}
            className="w-full py-2.5 rounded-xl border border-green-200 text-green-700 bg-white text-xs font-semibold hover:bg-green-50 transition-colors cursor-pointer text-center"
          >
            {t('vendors.details.activate', 'Activate')}
          </button>
        );

      case 'REJECTED':
        return (
          <div className="w-full text-center py-2 px-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-600">
            {t('vendors.details.rejectedNotice', 'Vendor is rejected')}
          </div>
        );

      default:
        return null;
    }
  };

  const handleSuspendConfirm = () => {
    deactivateMutation.mutate(vendorId);
    closeSuspend();
  };

  const handleActivateConfirm = () => {
    reactivateMutation.mutate(vendorId);
    closeActivate();
  };

  const handleRejectConfirm = (reason: string) => {
    rejectMutation.mutate({ id: vendorId, reason });
    closeReject();
  };

  const handleApproveConfirm = () => {
    approveMutation.mutate(vendorId);
    closeApprove();
  };

  return (
    <>
      {/* ── Desktop Page header ── */}
      <div
        className="hidden md:flex sidebar-page-container items-center justify-between mb-6 bg-gray-50"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 py-5 text-sm text-gray-500">
          <Link to="/vendors" className="hover:text-gray-700 transition-colors">
            {t('vendors.details.breadcrumbParent', 'Vendor Management')}
          </Link>
          <ChevronRight size={14} className="text-gray-400 shrink-0" />
          <span className="text-gray-900 font-medium">
            {t('vendors.details.breadcrumbCurrent', 'Vendor Details')}
          </span>
        </div>

        {/* Action button(s) */}
        {renderHeaderActions()}
      </div>

      {/* ── Mobile Page Header ── */}
      <div className="md:hidden flex flex-col gap-1 pb-3 pt-2 px-4 bg-gray-50 border-b border-gray-100 mb-4" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <button
            onClick={() => navigate('/vendors')}
            className="p-1 -ms-1 text-gray-700 hover:text-gray-900 cursor-pointer"
            aria-label="Back to vendors"
          >
            <ChevronLeft size={18} />
          </button>
          <Link to="/vendors" className="hover:text-gray-700 transition-colors font-medium">
            {t('vendors.details.breadcrumbParent', 'Vendor Management')}
          </Link>
          <ChevronRight size={12} className="text-gray-400 shrink-0" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 ms-7">
          {t('vendors.details.breadcrumbCurrent', 'Vendor Details')}
        </h1>
      </div>

      {/* ── Scrollable content ── */}
      <motion.div
        className="sidebar-page-container flex-1 overflow-y-auto pt-0"
        variants={containerVariants}
        initial="hidden"
        animate="show"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Rejected Alert Banner */}
        {isRejected && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-start gap-3">
            <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={18} />
            <div>
              <h3 className="text-sm font-bold text-red-800">
                {t('vendors.details.rejectedNotice', 'Vendor is rejected')}
              </h3>
              {vendor.rejectionReason && (
                <p className="text-xs text-red-700 mt-1">
                  <span className="font-semibold">{t('vendors.details.reason', 'Reason')}: </span>
                  {vendor.rejectionReason}
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── Mobile Top Vendor Card ── */}
        <div className="md:hidden bg-white rounded-2xl border border-gray-100 p-4 mb-4 shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="w-14 h-14 rounded-xl border border-gray-200 bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-base shrink-0 overflow-hidden">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-gray-900 truncate">
                  {vendor.businessName}
                </h2>
                {renderStatusBadge()}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {vendor.category}
                {(vendor.joinedDate || vendor.submittedDate) && (
                  <span> • Joined {vendor.joinedDate || vendor.submittedDate}</span>
                )}
              </p>
            </div>
          </div>

          {/* Action buttons row */}
          <div className="mt-4 pt-3 border-t border-gray-100">
            {renderMobileHeaderActions()}
          </div>
        </div>

        {/* ── Desktop Vendor Header & Contact Info Card ── */}
        <Card className="hidden md:block p-6 mb-5">
          {/* Top vendor overview */}
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl border border-gray-200 bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-base shrink-0 overflow-hidden shadow-2xs">
              {initials}
            </div>

            <div className="flex-1 min-w-0">
              <div className="mb-1">
                {renderStatusBadge()}
              </div>
              <h1 className="text-xl font-bold text-gray-900 leading-tight mb-1">
                {vendor.businessName}
              </h1>
              <p className="text-xs text-gray-400 mb-2">
                {vendor.category}
                {(vendor.joinedDate || vendor.submittedDate) && (
                  <span> • Joined {vendor.joinedDate || vendor.submittedDate}</span>
                )}
              </p>
              {vendor.description && (
                <p className="text-xs text-gray-500 leading-relaxed max-w-4xl">
                  {vendor.description}
                </p>
              )}
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="pt-6 border-t border-gray-100 mt-6">
            <h2 className="text-sm font-bold text-gray-900 mb-4">
              {t('vendors.details.contactInfo', 'Contact Information')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">
                  {t('vendors.details.owner', 'Owner')}
                </p>
                <p className="text-sm font-bold text-gray-900">{vendor.owner || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">
                  {t('vendors.details.phone', 'Phone')}
                </p>
                <p className="text-sm font-bold text-gray-900">{vendor.phone || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">
                  {t('vendors.details.email', 'Email')}
                </p>
                <p className="text-sm font-bold text-gray-900 break-all">{vendor.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">
                  {t('vendors.details.location', 'Location')}
                </p>
                <p className="text-sm font-bold text-gray-900">{vendor.location || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">
                  {t('vendors.details.commercialRegister', 'Commercial Register')}
                </p>
                <p className="text-sm font-bold text-gray-900 font-mono">
                  {vendor.taxId || '—'}
                </p>
              </div>
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

        {/* Mobile Contact Information Card */}
        <div className="md:hidden bg-white rounded-2xl border border-gray-100 p-4 mb-4 shadow-2xs">
          <h2 className="text-sm font-bold text-gray-900 mb-3.5">
            {t('vendors.details.contactInfo', 'Contact Information')}
          </h2>
          <div className="space-y-3 text-xs">
            <div>
              <p className="text-gray-400 mb-0.5">{t('vendors.details.owner', 'Owner')}</p>
              <p className="font-semibold text-gray-900 text-sm">{vendor.owner || '—'}</p>
            </div>
            <div>
              <p className="text-gray-400 mb-0.5">{t('vendors.details.email', 'Email')}</p>
              <p className="font-semibold text-gray-900 text-sm break-all">{vendor.email}</p>
            </div>
            <div>
              <p className="text-gray-400 mb-0.5">{t('vendors.details.phone', 'Phone')}</p>
              <p className="font-semibold text-gray-900 text-sm">{vendor.phone || '—'}</p>
            </div>
            <div>
              <p className="text-gray-400 mb-0.5">{t('vendors.details.location', 'Location')}</p>
              <p className="font-semibold text-gray-900 text-sm">{vendor.location || '—'}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Modals ── */}
      <VendorConfirmModal
        isOpen={showSuspend}
        type="deactivate"
        count={1}
        vendorName={vendor.businessName}
        onConfirm={handleSuspendConfirm}
        onCancel={closeSuspend}
      />
      <VendorConfirmModal
        isOpen={showActivate}
        type="reactivate"
        count={1}
        vendorName={vendor.businessName}
        onConfirm={handleActivateConfirm}
        onCancel={closeActivate}
      />
      <RejectVendorModal
        isOpen={showReject}
        vendorName={vendor.businessName}
        onConfirm={handleRejectConfirm}
        onCancel={closeReject}
      />
      <VendorConfirmModal
        isOpen={showApprove}
        type="approve"
        count={1}
        vendorName={vendor.businessName}
        onConfirm={handleApproveConfirm}
        onCancel={closeApprove}
      />
    </>
  );
}
