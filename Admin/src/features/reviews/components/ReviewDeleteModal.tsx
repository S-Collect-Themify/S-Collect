import { X, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import type { ReviewItem } from '../types';

interface ReviewDeleteModalProps {
  isOpen: boolean;
  review: ReviewItem | null;
  onClose: () => void;
  onConfirm: () => void;
}

export const ReviewDeleteModal = ({
  isOpen,
  review,
  onClose,
  onConfirm,
}: ReviewDeleteModalProps) => {
  const { t } = useTranslation();

  if (!review) return null;

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

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
            className="relative w-full max-w-sm sm:max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl z-10 text-center border border-gray-100"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 sm:top-5 sm:right-5 p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors rtl:right-auto rtl:left-4 sm:rtl:left-5 cursor-pointer"
            >
              <X size={18} />
            </button>

            {/* Alert Warning Icon */}
            <div className="w-14 h-14 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={26} className="stroke-[2]" />
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {t('reviewsListing.deleteModal.title')}
            </h3>

            {/* Description */}
            <p className="text-sm text-gray-500 max-w-xs sm:max-w-sm mx-auto mb-5 leading-relaxed">
              {t('reviewsListing.deleteModal.message', {
                reviewId: review.reviewId,
                buyerName: review.buyerName,
              })}
            </p>

            {/* Audit Log Warning Notice Box */}
            <div className="bg-red-50 text-red-600 text-xs sm:text-sm font-medium p-3.5 rounded-2xl mb-6 border border-red-100/70">
              {t('reviewsListing.deleteModal.auditWarning')}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:flex-1 py-3 px-5 border border-gray-200 rounded-lg cursor-pointer text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {t('reviewsListing.deleteModal.cancel')}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="w-full sm:flex-1 py-3 px-5 bg-[#C5221F] hover:bg-[#A81B18] text-white cursor-pointer rounded-lg text-sm font-semibold transition-colors shadow-sm"
              >
                {t('reviewsListing.deleteModal.confirm')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
