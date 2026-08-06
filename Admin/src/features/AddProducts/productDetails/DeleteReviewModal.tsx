import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Loader2 } from 'lucide-react';

export interface DeleteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export const DeleteReviewModal: React.FC<DeleteReviewModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isDeleting = false,
}) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl border border-gray-100 relative">
        <div className="flex flex-col items-center">
          {/* Danger Alert Icon */}
          <div className="size-14 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4 border border-red-100">
            <AlertTriangle size={26} />
          </div>

          {/* Modal Title */}
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {t('productDetails.reviews.deleteModalTitle', {
              defaultValue: isAr ? 'تأكيد حذف التقييم' : 'Confirm Delete Review',
            })}
          </h3>

          {/* Modal Message */}
          <p className="text-xs text-gray-500 leading-relaxed mb-6 max-w-xs">
            {t('productDetails.reviews.deleteModalMessage', {
              defaultValue: isAr
                ? 'هل أنت تأكد من حذف هذا التقييم؟ لا يمكن التراجع عن هذا الإجراء.'
                : 'Are you sure you want to delete this review? This action cannot be undone.',
            })}
          </p>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 w-full">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 text-xs font-semibold py-2.5 px-4 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              {t('common.cancel', { defaultValue: isAr ? 'إلغاء' : 'Cancel' })}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
            >
              {isDeleting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>{isAr ? 'جاري الحذف...' : 'Deleting...'}</span>
                </>
              ) : (
                <span>
                  {t('productDetails.reviews.deleteBtn', {
                    defaultValue: isAr ? 'حذف التقييم' : 'Delete Review',
                  })}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default DeleteReviewModal;
