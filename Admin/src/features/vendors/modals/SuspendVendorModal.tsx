import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SuspendVendorModalProps {
  isOpen: boolean;
  vendorName: string;
  onConfirm: (reason: string, notify: boolean) => void;
  onCancel: () => void;
}

export default function SuspendVendorModal({
  isOpen,
  vendorName,
  onConfirm,
  onCancel,
}: SuspendVendorModalProps) {
  const { t } = useTranslation();
  const [reason, setReason] = useState('');
  const [notify, setNotify] = useState(true);
  const [touched, setTouched] = useState(false);

  const hasError = touched && reason.trim() === '';

  const handleConfirm = () => {
    setTouched(true);
    if (!reason.trim()) return;
    onConfirm(reason.trim(), notify);
    setReason('');
    setNotify(true);
    setTouched(false);
  };

  const handleCancel = () => {
    setReason('');
    setNotify(true);
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
              <div className="w-11 h-11 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                <AlertTriangle size={22} className="text-amber-500" strokeWidth={2} />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900 leading-tight">
                  {t('vendors.modals.suspendTitle', 'Suspend Vendor')}
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">{vendorName}</p>
              </div>
            </div>

            {/* Reason textarea */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('vendors.modals.reasonLabel', 'Reason for suspension')}{' '}
                <span className="text-red-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                onBlur={() => setTouched(true)}
                placeholder={t('vendors.modals.reasonPlaceholder', 'Reason for suspension...')}
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

            {/* Send notification toggle */}
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm text-gray-700">
                {t('vendors.modals.sendNotification', 'Send notification to vendor')}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={notify}
                dir="ltr"
                onClick={() => setNotify((v) => !v)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none cursor-pointer ${
                  notify ? 'bg-green-500' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
                    notify ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
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
                {t('vendors.modals.suspendBtn', 'Suspend Vendor')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
