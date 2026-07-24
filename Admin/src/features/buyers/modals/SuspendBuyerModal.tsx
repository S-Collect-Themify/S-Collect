import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SuspendBuyerModalProps {
  isOpen: boolean;
  buyerName: string;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}

export default function SuspendBuyerModal({
  isOpen,
  buyerName,
  onConfirm,
  onCancel,
}: SuspendBuyerModalProps) {
  const { t } = useTranslation();
  const [reason, setReason] = useState('');
  const [touched, setTouched] = useState(false);

  const hasError = touched && reason.trim() === '';

  const handleConfirm = () => {
    setTouched(true);
    if (!reason.trim()) return;
    onConfirm(reason.trim());
    setReason('');
    setTouched(false);
  };

  const handleCancel = () => {
    setReason('');
    setTouched(false);
    onCancel();
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-9999 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={handleCancel}
          />

          {/* Modal */}
          <motion.div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col"
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          >
            {/* Close button */}
            <button
              onClick={handleCancel}
              className="absolute top-4 end-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            {/* Icon */}
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle size={24} className="text-red-500" strokeWidth={2} />
            </div>

            <h2 className="text-lg font-bold text-gray-900 text-center mb-3">
              {t('buyers.modals.suspendTitle', 'Suspend Buyer')}
            </h2>

            {/* Buyer name highlight (red box) */}
            <div className="w-full bg-red-50/80 border border-red-100/60 rounded-xl p-3 mb-4 text-center">
              <p className="text-sm font-semibold text-red-600">
                {t('buyers.modals.suspendingName', {
                  name: buyerName,
                  defaultValue: `Suspending ${buyerName}`,
                })}
              </p>
            </div>

            {/* Reason textarea */}
            <div className="mb-6">
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                {t('buyers.modals.reasonLabel', 'Reason for Suspension')}
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                onBlur={() => setTouched(true)}
                placeholder={t('buyers.modals.reasonPlaceholder', 'Provide detailed reason...')}
                rows={4}
                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 resize-none outline-none transition-colors ${
                  hasError
                    ? 'border-red-400 focus:border-red-500 bg-red-50/30'
                    : 'border-gray-200 focus:border-gray-400 bg-white'
                }`}
              />
              {hasError && (
                <p className="text-xs text-red-500 mt-1">
                  {t('vendors.modals.reasonRequired', 'Reason is required.')}
                </p>
              )}
            </div>

            {/* Vertical Stacked Buttons */}
            <div className="flex flex-col gap-2.5 w-full">
              <button
                onClick={handleConfirm}
                className="w-full py-3 px-4 text-sm font-semibold text-white rounded-xl bg-red-600 hover:bg-red-700 transition-colors cursor-pointer"
              >
                {t('buyers.modals.suspendBtn', 'Suspend Buyer')}
              </button>
              <button
                onClick={handleCancel}
                className="w-full py-3 px-4 text-sm font-semibold text-gray-800 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
              >
                {t('buyers.modals.cancel', 'Cancel')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
