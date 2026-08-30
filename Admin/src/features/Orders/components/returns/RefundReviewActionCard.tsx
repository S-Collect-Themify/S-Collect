import React from 'react';
import { useTranslation } from 'react-i18next';
import { Check, X, Save } from 'lucide-react';

interface RefundReviewActionCardProps {
  status: string;
  adminNotes: string;
  onNotesChange: (val: string) => void;
  onSaveNotes: () => void;
  isSavingNotes: boolean;
  onOpenApproveModal: () => void;
  onOpenRejectModal: () => void;
}

export const RefundReviewActionCard: React.FC<RefundReviewActionCardProps> = ({
  status,
  adminNotes,
  onNotesChange,
  onSaveNotes,
  isSavingNotes,
  onOpenApproveModal,
  onOpenRejectModal,
}) => {
  const { t } = useTranslation();
  const upper = (status || '').toUpperCase();
  const isPending = upper === 'PENDING' || upper === 'PENDING_REVIEW';

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 p-4 sm:p-5 shadow-2xs space-y-4">
      <h2 className="font-bold text-gray-900 text-sm sm:text-base">
        {t('refundDetails.reviewAction', 'Review & Action')}
      </h2>

      <div className="space-y-3">
        {/* Internal Notes Editor */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs text-gray-500 font-medium">
              {t('refundDetails.internalNotes', 'Internal Notes')}
            </label>
            <button
              type="button"
              onClick={onSaveNotes}
              disabled={isSavingNotes}
              className="text-[11px] text-blue-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <Save size={12} />
              <span>{isSavingNotes ? t('refundDetails.saving', 'Saving...') : t('refundDetails.saveNotes', 'Save Notes')}</span>
            </button>
          </div>
          <textarea
            value={adminNotes}
            onChange={(e) => onNotesChange(e.target.value)}
            aria-label="Internal admin notes"
            placeholder={t('refundDetails.notesPlaceholder', 'Add a private note for internal teams...')}
            className="w-full border border-gray-200 rounded-xl p-3 text-xs bg-white h-24 focus:outline-none focus:border-gray-900 placeholder-gray-400 resize-none transition-colors"
          />
        </div>

        {/* Action Buttons or Decision Status */}
        {isPending ? (
          <div className="flex flex-col gap-2.5 pt-1">
            <button
              type="button"
              onClick={onOpenApproveModal}
              className="w-full bg-gray-950 text-white hover:bg-gray-800 font-semibold py-2.5 sm:py-3 rounded-xl shadow-xs flex items-center justify-center gap-2 text-xs cursor-pointer transition-all active:scale-98"
            >
              <Check size={15} />
              <span>{t('refundDetails.approveRefund', 'Approve Refund')}</span>
            </button>
            <button
              type="button"
              onClick={onOpenRejectModal}
              className="w-full bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 font-semibold py-2.5 sm:py-3 rounded-xl shadow-xs flex items-center justify-center gap-2 text-xs cursor-pointer transition-all active:scale-98"
            >
              <X size={15} />
              <span>{t('refundDetails.rejectRefund', 'Reject Refund')}</span>
            </button>
          </div>
        ) : (
          <div
            className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 ${
              upper === 'APPROVED' || upper === 'COMPLETED'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-rose-50 border-rose-200 text-rose-700'
            }`}
          >
            <span>
              {t('refundDetails.decisionRecorded', {
                defaultValue: `Decision Recorded: Refund ${status}`,
                status: t(`ordersPage.statuses.${status}`, status),
              })}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
