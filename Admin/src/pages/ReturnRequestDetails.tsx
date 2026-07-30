import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRight, Check, X, AlertTriangle, Loader2, Save } from 'lucide-react';
import { useBreakpoint } from '../hooks/useBreakpoint';
import {
  useAdminRefundDetail,
  useApproveAdminRefund,
  useRejectAdminRefund,
  useUpdateAdminRefundNotes,
} from '../features/Orders/hooks/useAdminRefunds';

// ── Status Pill Badge ───────────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: string }) => {
  const { t } = useTranslation();
  const upper = (status || '').toUpperCase();
  let badgeStyle = 'bg-gray-100 text-gray-700';

  if (['APPROVED', 'COMPLETED'].includes(upper)) {
    badgeStyle = 'bg-emerald-100/80 text-emerald-700';
  } else if (['REJECTED', 'CANCELED', 'CANCELLED'].includes(upper)) {
    badgeStyle = 'bg-rose-100/80 text-rose-700';
  } else if (['PENDING', 'PENDING_REVIEW'].includes(upper)) {
    badgeStyle = 'bg-amber-100/80 text-amber-800';
  }

  return (
    <span className={`inline-block px-3.5 py-1.5 rounded-full text-xs font-semibold ${badgeStyle}`}>
      {t(`ordersPage.statuses.${status}`, status)}
    </span>
  );
};

