import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { X, Tag, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface BulkDiscountFormData {
  discountType: 'PERCENT' | 'FIXED';
  discountValue: number;
  expiryDate?: string;
}

interface BulkDiscountModalProps {
  isOpen: boolean;
  selectedCount: number;
  onClose: () => void;
  onSubmit: (data: {
    discountType: 'PERCENT' | 'FIXED';
    discountValue: number;
    discountEndsAt?: string;
  }) => void;
  isPending: boolean;
  title?: string;
  subtitle?: string;
}

export const BulkDiscountModal = ({
  isOpen,
  selectedCount,
  onClose,
  onSubmit,
  isPending,
  title,
  subtitle,
}: BulkDiscountModalProps) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<BulkDiscountFormData>({
    defaultValues: {
      discountType: 'PERCENT',
      discountValue: undefined,
      expiryDate: '',
    },
  });

  const discountType = watch('discountType');

  const handleFormSubmit = (data: BulkDiscountFormData) => {
    let discountEndsAt: string | undefined = undefined;
    if (data.expiryDate && data.expiryDate.trim()) {
      try {
        const dateObj = new Date(`${data.expiryDate.trim()}T23:59:59.000Z`);
        discountEndsAt = !isNaN(dateObj.getTime())
          ? dateObj.toISOString()
          : new Date(data.expiryDate).toISOString();
      } catch {
        discountEndsAt = undefined;
      }
    }

    onSubmit({
      discountType: data.discountType,
      discountValue: Number(data.discountValue),
      discountEndsAt,
    });
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs"
        />

        {/* Modal Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
          className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl z-10 border border-gray-100 text-right rtl:text-right ltr:text-left"
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-4 right-4 sm:top-5 sm:right-5 p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors rtl:right-auto rtl:left-4 sm:rtl:left-5 cursor-pointer"
            aria-label={t('common.close', 'Close')}
          >
            <X size={18} />
          </button>

          {/* Header Icon */}
          <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center mb-4">
            <Tag size={22} />
          </div>

          {/* Title & Subtitle */}
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            {title ??
              (isAr
                ? 'خصم جماعي'
                : t('managementTable.bulkDiscount', 'Bulk Discount'))}
          </h3>
          <p className="text-xs text-gray-500 mb-6">
            {subtitle ??
              (isAr
                ? `تطبيق خصم على ${selectedCount} من المنتجات المحددة`
                : t(
                    'managementTable.bulkDiscountSubtitle',
                    `Apply discount on ${selectedCount} selected products`,
                    { count: selectedCount }
                  ))}
          </p>

          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            {/* Discount Type DDL */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                {isAr
                  ? 'نوع الخصم *'
                  : t('managementTable.discountType', 'Discount Type *')}
              </label>
              <select
                {...register('discountType', { required: true })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-900 cursor-pointer"
              >
                <option value="PERCENT">
                  {isAr
                    ? 'نسبة (%)'
                    : t('managementTable.percentage', 'Percentage (%)')}
                </option>
                <option value="FIXED">
                  {isAr
                    ? 'ثابت (مبلغ)'
                    : t('managementTable.fixedAmount', 'Fixed Amount')}
                </option>
              </select>
            </div>

            {/* Discount Value */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                {discountType === 'PERCENT'
                  ? isAr
                    ? 'نسبة الخصم *'
                    : t(
                        'managementTable.discountPercentage',
                        'Discount Percentage *'
                      )
                  : isAr
                  ? 'قيمة الخصم *'
                  : t('managementTable.discountValue', 'Discount Amount *')}
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  placeholder={
                    discountType === 'PERCENT'
                      ? '20'
                      : isAr
                      ? '50'
                      : '50'
                  }
                  {...register('discountValue', {
                    required: isAr
                      ? 'هذا الحقل مطلوب'
                      : t(
                          'managementTable.discountValueRequired',
                          'Discount value is required'
                        ),
                    min: {
                      value: 0.01,
                      message: isAr
                        ? 'يجب أن تكون القيمة أكبر من 0'
                        : t(
                            'managementTable.discountValueMin',
                            'Value must be greater than 0'
                          ),
                    },
                  })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 pr-12 text-sm text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-900 rtl:pr-3.5 rtl:pl-12"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500 pointer-events-none rtl:right-auto rtl:left-3.5">
                  {discountType === 'PERCENT' ? '%' : isAr ? 'ريال' : 'SAR'}
                </span>
              </div>
              {errors.discountValue && (
                <p className="mt-1 text-xs text-red-500 font-medium">
                  {errors.discountValue.message}
                </p>
              )}
            </div>

            {/* Expiry Date (Optional) */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                {isAr
                  ? 'تاريخ انتهاء الخصم (اختياري)'
                  : t(
                      'managementTable.expiryDateOptional',
                      'Discount Expiry Date (Optional)'
                    )}
              </label>
              <input
                type="date"
                {...register('expiryDate')}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-900 cursor-pointer"
              />
            </div>

            {/* Form Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row items-center gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={isPending}
                className="w-full sm:flex-1 py-3 px-5 border border-gray-200 rounded-xl cursor-pointer text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {isAr ? 'إلغاء' : t('managementTable.cancel', 'Cancel')}
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="w-full sm:flex-1 py-3 px-5 bg-black hover:bg-gray-800 text-white cursor-pointer rounded-xl text-sm font-semibold transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>
                      {isAr
                        ? 'جاري الحفظ...'
                        : t('managementTable.applying', 'Applying...')}
                    </span>
                  </>
                ) : (
                  <span>
                    {isAr
                      ? 'تطبيق الخصم'
                      : t(
                          'managementTable.applyBulkDiscount',
                          'Apply Discount'
                        )}
                  </span>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default BulkDiscountModal;
