import { X, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import type { ProductItem } from '../types';

interface ProductDisableModalProps {
  isOpen: boolean;
  product: ProductItem | null;
  onClose: () => void;
  onConfirm: () => void;
}

export const ProductDisableModal = ({
  isOpen,
  product,
  onClose,
  onConfirm,
}: ProductDisableModalProps) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  if (!product) return null;

  const productName = isAr && product.nameAr ? product.nameAr : product.name;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
          />

          {/* Modal Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
            className="relative w-full max-w-sm sm:max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl z-10 text-center border border-gray-100"
          >
            {/* Close 'X' Button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 sm:top-5 sm:right-5 p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors rtl:right-auto rtl:left-4 sm:rtl:left-5"
            >
              <X size={18} />
            </button>

            {/* Alert Warning Icon */}
            <div className="w-14 h-14 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={28} className="stroke-[2]" />
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {t('productsListing.disableModal.title')}
            </h3>

            {/* Description */}
            <p className="text-sm text-gray-500 max-w-xs mx-auto mb-7 leading-relaxed">
              {t('productsListing.disableModal.message', { name: productName })}
            </p>

            {/* Buttons */}
            <div className="flex flex-col-reverse sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:flex-1 py-3 px-5 border border-gray-200 rounded-lg cursor-pointer text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {t('productsListing.disableModal.cancel')}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="w-full sm:flex-1 py-3 px-5 bg-[#C5221F] hover:bg-[#A81B18] text-white cursor-pointer rounded-lg text-sm font-semibold transition-colors shadow-sm"
              >
                {t('productsListing.disableModal.confirm')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
