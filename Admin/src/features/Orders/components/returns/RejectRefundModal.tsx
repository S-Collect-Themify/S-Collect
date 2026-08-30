import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface RejectRefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  reasonInput: string;
  onReasonInputChange: (val: string) => void;
  reasonError: boolean;
  refundIdCode: string;
  customerName: string;
}

export const RejectRefundModal: React.FC<RejectRefundModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  reasonInput,
  onReasonInputChange,
  reasonError,
  refundIdCode,
  customerName,
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl relative">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
            <AlertTriangle size={24} />
          </div>
        </div>
        <h2 className="text-lg font-bold text-gray-900 text-center mb-2">
          {t('refundDetails.rejectRefundModalTitle', 'Reject Refund Request')}
        </h2>
        <p className="text-xs text-gray-500 text-center leading-relaxed mb-4">
          {t('refundDetails.rejectRefundModalMessage', {
            defaultValue: `Are you sure you want to reject this refund request for customer ${customerName}?`,
            name: customerName,
          })}
        </p>

        <div className="mb-4">
          <label htmlFor="reject-reason-input" className="block text-xs font-semibold text-gray-700 mb-1 text-start">
            {t('refundDetails.rejectionReasonLabel', 'Rejection Reason')} <span className="text-rose-500">*</span>
          </label>
          <input
            id="reject-reason-input"
            type="text"
            required
            value={reasonInput}
            onChange={(e) => onReasonInputChange(e.target.value)}
            placeholder={t('refundDetails.rejectionReasonPlaceholder', 'e.g. Item shows normal wear, not a defect.')}
            className={`w-full p-2.5 border rounded-xl text-xs focus:outline-none transition-colors placeholder-gray-400 ${
              reasonError
                ? 'border-rose-500 bg-rose-50/40 text-rose-900 focus:border-rose-600'
                : 'border-gray-200 text-gray-900 focus:border-gray-900'
            }`}
          />
          {reasonError && (
            <p className="text-rose-500 text-[11px] font-medium mt-1 text-start">
              {t('refundDetails.rejectionReasonRequiredError', 'Rejection reason is required before rejecting this refund request.')}
            </p>
          )}
        </div>

        <div className="bg-gray-50 border border-gray-100 rounded-xl p-3.5 space-y-2 mb-6 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-gray-500">{t('refundDetails.refundId', 'Refund ID')}</span>
            <span className="font-semibold text-gray-900 font-mono">{refundIdCode}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">{t('refundDetails.customerLabel', 'Customer')}</span>
            <span className="font-semibold text-gray-900">{customerName}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl border border-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
          >
            {t('refundDetails.cancel', 'Cancel')}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading || !reasonInput.trim()}
            className="py-2.5 px-4 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            {isLoading && <Loader2 className="animate-spin" size={14} />}
            <span>{t('refundDetails.rejectRefund', 'Reject Refund')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
