import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRight, Loader2 } from 'lucide-react';
import {
  useAdminRefundDetail,
  useApproveAdminRefund,
  useRejectAdminRefund,
  useUpdateAdminRefundNotes,
  RefundStatusBadge,
  RefundInfoCard,
  RefundFinancialSummaryCard,
  RefundProductsCard,
  RefundReviewActionCard,
  RefundImagesSwiper,
  ApproveRefundModal,
  RejectRefundModal,
} from '../features/Orders';

export default function ReturnRequestDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const { data: refund, isLoading, isError } = useAdminRefundDetail(id);

  const approveMutation = useApproveAdminRefund(id);
  const rejectMutation = useRejectAdminRefund(id);
  const notesMutation = useUpdateAdminRefundNotes(id);

  const [rejectReasonInput, setRejectReasonInput] = useState('');
  const [rejectReasonError, setRejectReasonError] = useState(false);
  const [adminNoteInput, setAdminNoteInput] = useState('');

  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  const [prevNotes, setPrevNotes] = useState<string | null>(null);
  const currentInternalNotes = typeof refund?.internalNotes === 'string' ? refund.internalNotes : '';

  if (currentInternalNotes && prevNotes !== currentInternalNotes) {
    setPrevNotes(currentInternalNotes);
    setAdminNoteInput(currentInternalNotes);
  }

  const shortId = id ? (id.length > 8 ? id.slice(-6).toUpperCase() : id) : '--';
  const refundIdCode = `#REF-${shortId}`;

  const orderShortId = refund?.orderId
    ? refund.orderId.length > 8
      ? refund.orderId.slice(-6).toUpperCase()
      : refund.orderId
    : '--';
  const orderIdCode = `#ORD-${orderShortId}`;

  const customerName = refund?.customer
    ? `${refund.customer.firstName || ''} ${refund.customer.lastName || ''}`.trim() || '--'
    : refund?.shipping?.recipientName || '--';

  const customerEmail = refund?.customer?.email || '--';
  const customerPhone = refund?.customer?.phoneNumber || refund?.shipping?.recipientPhone || '--';
  const rawPayment = (refund as any)?.paymentMethod || (refund as any)?.paymentStatus;
  const paymentMethod: string = typeof rawPayment === 'string' && rawPayment ? rawPayment : '--';

  const formattedDate = refund?.createdAt
    ? new Date(refund.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '--';

  const currentStatus = refund?.status || 'PENDING';
  const itemsList = refund?.items || [];
  const primaryItem = itemsList[0];
  const itemReason = primaryItem?.reason
    ? primaryItem.reason.replace(/_/g, ' ')
    : typeof refund?.rejectionReason === 'string'
    ? refund.rejectionReason
    : '--';

  const refundImages: string[] = Array.isArray(refund?.imageUrls)
    ? refund.imageUrls
    : Array.isArray((refund as any)?.images)
    ? (refund as any).images
    : Array.isArray((refund as any)?.photoUrls)
    ? (refund as any).photoUrls
    : [];

  const handleConfirmApprove = async () => {
    if (!id) return;
    try {
      await approveMutation.mutateAsync(id);
      setShowApproveModal(false);
    } catch {
      // Error toast handled by useApproveAdminRefund mutation
    }
  };

  const handleConfirmReject = async () => {
    if (!id) return;
    const trimmedReason = rejectReasonInput.trim();
    if (!trimmedReason) {
      setRejectReasonError(true);
      return;
    }
    setRejectReasonError(false);
    try {
      await rejectMutation.mutateAsync({
        id,
        reason: trimmedReason,
      });
      setShowRejectModal(false);
    } catch {
      // Error toast handled by useRejectAdminRefund mutation
    }
  };

  const handleSaveNotes = async () => {
    if (!id) return;
    try {
      await notesMutation.mutateAsync({
        id,
        notes: adminNoteInput,
      });
    } catch {
      // Error toast handled by useUpdateAdminRefundNotes mutation
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-6 bg-gray-50/80 min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
          <Loader2 className="animate-spin text-gray-900" size={20} />
          <span>{t('refundDetails.loading', 'Loading refund details...')}</span>
        </div>
      </div>
    );
  }

  if (isError || !refund) {
    return (
      <div className="flex-1 p-8 bg-gray-50/80 min-h-screen flex flex-col items-center justify-center text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">{t('refundDetails.notFound', 'Refund Not Found')}</h2>
        <p className="text-sm text-gray-500 mb-4">{t('refundDetails.couldNotLoad', 'Could not load details for refund ID: {{id}}', { id })}</p>
        <button
          type="button"
          onClick={() => navigate('/orders?tab=refunds')}
          className="px-4 py-2 bg-black text-white text-xs font-semibold rounded-lg cursor-pointer"
        >
          {t('refundDetails.backToOrders', 'Back to Orders')}
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50/80 min-h-screen">
      {/* Page Header */}
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
            <span
              onClick={() => navigate('/orders?tab=refunds')}
              className="hover:underline cursor-pointer text-gray-500 font-medium"
            >
              {t('ordersPage.refunds', 'Refunds')}
            </span>
            <ChevronRight size={12} className={isRtl ? 'rotate-180' : ''} />
            <span className="text-gray-900 font-semibold">{refundIdCode}</span>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="sidebar-page-container py-6 space-y-6">
        {/* Top Summary Banner */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-10 flex-1 w-full sm:w-auto">
            <div>
              <p className="text-[11px] text-gray-400 font-semibold tracking-wider uppercase mb-1">
                {t('refundDetails.refundId', 'Refund ID')}
              </p>
              <p className="font-bold text-gray-900 text-base sm:text-lg">{refundIdCode}</p>
            </div>
            <div>
              <p className="text-[11px] text-gray-400 font-semibold tracking-wider uppercase mb-1">
                {t('refundDetails.requestedDate', 'Requested Date')}
              </p>
              <p className="font-bold text-gray-900 text-xs sm:text-sm">{formattedDate}</p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="text-[11px] text-gray-400 font-semibold tracking-wider uppercase mb-1">
                {t('refundDetails.paymentMethod', 'Payment Method')}
              </p>
              <p className="font-bold text-gray-900 text-xs sm:text-sm">{paymentMethod}</p>
            </div>
          </div>
          <div className="self-end sm:self-center">
            <RefundStatusBadge status={currentStatus} />
          </div>
        </div>

        {/* Responsive Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6 items-start">
          {/* Main Column */}
          <div className="space-y-6">
            {/* 1. Order & Customer Info Card */}
            <RefundInfoCard
              orderIdCode={orderIdCode}
              customerName={customerName}
              customerEmail={customerEmail}
              customerPhone={customerPhone}
            />

            {/* 2. Financial Summary Card */}
            <RefundFinancialSummaryCard
              totalRefundAmount={refund.totalRefundAmount || 0}
              reason={itemReason}
            />

            {/* 3. Products Requested for Refund Card */}
            <RefundProductsCard items={itemsList} />
          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">
            {/* 1. Evidence Photos Swiper or Reason Statement */}
            <RefundImagesSwiper
              imageUrls={refundImages}
              reason={itemReason}
              customerName={customerName}
            />

            {/* 2. Review & Action Card */}
            <RefundReviewActionCard
              status={currentStatus}
              adminNotes={adminNoteInput}
              onNotesChange={setAdminNoteInput}
              onSaveNotes={handleSaveNotes}
              isSavingNotes={notesMutation.isPending}
              onOpenApproveModal={() => setShowApproveModal(true)}
              onOpenRejectModal={() => setShowRejectModal(true)}
            />
          </div>
        </div>
      </div>

      {/* ── Approve Refund Confirmation Modal ─────────────────── */}
      <ApproveRefundModal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        onConfirm={handleConfirmApprove}
        isLoading={approveMutation.isPending}
        refundIdCode={refundIdCode}
        customerName={customerName}
        totalRefundAmount={refund.totalRefundAmount || 0}
      />

      {/* ── Reject Refund Confirmation Modal ──────────────────── */}
      <RejectRefundModal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setRejectReasonError(false);
        }}
        onConfirm={handleConfirmReject}
        isLoading={rejectMutation.isPending}
        reasonInput={rejectReasonInput}
        onReasonInputChange={(val) => {
          setRejectReasonInput(val);
          if (rejectReasonError && val.trim()) {
            setRejectReasonError(false);
          }
        }}
        reasonError={rejectReasonError}
        refundIdCode={refundIdCode}
        customerName={customerName}
      />
    </div>
  );
}
