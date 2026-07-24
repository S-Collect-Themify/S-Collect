import { useParams, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import ApproveReturnModal from '../components/returns/ApproveReturnModal';
import RejectReturnModal from '../components/returns/RejectReturnModal';
import { useReturnRequestDetails } from '../features/Returns/hooks/useReturnRequestDetails';
import { ReturnSummaryCard } from '../features/Returns/components/ReturnSummaryCard';
import { ReturnProductInfoCard } from '../features/Returns/components/ReturnProductInfoCard';
import { ReturnReasonCard } from '../features/Returns/components/ReturnReasonCard';
import { ReturnCustomerInfoCard } from '../features/Returns/components/ReturnCustomerInfoCard';
import { ReturnTimelineCard } from '../features/Returns/components/ReturnTimelineCard';
import { ReturnActionsBar } from '../features/Returns/components/ReturnActionsBar';

export default function ReturnRequestDetailsPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();

  const decodedId = id ? decodeURIComponent(id) : '';
  const rawId = decodedId.startsWith('#RET-') ? decodedId.replace('#RET-', '') : decodedId;

  const {
    item,
    isLoading,
    internalNote,
    setInternalNote,
    showApproveModal,
    setShowApproveModal,
    showRejectModal,
    setShowRejectModal,
    handleApprove,
    handleReject,
  } = useReturnRequestDetails(rawId, decodedId);

  if (isLoading || !item) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <>
      {/* Title & Breadcrumbs */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="sidebar-page-container-header bg-white"
      >
        <h1 className="heading-page-title font-bold text-gray-900">
          {t('returnsPage.title', { defaultValue: 'Return Requests' })}
        </h1>
        <div className="flex items-center flex-wrap gap-1.5 text-xs sm:text-sm text-gray-500 mt-1.5">
          <Link to="/returns" className="hover:text-gray-900 transition-colors font-medium">
            {t('returnsPage.title', { defaultValue: 'Return Requests' })}
          </Link>
          <ChevronRight size={16} className="text-gray-400 shrink-0" />
          <span className="text-gray-800 font-semibold">
            {t('returnsPage.breadcrumb', { defaultValue: 'Return Request Details' })} {item.id}
          </span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="sidebar-page-container min-h-screen"
      >
        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2 Cols on Desktop) */}
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Card 1: Return Summary */}
            <ReturnSummaryCard item={item} />

            {/* Card 2: Product Information */}
            <ReturnProductInfoCard item={item} />

            {/* Card 3: Return Reason, Images & Internal Notes */}
            <ReturnReasonCard
              item={item}
              internalNote={internalNote}
              setInternalNote={setInternalNote}
            />
          </motion.div>

          {/* Right Column (1 Col on Desktop) */}
          <motion.div
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="space-y-6"
          >
            {/* Card 1: Customer Information */}
            <ReturnCustomerInfoCard item={item} />

            {/* Card 2: Return Timeline */}
            <ReturnTimelineCard item={item} />

            {/* Action Buttons (Desktop & Sticky Mobile) */}
            <ReturnActionsBar
              onReject={() => setShowRejectModal(true)}
              onApprove={() => setShowApproveModal(true)}
            />
          </motion.div>
        </div>

        {/* Modals */}
        <ApproveReturnModal
          isOpen={showApproveModal}
          onClose={() => setShowApproveModal(false)}
          onConfirm={handleApprove}
          item={item}
        />
        <RejectReturnModal
          isOpen={showRejectModal}
          onClose={() => setShowRejectModal(false)}
          onConfirm={handleReject}
          item={item}
        />
      </motion.div>
    </>
  );
}
