import { Check } from 'lucide-react';
import type { ReturnItem } from '../../features/Returns/types';
import { useTranslation } from 'react-i18next';

interface ApproveReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  item: ReturnItem;
}

export default function ApproveReturnModal({
  isOpen,
  onClose,
  onConfirm,
  item,
}: ApproveReturnModalProps) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl animate-fade-in-up relative">
        {/* Success Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <Check size={24} className="stroke-[3]" />
          </div>
        </div>

        {/* Header */}
        <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
          {t('returnsPage.approveModalTitle', {
            defaultValue: 'Approve Return Request',
          })}
        </h3>
        <p className="text-xs text-gray-500 text-center leading-relaxed mb-5">
          {t('returnsPage.approveModalMessage', {
            defaultValue:
              'Are you sure you want to approve this return request? Once approved, the return status will change to Approved and the request will be forwarded to the admin for refund processing.',
          })}
        </p>

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
              {t('returnsPage.product', { defaultValue: 'Product' })}
            </span>
            <span className="font-semibold text-gray-900 truncate max-w-[200px]">
              {item.productTitle}
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
            onClick={onConfirm}
            className="py-2.5 px-4 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors cursor-pointer"
          >
            {t('returnsPage.approveReturn', { defaultValue: 'Approve Return' })}
          </button>
        </div>
      </div>
    </div>
  );
}
