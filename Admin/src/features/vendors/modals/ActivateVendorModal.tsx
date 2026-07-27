import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ActivateVendorModalProps {
  isOpen: boolean;
  vendorName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

export default function ActivateVendorModal({
  isOpen,
  vendorName,
  onConfirm,
  onCancel,
}: ActivateVendorModalProps) {
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
            {/* Icon */}
            <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mb-4">
              <CheckCircle size={28} className="text-green-600" strokeWidth={2} />
            </div>

            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t('vendors.modals.activateTitle', 'Activate Vendor')}
            </h2>

            {/* Vendor card */}
            <div className="w-full flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {getInitials(vendorName)}
              </div>
              <span className="text-sm font-semibold text-gray-800 text-start">
                {vendorName}
              </span>
            </div>

            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              {t('vendors.modals.activateMessage', { name: vendorName })}
            </p>

            <div className="flex items-center gap-3 w-full">
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {t('vendors.table.cancel', 'Cancel')}
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-white rounded-lg bg-green-700 hover:bg-green-800 transition-colors"
              >
                {t('vendors.modals.activateBtn', 'Activate Vendor')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