export default function ReturnRequestDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { isMobile } = useBreakpoint();
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const { data: refund, isLoading, isError } = useAdminRefundDetail(id);

  const approveMutation = useApproveAdminRefund(id);
  const rejectMutation = useRejectAdminRefund(id);
  const notesMutation = useUpdateAdminRefundNotes(id);

  const [rejectReasonInput, setRejectReasonInput] = useState('');
  const [adminNoteInput, setAdminNoteInput] = useState('');

  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    if (refund?.internalNotes && typeof refund.internalNotes === 'string') {
      setAdminNoteInput(refund.internalNotes);
    }
  }, [refund?.internalNotes]);

  const shortId = id ? (id.length > 8 ? id.slice(-6).toUpperCase() : id) : '77492-CS';
  const refundIdCode = `#REF-${shortId}`;

  const orderShortId = refund?.orderId
    ? refund.orderId.length > 8
      ? refund.orderId.slice(-6).toUpperCase()
      : refund.orderId
    : '77492-CS';
  const orderIdCode = `#ORD-${orderShortId}`;

  const customerName = refund?.customer
    ? `${refund.customer.firstName || ''} ${refund.customer.lastName || ''}`.trim() || 'Guest Buyer'
    : refund?.shipping?.recipientName || 'Yousef Al-Harbi';

  const customerEmail = refund?.customer?.email || 'yousef.alharbi@domain.sa';
  const customerPhone = refund?.customer?.phoneNumber || refund?.shipping?.recipientPhone || '+966 50 123 4567';

  const formattedDate = refund?.createdAt
    ? new Date(refund.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Oct 24, 2026, 14:32';

  const currentStatus = refund?.status || 'PENDING';
  const isPending = currentStatus === 'PENDING' || currentStatus === 'PENDING_REVIEW';

  const itemsList = refund?.items || [];
  const primaryItem = itemsList[0];
  const itemReason = primaryItem?.reason
    ? primaryItem.reason.replace(/_/g, ' ')
    : typeof refund?.rejectionReason === 'string'
    ? refund.rejectionReason
    : 'Item defect/wrong item received';

  const handleConfirmApprove = async () => {
    if (!id) return;
    await approveMutation.mutateAsync(id);
    setShowApproveModal(false);
  };

  const handleConfirmReject = async () => {
    if (!id) return;
    await rejectMutation.mutateAsync({
      id,
      reason: rejectReasonInput.trim() || 'Item shows normal wear, not a defect.',
    });
    setShowRejectModal(false);
  };

  const handleSaveNotes = async () => {
    if (!id) return;
    await notesMutation.mutateAsync({
      id,
      notes: adminNoteInput,
    });
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-6 bg-gray-50/80 min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
          <Loader2 className="animate-spin text-gray-900" size={20} />
          <span>Loading refund details...</span>
        </div>
      </div>
    );
  }

  if (isError || !refund) {
    return (
      <div className="flex-1 p-8 bg-gray-50/80 min-h-screen flex flex-col items-center justify-center text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Refund Not Found</h2>
        <p className="text-sm text-gray-500 mb-4">Could not load details for refund ID: {id}</p>
        <button
          type="button"
          onClick={() => navigate('/orders')}
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
            {t('ordersPage.refunds', 'Refunds')}
          </h1>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <span
              onClick={() => navigate('/orders')}
              className="hover:underline cursor-pointer text-gray-500 font-medium"
            >
              {t('ordersPage.title', 'Orders')}
            </span>
            <ChevronRight size={12} className={isRtl ? 'rotate-180' : ''} />
            <span className="text-gray-900 font-semibold">{refundIdCode}</span>
          </div>
        </div>
      </div>

      {/* Main Body Container */}
      <div className="sidebar-page-container py-6">
        {isMobile ? (
          /* Mobile Stacked View */
          <div className="space-y-4">
            {/* 1. Top Banner Card */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-[11px] text-gray-400 font-semibold tracking-wider uppercase">
                    Refund ID
                  </p>
                  <p className="font-bold text-gray-900 text-base">{refundIdCode}</p>
                </div>
                <StatusBadge status={currentStatus} />
              </div>
              <div className="space-y-1.5 text-xs border-t border-gray-100 pt-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Requested Date:</span>
                  <span className="text-gray-700 font-medium">{formattedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Payment Method:</span>
                  <span className="text-gray-700 font-medium">Online Payment</span>
                </div>
              </div>
            </div>

            {/* 2. Customer Explanation Card */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-2xs">
              <h2 className="font-bold text-gray-900 text-sm mb-3">Reason / Explanation</h2>
              <div className="bg-gray-50/80 border border-gray-100 rounded-lg p-3.5 text-xs text-gray-700 leading-relaxed font-medium italic">
                "{itemReason}"
              </div>
            </div>

            {/* 3. Order & Customer Info Card */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-2xs">
              <h2 className="font-bold text-gray-900 text-sm mb-3">Order & Customer Info</h2>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Order ID</span>
                  <span className="font-bold text-gray-900">{orderIdCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Customer Name</span>
                  <span className="font-bold text-gray-900">{customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Email Address</span>
                  <a href={`mailto:${customerEmail}`} className="text-blue-600 font-medium hover:underline">
                    {customerEmail}
                  </a>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Phone Number</span>
                  <span className="text-gray-900 font-medium">{customerPhone}</span>
                </div>
              </div>
            </div>

            {/* 4. Financial Summary Card */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-2xs">
              <h2 className="font-bold text-gray-900 text-sm mb-3">Financial Summary</h2>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Requested Refund Amount</span>
                  <span className="font-bold text-gray-900">{(refund.totalRefundAmount || 0).toFixed(2)} SAR</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Reason for Refund</span>
                  <span className="text-gray-900 font-medium">{itemReason}</span>
                </div>
              </div>
            </div>

            {/* 5. Products Requested for Refund Card */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-2xs">
              <h2 className="font-bold text-gray-900 text-sm mb-3">
                Products Requested for Refund
              </h2>
              <div className="space-y-3">
                {itemsList.map((it) => (
                  <div key={it.id} className="flex items-center justify-between text-xs border-t border-gray-100 pt-3">
                    <div className="flex items-center gap-3">
                      {typeof it.thumbnailUrl === 'string' && it.thumbnailUrl ? (
                        <img
                          src={it.thumbnailUrl}
                          alt={it.productNameSnapshot}
                          className="w-12 h-12 rounded-lg object-cover border border-gray-100 shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-100 shrink-0 flex items-center justify-center text-lg">
                          📦
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-gray-900 text-xs">{it.productNameSnapshot}</p>
                        {Boolean(it.orderItemId) && (
                          <p className="text-gray-400 text-[11px]">Item ID: {it.orderItemId.slice(-6).toUpperCase()}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-end">
                      <p className="text-gray-400 text-[11px]">QTY 1</p>
                      <p className="font-bold text-gray-900 text-xs">{(it.refundAmount || it.unitPriceSnapshot || 0).toFixed(2)} SAR</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 6. Review & Action Card */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-2xs">
              <h2 className="font-bold text-gray-900 text-sm mb-3">Review & Action</h2>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs text-gray-500 font-medium">Internal Notes</label>
                    <button
                      type="button"
                      onClick={handleSaveNotes}
                      disabled={notesMutation.isPending}
                      className="text-[11px] text-blue-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Save size={12} />
                      <span>{notesMutation.isPending ? 'Saving...' : 'Save Notes'}</span>
                    </button>
                  </div>
                  <textarea
                    value={adminNoteInput}
                    onChange={(e) => setAdminNoteInput(e.target.value)}
                    placeholder="Add a private note for internal teams..."
                    className="w-full border border-gray-200 rounded-lg p-3 text-xs bg-white h-24 focus:outline-none focus:border-gray-900 placeholder-gray-400 resize-none"
                  />
                </div>

                {isPending ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setShowApproveModal(true)}
                      className="w-full bg-gray-950 text-white hover:bg-gray-800 font-semibold py-3 rounded-lg shadow-xs flex items-center justify-center gap-2 text-xs cursor-pointer transition-all active:scale-98"
                    >
                      <Check size={15} />
                      <span>Approve Refund</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowRejectModal(true)}
                      className="w-full bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 font-semibold py-3 rounded-lg shadow-xs flex items-center justify-center gap-2 text-xs cursor-pointer transition-all active:scale-98"
                    >
                      <X size={15} />
                      <span>Reject Refund</span>
                    </button>
                  </>
                ) : (
                  <div
                    className={`p-3.5 rounded-lg border text-xs font-semibold flex items-center gap-2 justify-center ${
                      currentStatus === 'APPROVED'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'bg-rose-50 border-rose-200 text-rose-700'
                    }`}
                  >
                    <span>Decision Recorded: Refund {currentStatus}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Desktop Layout */
          <div className="space-y-6">
            {/* Top Summary Banner */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs flex items-center justify-between gap-6">
              <div className="grid grid-cols-3 gap-10 flex-1">
                <div>
                  <p className="text-[11px] text-gray-400 font-semibold tracking-wider uppercase mb-1">
                    Refund ID
                  </p>
                  <p className="font-bold text-gray-900 text-base sm:text-lg">{refundIdCode}</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 font-semibold tracking-wider uppercase mb-1">
                    Requested Date
                  </p>
                  <p className="font-bold text-gray-900 text-sm">{formattedDate}</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 font-semibold tracking-wider uppercase mb-1">
                    Payment Method
                  </p>
                  <p className="font-bold text-gray-900 text-sm">Online Payment</p>
                </div>
              </div>
              <div>
                <StatusBadge status={currentStatus} />
              </div>
            </div>

            {/* Main Desktop Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6 items-start">
              {/* Left Main Column */}
              <div className="space-y-6">
                {/* 1. Order & Customer Info */}
                <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs">
                  <h2 className="font-bold text-gray-900 text-base mb-4">
                    Order & Customer Info
                  </h2>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Order ID</span>
                      <span className="font-bold text-gray-900">{orderIdCode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Customer Name</span>
                      <span className="font-bold text-gray-900">{customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Email Address</span>
                      <a href={`mailto:${customerEmail}`} className="text-blue-600 font-medium hover:underline">
                        {customerEmail}
                      </a>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Phone Number</span>
                      <span className="text-gray-900 font-medium">{customerPhone}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Financial Summary */}
                <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs">
                  <h2 className="font-bold text-gray-900 text-base mb-4">Financial Summary</h2>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Requested Refund Amount</span>
                      <span className="font-bold text-gray-900">{(refund.totalRefundAmount || 0).toFixed(2)} SAR</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Reason for Refund</span>
                      <span className="text-gray-900 font-medium">{itemReason}</span>
                    </div>
                  </div>
                </div>

                {/* 3. Products Requested for Refund */}
                <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs">
                  <h2 className="font-bold text-gray-900 text-base mb-4">
                    Products Requested for Refund
                  </h2>
                  <div className="space-y-4">
                    {itemsList.map((it) => (
                      <div key={it.id} className="flex items-center justify-between text-xs border-t border-gray-100 pt-4">
                        <div className="flex items-center gap-3">
                          {typeof it.thumbnailUrl === 'string' && it.thumbnailUrl ? (
                            <img
                              src={it.thumbnailUrl}
                              alt={it.productNameSnapshot}
                              className="w-12 h-12 rounded-lg object-cover border border-gray-100 shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-100 shrink-0 flex items-center justify-center text-lg">
                              📦
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-gray-900 text-sm">{it.productNameSnapshot}</p>
                            {Boolean(it.orderItemId) && (
                              <p className="text-gray-400 text-xs">Item ID: {it.orderItemId.slice(-6).toUpperCase()}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-12 text-end">
                          <div>
                            <p className="text-[11px] text-gray-400 font-semibold uppercase">QTY</p>
                            <p className="font-bold text-gray-900 text-xs">1</p>
                          </div>
                          <div>
                            <p className="text-[11px] text-gray-400 font-semibold uppercase">UNIT PRICE</p>
                            <p className="font-bold text-gray-900 text-sm">{(it.refundAmount || it.unitPriceSnapshot || 0).toFixed(2)} SAR</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column Sidebar */}
              <div className="space-y-6">
                {/* 1. Customer Explanation Card */}
                <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs">
                  <h2 className="font-bold text-gray-900 text-base mb-3">
                    Reason / Explanation
                  </h2>
                  <div className="bg-gray-50/80 border border-gray-100 rounded-lg p-4 text-xs text-gray-700 leading-relaxed font-medium italic">
                    "{itemReason}"
                  </div>
                </div>

                {/* 2. Review & Action Card */}
                <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs">
                  <h2 className="font-bold text-gray-900 text-base mb-4">Review & Action</h2>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs text-gray-500 font-medium">Internal Notes</label>
                        <button
                          type="button"
                          onClick={handleSaveNotes}
                          disabled={notesMutation.isPending}
                          className="text-[11px] text-blue-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Save size={12} />
                          <span>{notesMutation.isPending ? 'Saving...' : 'Save Notes'}</span>
                        </button>
                      </div>
                      <textarea
                        value={adminNoteInput}
                        onChange={(e) => setAdminNoteInput(e.target.value)}
                        placeholder="Add a private note for internal teams..."
                        className="w-full border border-gray-200 rounded-lg p-3 text-xs bg-white h-24 focus:outline-none focus:border-gray-900 placeholder-gray-400 resize-none"
                      />
                    </div>

                    {isPending ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setShowApproveModal(true)}
                          className="w-full bg-gray-950 text-white hover:bg-gray-800 font-semibold py-3 rounded-lg shadow-xs flex items-center justify-center gap-2 text-xs cursor-pointer transition-all active:scale-98"
                        >
                          <Check size={15} />
                          <span>Approve Refund</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowRejectModal(true)}
                          className="w-full bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 font-semibold py-3 rounded-lg shadow-xs flex items-center justify-center gap-2 text-xs cursor-pointer transition-all active:scale-98"
                        >
                          <X size={15} />
                          <span>Reject Refund</span>
                        </button>
                      </>
                    ) : (
                      <div
                        className={`p-3.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 ${
                          currentStatus === 'APPROVED'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                            : 'bg-rose-50 border-rose-200 text-rose-700'
                        }`}
                      >
                        <span>Decision Recorded: Refund {currentStatus}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Approve Refund Confirmation Modal Popup ─────────────────── */}
      {showApproveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl relative">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <Check size={24} className="stroke-3" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
              Approve Refund Request
            </h3>
            <p className="text-xs text-gray-500 text-center leading-relaxed mb-5">
              Are you sure you want to approve this refund request? Once approved, the refund status will change to Approved and the refund amount of <strong className="text-gray-900">{(refund.totalRefundAmount || 0).toFixed(2)} SAR</strong> will be processed.
            </p>
            <div className="bg-gray-50 border border-gray-100 rounded-lg p-3.5 space-y-2 mb-6 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Refund ID</span>
                <span className="font-semibold text-gray-900 font-mono">{refundIdCode}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Customer</span>
                <span className="font-semibold text-gray-900">{customerName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Refund Amount</span>
                <span className="font-semibold text-gray-900">{(refund.totalRefundAmount || 0).toFixed(2)} SAR</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setShowApproveModal(false)}
                className="py-2.5 px-4 rounded-lg border border-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmApprove}
                disabled={approveMutation.isPending}
                className="py-2.5 px-4 rounded-lg bg-gray-950 text-white text-xs font-semibold hover:bg-gray-800 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                {approveMutation.isPending && <Loader2 className="animate-spin" size={14} />}
                <span>Approve Refund</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Reject Refund Confirmation Modal Popup ──────────────────── */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl relative">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
                <AlertTriangle size={24} />
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
              Reject Refund Request
            </h3>
            <p className="text-xs text-gray-500 text-center leading-relaxed mb-4">
              Are you sure you want to reject this refund request for customer <strong className="text-gray-900">{customerName}</strong>?
            </p>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-700 mb-1 text-start">Rejection Reason</label>
              <input
                type="text"
                value={rejectReasonInput}
                onChange={(e) => setRejectReasonInput(e.target.value)}
                placeholder="e.g. Item shows normal wear, not a defect."
                className="w-full p-2.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-rose-500"
              />
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-lg p-3.5 space-y-2 mb-6 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Refund ID</span>
                <span className="font-semibold text-gray-900 font-mono">{refundIdCode}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Customer</span>
                <span className="font-semibold text-gray-900">{customerName}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="py-2.5 px-4 rounded-lg border border-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={rejectMutation.isPending}
                className="py-2.5 px-4 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                {rejectMutation.isPending && <Loader2 className="animate-spin" size={14} />}
                <span>Reject Refund</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
