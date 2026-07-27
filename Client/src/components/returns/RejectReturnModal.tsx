import { AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import type { ReturnItem } from '../../features/Returns/types';
import { useTranslation } from 'react-i18next';

interface RejectReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  item: ReturnItem;
}

export default function RejectReturnModal({
  isOpen,
  onClose,
  onConfirm,
  item,
}: RejectReturnModalProps) {
  const { t } = useTranslation();
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl animate-fade-in-up relative">
        {/* Warning Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-600">
            <AlertTriangle size={24} />
          </div>
        </div>

        {/* Header */}
        <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
          {t('returnsPage.rejectModalTitle', {
            defaultValue: 'Reject Return Request',
          })}
        </h3>
        <p className="text-xs text-gray-500 text-center leading-relaxed mb-4">
          {t('returnsPage.rejectModalMessage', {
            defaultValue:
              'Please provide a reason for rejecting this return request.',
          })}
        </p>

        {/* Reason Input */}
        <div className="mb-4">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t('returnsPage.rejectReasonPlaceholder', {
              defaultValue: 'Enter rejection reason...',
            })}
            className="w-full h-24 p-3 border border-gray-300 rounded-xl text-xs outline-none focus:border-red-500 transition-colors resize-none"
          />
        </div>

        {/* Details Box */}
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-3.5 space-y-2 mb-6 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-gray-500">
              {t('returnsPage.returnId', { defaultValue: 'Return ID' })}
            </span>
            <span className="font-semibold text-gray-900 font-mono">
              {item.id}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">
              {t('returnsPage.customer', { defaultValue: 'Customer' })}
            </span>
            <span className="font-semibold text-gray-900">
              {item.customerName}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl border border-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
          >
            {t('returnsPage.cancel', { defaultValue: 'Cancel' })}
          </button>
          <button
            type="button"
            disabled={!reason.trim()}
            onClick={() => onConfirm(reason)}
            className="py-2.5 px-4 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {t('returnsPage.rejectReturn', { defaultValue: 'Reject Return' })}
          </button>
        </div>
      </div>
    </div>
  );
}
