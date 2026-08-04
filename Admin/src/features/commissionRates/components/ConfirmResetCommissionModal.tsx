import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw } from 'lucide-react';

interface ConfirmResetCommissionModalProps {
  isOpen: boolean;
  name?: string;
  type?: 'vendor' | 'category';
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

export default function ConfirmResetCommissionModal({
  isOpen,
  name,
  type = 'vendor',
  onConfirm,
  onCancel,
}: ConfirmResetCommissionModalProps) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const isCategory = type === 'category';
  const typeLabel = isCategory
    ? t('commissionRates.category', 'Category')
    : t('commissionRates.vendor', 'Vendor');

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

          {/* Modal Card */}
          <motion.div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col items-center text-center"
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          >
            {/* Reset Icon Circle */}
            <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mb-4">
              <RotateCcw size={26} className="text-amber-600" strokeWidth={2} />
            </div>

            <h2 className="text-lg font-bold text-gray-900 mb-2">
              {t('commissionRates.confirmResetTitle', 'Reset Commission Rate')}
            </h2>

            {/* Target Item Pill */}
            {name && (
              <div className="w-full flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 mb-4">
                <div className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {getInitials(name)}
                </div>
                <div className="flex flex-col text-start min-w-0">
                  <span className="text-xs text-gray-400 font-medium">{typeLabel}</span>
                  <span className="text-sm font-semibold text-gray-800 truncate">
                    {name}
                  </span>
                </div>
              </div>
            )}

            <p className="text-xs text-gray-500 mb-6 leading-relaxed">
              {t(
                'commissionRates.confirmResetMessage',
                {
                  name: name || '',
                  defaultValue: `Are you sure you want to reset the custom commission rate for "${name || 'this item'}" to the platform default rate?`,
                }
              )}
            </p>

            <div className="flex items-center gap-3 w-full">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-2.5 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                {t('commissionRates.cancel', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="flex-1 px-4 py-2.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors shadow-2xs cursor-pointer"
              >
                {t('commissionRates.resetToDefault', 'Reset to Default')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
