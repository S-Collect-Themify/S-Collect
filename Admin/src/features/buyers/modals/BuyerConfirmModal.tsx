import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface BuyerConfirmModalProps {
  isOpen: boolean;
  type: 'activate' | 'suspend';
  count: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function BuyerConfirmModal({
  isOpen,
  type,
  count,
  onConfirm,
  onCancel,
}: BuyerConfirmModalProps) {
  const { t } = useTranslation();

  const isActivate = type === 'activate';

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
            onClick={onCancel}
          />

          {/* Modal */}
          <motion.div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col items-center text-center"
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          >
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${
                isActivate ? 'bg-green-50' : 'bg-red-50'
              }`}
            >
              {isActivate ? (
                <CheckCircle size={28} className="text-green-600" strokeWidth={2} />
              ) : (
                <AlertTriangle size={28} className="text-red-500" strokeWidth={2} />
              )}
            </div>

            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              {isActivate
                ? t('buyers.modals.bulkActivateTitle', 'Activate Buyers')
                : t('buyers.modals.bulkSuspendTitle', 'Suspend Buyers')}
            </h2>

            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              {isActivate
                ? t('buyers.modals.bulkActivateMsg', {
                    count,
                    defaultValue: `Are you sure you want to activate ${count} selected buyer(s)?`,
                  })
                : t('buyers.modals.bulkSuspendMsg', {
                    count,
                    defaultValue: `Are you sure you want to suspend ${count} selected buyer(s)?`,
                  })}
            </p>

            <div className="flex items-center gap-3 w-full">
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                {t('buyers.modals.cancel', 'Cancel')}
              </button>
              <button
                onClick={onConfirm}
                className={`flex-1 px-4 py-2.5 text-sm font-semibold text-white rounded-xl transition-colors ${
                  isActivate
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {t('buyers.modals.confirm', 'Confirm')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
