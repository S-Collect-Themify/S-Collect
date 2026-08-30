import React from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Loader2 } from 'lucide-react';

interface ApproveRefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  refundIdCode: string;
  customerName: string;
  totalRefundAmount: number;
}

export const ApproveRefundModal: React.FC<ApproveRefundModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  refundIdCode,
  customerName,
  totalRefundAmount,
}) => {
  const { t, i18n } = useTranslation();
  const currencySymbol = i18n.language === 'ar' ? '﷼' : 'SAR';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl relative">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <Check size={24} className="stroke-3" />
          </div>
        </div>
        <h2 className="text-lg font-bold text-gray-900 text-center mb-2">
          {t('refundDetails.approveRefundModalTitle', 'Approve Refund Request')}
        </h2>
        <p className="text-xs text-gray-500 text-center leading-relaxed mb-5">
          {t('refundDetails.approveRefundModalMessage', {
            defaultValue: `Are you sure you want to approve this refund request? Once approved, the refund status will change to Approved and the refund amount of ${(totalRefundAmount || 0).toFixed(2)} ${currencySymbol} will be processed.`,
            amount: `${(totalRefundAmount || 0).toFixed(2)} ${currencySymbol}`,
          })}
        </p>

        <div className="bg-gray-50 border border-gray-100 rounded-xl p-3.5 space-y-2 mb-6 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-gray-500">{t('refundDetails.refundId', 'Refund ID')}</span>
            <span className="font-semibold text-gray-900 font-mono">{refundIdCode}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">{t('refundDetails.customerLabel', 'Customer')}</span>
            <span className="font-semibold text-gray-900">{customerName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">{t('refundDetails.refundAmountLabel', 'Refund Amount')}</span>
            <span className="font-semibold text-gray-900">
              {(totalRefundAmount || 0).toFixed(2)} {currencySymbol}
            </span>
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
            disabled={isLoading}
            className="py-2.5 px-4 rounded-xl bg-gray-950 text-white text-xs font-semibold hover:bg-gray-800 transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-60"
          >
            {isLoading && <Loader2 className="animate-spin" size={14} />}
            <span>{t('refundDetails.approveRefund', 'Approve Refund')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
