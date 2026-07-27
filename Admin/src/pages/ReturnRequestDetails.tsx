import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRight, Check, X, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useBreakpoint } from '../hooks/useBreakpoint';

// ── Status Pill Badge ───────────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: string }) => {
  const { t } = useTranslation();
  let badgeStyle = 'bg-gray-100 text-gray-700';

  if (status === 'Approved' || status === 'COMPLETED') {
    badgeStyle = 'bg-emerald-100/80 text-emerald-700';
  } else if (status === 'Rejected' || status === 'REJECTED') {
    badgeStyle = 'bg-rose-100/80 text-rose-700';
  } else if (status === 'Pending Review' || status === 'Pending' || status === 'PENDING_REVIEW') {
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

  const refundIdCode = id ? (id.startsWith('#') ? id : `#${id}`) : '#REF-77492-CS';

  const [status, setStatus] = useState<'Pending Review' | 'Approved' | 'Rejected'>('Pending Review');
  const [adminNote, setAdminNote] = useState('');
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  const handleApprove = () => {
    setStatus('Approved');
    toast.success('Refund request approved successfully');
  };

  const handleReject = () => {
    setStatus('Rejected');
    toast.error('Refund request rejected');
  };

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
              onClick={() => navigate('/incoming-orders')}
              className="hover:underline cursor-pointer text-gray-500 font-medium"
            >
              {t('ordersPage.refunds', 'Refunds')}
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
                <StatusBadge status={status} />
              </div>
              <div className="space-y-1.5 text-xs border-t border-gray-100 pt-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Requested Date:</span>
                  <span className="text-gray-700 font-medium">Oct 24, 2026, 14:32</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Payment Method:</span>
                  <span className="text-gray-700 font-medium">
                    Credit Card (Visa ending in 4392)
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Customer Explanation Card */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-2xs">
              <h2 className="font-bold text-gray-900 text-sm mb-3">Customer Explanation</h2>
              <div className="bg-gray-50/80 border border-gray-100 rounded-lg p-3.5 text-xs text-gray-700 leading-relaxed font-medium italic">
                "The keyboard layout is different from what was advertised. I requested the English/Arabic dual layout version, but I received the English-only layout. The seal is still intact and keyboard is completely unused."
              </div>
            </div>

            {/* 3. Order & Customer Info Card */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-2xs">
              <h2 className="font-bold text-gray-900 text-sm mb-3">Order & Customer Info</h2>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Order ID</span>
                  <span className="font-bold text-gray-900">#ORD-77492-CS</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Customer Name</span>
                  <span className="font-bold text-gray-900">Yousef Al-Harbi</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Email Address</span>
                  <a
                    href="mailto:yousef.alharbi@domain.sa"
                    className="text-blue-600 font-medium hover:underline"
                  >
                    yousef.alharbi@domain.sa
                  </a>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Phone Number</span>
                  <span className="text-gray-900 font-medium">+966 50 123 4567</span>
                </div>
              </div>
            </div>

            {/* 4. Financial Summary Card */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-2xs">
              <h2 className="font-bold text-gray-900 text-sm mb-3">Financial Summary</h2>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Original Order Amount</span>
                  <span className="font-bold text-gray-900">890.00 SAR</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Requested Refund Amount</span>
                  <span className="font-bold text-gray-900">450.00 SAR</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Reason for Refund</span>
                  <span className="text-gray-900 font-medium">Wrong product received</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Shipping Fee Refund</span>
                  <span className="text-gray-500">0.00 SAR (Non-refundable)</span>
                </div>
              </div>
            </div>

            {/* 5. Products Requested for Refund Card */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-2xs">
              <h2 className="font-bold text-gray-900 text-sm mb-3">
                Products Requested for Refund
              </h2>
              <div className="flex items-center justify-between text-xs pt-1">
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=100"
                    alt="Keyboard"
                    className="w-12 h-12 rounded-lg object-cover border border-gray-100 shrink-0"
                  />
                  <div>
                    <p className="font-bold text-gray-900 text-xs">
                      Wireless Mechanical Keyboard Pro v2
                    </p>
                    <p className="text-gray-400 text-[11px]">SKU: MECH-KEY-9941</p>
                  </div>
                </div>
                <div className="text-end">
                  <p className="text-gray-400 text-[11px]">QTY 1</p>
                  <p className="font-bold text-gray-900 text-xs">450.00 SAR</p>
                </div>
              </div>
            </div>

            {/* 6. Review & Action Card */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-2xs">
              <h2 className="font-bold text-gray-900 text-sm mb-3">Review & Action</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 font-medium mb-1.5">
                    Admin private notes
                  </label>
                  <textarea
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    disabled={status !== 'Pending Review'}
                    placeholder="Add a reason or note for this decision (visible to internal teams)..."
                    className="w-full border border-gray-200 rounded-lg p-3 text-xs bg-white h-24 focus:outline-none focus:border-gray-900 placeholder-gray-400 resize-none disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>

                {status === 'Pending Review' ? (
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
                      status === 'Approved'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'bg-rose-50 border-rose-200 text-rose-700'
                    }`}
                  >
                    <span>Decision Recorded: Refund {status}</span>
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
                  <p className="font-bold text-gray-900 text-sm">Oct 24, 2026, 14:32</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 font-semibold tracking-wider uppercase mb-1">
                    Payment Method
                  </p>
                  <p className="font-bold text-gray-900 text-sm">
                    Credit Card (Visa ending in 4392)
                  </p>
                </div>
              </div>
              <div>
                <StatusBadge status={status} />
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
                      <span className="font-bold text-gray-900">#ORD-77492-CS</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Customer Name</span>
                      <span className="font-bold text-gray-900">Yousef Al-Harbi</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Email Address</span>
                      <a
                        href="mailto:yousef.alharbi@domain.sa"
                        className="text-blue-600 font-medium hover:underline"
                      >
                        yousef.alharbi@domain.sa
                      </a>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Phone Number</span>
                      <span className="text-gray-900 font-medium">+966 50 123 4567</span>
                    </div>
                  </div>
                </div>

                {/* 2. Financial Summary */}
                <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs">
                  <h2 className="font-bold text-gray-900 text-base mb-4">Financial Summary</h2>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Original Order Amount</span>
                      <span className="font-bold text-gray-900">890.00 SAR</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Requested Refund Amount</span>
                      <span className="font-bold text-gray-900">450.00 SAR</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Reason for Refund</span>
                      <span className="text-gray-900 font-medium">Wrong product received</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Shipping Fee Refund</span>
                      <span className="text-gray-500">0.00 SAR (Non-refundable)</span>
                    </div>
                  </div>
                </div>

                {/* 3. Products Requested for Refund */}
                <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs">
                  <h2 className="font-bold text-gray-900 text-base mb-4">
                    Products Requested for Refund
                  </h2>
                  <div className="flex items-center justify-between text-xs border-t border-gray-100 pt-4">
                    <div className="flex items-center gap-3">
                      <img
                        src="https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=100"
                        alt="Keyboard"
                        className="w-12 h-12 rounded-lg object-cover border border-gray-100 shrink-0"
                      />
                      <div>
                        <p className="font-bold text-gray-900 text-sm">
                          Wireless Mechanical Keyboard Pro v2
                        </p>
                        <p className="text-gray-400 text-xs">SKU: MECH-KEY-9941</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-12 text-end">
                      <div>
                        <p className="text-[11px] text-gray-400 font-semibold uppercase">QTY</p>
                        <p className="font-bold text-gray-900 text-xs">1</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-gray-400 font-semibold uppercase">UNIT PRICE</p>
                        <p className="font-bold text-gray-900 text-sm">450.00 SAR</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column Sidebar */}
              <div className="space-y-6">
                {/* 1. Customer Explanation Card */}
                <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs">
                  <h2 className="font-bold text-gray-900 text-base mb-3">
                    Customer Explanation
                  </h2>
                  <div className="bg-gray-50/80 border border-gray-100 rounded-lg p-4 text-xs text-gray-700 leading-relaxed font-medium italic">
                    "The keyboard layout is different from what was advertised. I requested the English/Arabic dual layout version, but I received the English-only layout. The seal is still intact and keyboard is completely unused."
                  </div>
                </div>

                {/* 2. Review & Action Card */}
                <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs">
                  <h2 className="font-bold text-gray-900 text-base mb-4">Review & Action</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-gray-500 font-medium mb-1.5">
                        Admin private notes
                      </label>
                      <textarea
                        value={adminNote}
                        onChange={(e) => setAdminNote(e.target.value)}
                        disabled={status !== 'Pending Review'}
                        placeholder="Add a reason or note for this decision (visible to internal teams)..."
                        className="w-full border border-gray-200 rounded-lg p-3 text-xs bg-white h-24 focus:outline-none focus:border-gray-900 placeholder-gray-400 resize-none disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>

                    {status === 'Pending Review' ? (
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
                          status === 'Approved'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                            : 'bg-rose-50 border-rose-200 text-rose-700'
                        }`}
                      >
                        <span>Decision Recorded: Refund {status}</span>
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
              Are you sure you want to approve this refund request? Once approved, the refund status will change to Approved and the refund amount of <strong className="text-gray-900">450.00 SAR</strong> will be processed.
            </p>
            <div className="bg-gray-50 border border-gray-100 rounded-lg p-3.5 space-y-2 mb-6 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Refund ID</span>
                <span className="font-semibold text-gray-900 font-mono">{refundIdCode}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Customer</span>
                <span className="font-semibold text-gray-900">Yousef Al-Harbi</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Refund Amount</span>
                <span className="font-semibold text-gray-900">450.00 SAR</span>
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
                onClick={() => {
                  handleApprove();
                  setShowApproveModal(false);
                }}
                className="py-2.5 px-4 rounded-lg bg-gray-950 text-white text-xs font-semibold hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Approve Refund
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
              Are you sure you want to reject this refund request for customer <strong className="text-gray-900">Yousef Al-Harbi</strong>?
            </p>
            <div className="bg-gray-50 border border-gray-100 rounded-lg p-3.5 space-y-2 mb-6 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Refund ID</span>
                <span className="font-semibold text-gray-900 font-mono">{refundIdCode}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Customer</span>
                <span className="font-semibold text-gray-900">Yousef Al-Harbi</span>
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
                onClick={() => {
                  handleReject();
                  setShowRejectModal(false);
                }}
                className="py-2.5 px-4 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors cursor-pointer"
              >
                Reject Refund
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
