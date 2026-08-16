import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SuspendBuyerModalProps {
  isOpen: boolean;
  buyerName: string;
  isPending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function SuspendBuyerModal({
  isOpen,
  buyerName,
  isPending,
  onConfirm,
  onCancel,
}: SuspendBuyerModalProps) {
  const { t } = useTranslation();

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
            onClick={isPending ? undefined : onCancel}
          />

          {/* Modal */}
          <motion.div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col items-center text-center"
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          >
            {/* Close button */}
            <button
              onClick={onCancel}
              disabled={isPending}
              className="absolute top-4 end-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer disabled:opacity-50"
            >
              <X size={18} />
            </button>

            {/* Icon */}
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-3">
              <AlertTriangle size={24} className="text-red-500" strokeWidth={2} />
            </div>

            <h2 className="text-lg font-bold text-gray-900 mb-3">
              {t('buyers.modals.suspendTitle', 'Suspend Buyer')}
            </h2>

            {/* Buyer name highlight */}
            <div className="w-full bg-red-50/80 border border-red-100/60 rounded-lg p-3 mb-3">
              <p className="text-sm font-semibold text-red-600">
                {t('buyers.modals.suspendingName', {
                  name: buyerName,
                  defaultValue: `Suspending ${buyerName}`,
                })}
              </p>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed mb-6">
              {t(
                'buyers.modals.suspendMessage',
                'Suspending this buyer will restrict their access and prevent them from placing orders.'
              )}
            </p>

            {/* Vertical Stacked Buttons */}
            <div className="flex flex-col gap-2.5 w-full">
              <button
                onClick={onConfirm}
                disabled={isPending}
                className="w-full py-3 px-4 text-sm font-semibold text-white rounded-lg bg-red-600 hover:bg-red-700 transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isPending && <Loader2 size={16} className="animate-spin" />}
                {t('buyers.modals.suspendBtn', 'Suspend Buyer')}
              </button>
              <button
                onClick={onCancel}
                disabled={isPending}
                className="w-full py-3 px-4 text-sm font-semibold text-gray-800 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
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

