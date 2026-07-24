import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Calendar, ChevronDown, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Toggle from '../../categories/components/Toggle';
import type { VoucherItem, VoucherType } from '../types';

export interface VoucherFormData {
  code: string;
  type: VoucherType;
  discountValue: string;
  minOrder: string;
  maxDiscount: string;
  expiryDate: string;
  maxUsage: string;
  limitOnePerCustomer: boolean;
}

interface VoucherFormProps {
  initialVoucher?: VoucherItem | null;
  onSubmit: (formData: VoucherFormData) => void;
  isSubmitting?: boolean;
}

export const VoucherForm = ({
  initialVoucher = null,
  onSubmit,
  isSubmitting = false,
}: VoucherFormProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    formState: { errors },
  } = useForm<VoucherFormData>({
    defaultValues: {
      code: initialVoucher?.code || '',
      type: initialVoucher?.type || 'Percentage',
      discountValue: initialVoucher?.discountValue
        ? String(initialVoucher.discountValue)
        : '',
      minOrder: initialVoucher?.minOrder?.replace('SAR ', '') || '',
      maxDiscount: initialVoucher?.maxDiscount?.replace('SAR ', '') || '',
      expiryDate: initialVoucher?.expiryDate || '',
      maxUsage: initialVoucher?.maxUsage ? String(initialVoucher.maxUsage) : '',
      limitOnePerCustomer: initialVoucher?.limitOnePerCustomer ?? true,
    },
  });

  useEffect(() => {
    if (initialVoucher) {
      reset({
        code: initialVoucher.code || '',
        type: initialVoucher.type || 'Percentage',
        discountValue: initialVoucher.discountValue
          ? String(initialVoucher.discountValue)
          : '',
        minOrder: initialVoucher.minOrder?.replace('SAR ', '') || '',
        maxDiscount: initialVoucher.maxDiscount?.replace('SAR ', '') || '',
        expiryDate: initialVoucher.expiryDate || '',
        maxUsage: initialVoucher.maxUsage
          ? String(initialVoucher.maxUsage)
          : '',
        limitOnePerCustomer: initialVoucher.limitOnePerCustomer ?? true,
      });
    }
  }, [initialVoucher, reset]);

  const selectedType = watch('type');

  const onFormSubmit = (data: VoucherFormData) => {
    onSubmit({
      ...data,
      code: data.code.trim(),
      discountValue: data.discountValue.trim(),
      minOrder: data.minOrder.trim(),
      maxDiscount: data.maxDiscount.trim(),
      expiryDate: data.expiryDate.trim(),
      maxUsage: data.maxUsage.trim(),
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 max-w-3xl shadow-xs">
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        {/* Voucher Code * (Mandatory) */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            {t('vouchersListing.form.voucherCode')}
          </label>
          <input
            type="text"
            placeholder={t('vouchersListing.form.voucherCodePlaceholder')}
            {...register('code', {
              required: t('vouchersListing.form.errors.voucherCodeRequired'),
            })}
            className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none transition-all ${
              errors.code
                ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/10'
                : 'border-gray-200 focus:ring-2 focus:ring-black/5 focus:border-gray-400'
            }`}
          />
          {errors.code && (
            <div className="flex items-center gap-1 text-xs text-red-500 mt-1">
              <AlertCircle size={13} />
              <span>{errors.code.message}</span>
            </div>
          )}
        </div>

        {/* Voucher Type * & Discount Value * Grid (Mandatory) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              {t('vouchersListing.form.voucherType')}
            </label>
            <div className="relative">
              <select
                {...register('type', { required: true })}
                className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 pr-9 text-sm text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-400 cursor-pointer rtl:pl-9 rtl:pr-4"
              >
                <option value="Percentage">
                  {t('vouchersListing.types.percentage')}
                </option>
                <option value="Amount">{t('vouchersListing.types.amount')}</option>
                <option value="Free Shipping">
                  {t('vouchersListing.types.freeShipping')}
                </option>
              </select>
              <ChevronDown
                size={16}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none rtl:right-auto rtl:left-3.5"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              {t('vouchersListing.form.discountValue')}
            </label>
            <input
              type="text"
              placeholder={t('vouchersListing.form.discountValuePlaceholder')}
              disabled={selectedType === 'Free Shipping'}
              {...register('discountValue', {
                required:
                  selectedType !== 'Free Shipping'
                    ? t('vouchersListing.form.errors.discountValueRequired')
                    : false,
                pattern: {
                  value: /^\d+(\.\d+)?$/,
                  message: t('vouchersListing.form.errors.discountValueInvalid'),
                },
              })}
              className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none transition-all ${
                errors.discountValue
                  ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/10'
                  : 'border-gray-200 focus:ring-2 focus:ring-black/5 focus:border-gray-400'
              } ${selectedType === 'Free Shipping' ? 'bg-gray-50 opacity-60 cursor-not-allowed' : ''}`}
            />
            {errors.discountValue && (
              <div className="flex items-center gap-1 text-xs text-red-500 mt-1">
                <AlertCircle size={13} />
                <span>{errors.discountValue.message}</span>
              </div>
            )}
          </div>
        </div>

        {/* Minimum Order Amount & Maximum Discount Grid (Optional) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              {t('vouchersListing.form.minOrderAmount')}
            </label>
            <input
              type="text"
              placeholder={t('vouchersListing.form.minOrderAmountPlaceholder')}
              {...register('minOrder', {
                pattern: {
                  value: /^\d+(\.\d+)?$/,
                  message: t('vouchersListing.form.errors.minOrderInvalid'),
                },
              })}
              className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none transition-all ${
                errors.minOrder
                  ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/10'
                  : 'border-gray-200 focus:ring-2 focus:ring-black/5 focus:border-gray-400'
              }`}
            />
            {errors.minOrder && (
              <div className="flex items-center gap-1 text-xs text-red-500 mt-1">
                <AlertCircle size={13} />
                <span>{errors.minOrder.message}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              {t('vouchersListing.form.maxDiscountAmount')}
            </label>
            <input
              type="text"
              placeholder={t('vouchersListing.form.maxDiscountAmountPlaceholder')}
              {...register('maxDiscount', {
                pattern: {
                  value: /^\d+(\.\d+)?$/,
                  message: t('vouchersListing.form.errors.maxDiscountInvalid'),
                },
              })}
              className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none transition-all ${
                errors.maxDiscount
                  ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/10'
                  : 'border-gray-200 focus:ring-2 focus:ring-black/5 focus:border-gray-400'
              }`}
            />
            {errors.maxDiscount && (
              <div className="flex items-center gap-1 text-xs text-red-500 mt-1">
                <AlertCircle size={13} />
                <span>{errors.maxDiscount.message}</span>
              </div>
            )}
          </div>
        </div>

        {/* Expiry Date & Maximum Usage Count Grid (Optional) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              {t('vouchersListing.form.expiryDate')}
            </label>
            <div className="relative">
              <input
                type="date"
                placeholder={t('vouchersListing.form.expiryDatePlaceholder')}
                {...register('expiryDate', {
                  required: t('vouchersListing.form.errors.expiryDateRequired'),
                })}
                className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none transition-all ${
                  errors.expiryDate
                    ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/10'
                    : 'border-gray-200 focus:ring-2 focus:ring-black/5 focus:border-gray-400'
                }`}
              />
              <Calendar
                size={16}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none rtl:right-auto rtl:left-3.5 hidden sm:block"
              />
            </div>
            {errors.expiryDate && (
              <div className="flex items-center gap-1 text-xs text-red-500 mt-1">
                <AlertCircle size={13} />
                <span>{errors.expiryDate.message}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              {t('vouchersListing.form.maxUsageCount')}
            </label>
            <input
              type="text"
              placeholder={t('vouchersListing.form.maxUsageCountPlaceholder')}
              {...register('maxUsage', {
                pattern: {
                  value: /^[1-9]\d*$/,
                  message: t('vouchersListing.form.errors.maxUsageInvalid'),
                },
              })}
              className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none transition-all ${
                errors.maxUsage
                  ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/10'
                  : 'border-gray-200 focus:ring-2 focus:ring-black/5 focus:border-gray-400'
              }`}
            />
            {errors.maxUsage && (
              <div className="flex items-center gap-1 text-xs text-red-500 mt-1">
                <AlertCircle size={13} />
                <span>{errors.maxUsage.message}</span>
              </div>
            )}
          </div>
        </div>

        {/* Limit to one use per customer Toggle Row */}
        <div className="pt-2">
          <div className="flex items-center gap-3">
            <Controller
              name="limitOnePerCustomer"
              control={control}
              render={({ field: { value, onChange } }) => (
                <Toggle checked={value} onChange={onChange} />
              )}
            />
            <div>
              <span className="block text-sm font-bold text-gray-900">
                {t('vouchersListing.form.limitOnePerCustomer')}
              </span>
              <span className="block text-xs text-gray-400 mt-0.5">
                {t('vouchersListing.form.limitOnePerCustomerDesc')}
              </span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => navigate('/vouchers')}
            className="w-full sm:w-auto px-6 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer text-center"
          >
            {t('vouchersListing.form.cancel')}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-6 py-2.5 bg-black hover:bg-gray-800 text-white rounded-xl text-sm font-semibold transition-colors shadow-xs disabled:opacity-50 cursor-pointer text-center"
          >
            {initialVoucher
              ? t('vouchersListing.form.saveChanges')
              : t('vouchersListing.form.createVoucher')}
          </button>
        </div>
      </form>
    </div>
  );
};
