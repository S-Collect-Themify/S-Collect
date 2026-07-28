import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface RejectVendorModalProps {
  isOpen: boolean;
  vendorName: string;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}

export default function RejectVendorModal({
  isOpen,
  vendorName,
  onConfirm,
  onCancel,
}: RejectVendorModalProps) {
  const { t } = useTranslation();
  const [reason, setReason] = useState('');
  const [touched, setTouched] = useState(false);

  const hasError = touched && reason.trim() === '';

  const handleConfirm = () => {
    if (reason.trim() === '') {
      setTouched(true);
      return;
    }
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
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          >
            {/* Header row: icon + title + subtitle */}
            <div className="flex items-start gap-4 mb-5">
              <div className="w-11 h-11 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <AlertTriangle size={22} className="text-red-500" strokeWidth={2} />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900 leading-tight">
                  {t('vendors.modals.rejectTitle', 'Reject Vendor')}
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">{vendorName}</p>
              </div>
            </div>

            {/* Reason textarea */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('vendors.modals.rejectReasonLabel', 'Reason for rejection')}{' '}
                <span className="text-red-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                onBlur={() => setTouched(true)}
                placeholder={t('vendors.modals.rejectReasonPlaceholder', 'Reason for rejection...')}
                rows={4}
                className={`w-full rounded-lg border px-3 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 resize-none outline-none transition-colors ${
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

            {/* Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {t('vendors.table.cancel', 'Cancel')}
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-white rounded-lg bg-red-600 hover:bg-red-700 transition-colors"
              >
                {t('vendors.modals.rejectBtn', 'Reject Vendor')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
