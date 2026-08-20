import { useTranslation } from 'react-i18next';
import { useFormContext } from 'react-hook-form';
import type { ProductFormData } from '../types';
import { useMobileAddProductStore } from './mobileAddProductStore';

const MobilePricingStep = () => {
  const { t } = useTranslation();
  const {
    register,
    trigger,
    formState: { errors },
  } = useFormContext<ProductFormData>();

  const { previousStep, nextStep } = useMobileAddProductStore();

  const inputCls = (hasError?: string) =>
    `w-full rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none ${
      hasError
        ? 'border-red-400 focus:border-red-400'
        : 'border-gray-200 focus:border-gray-900'
    }`;

  const handleContinue = async () => {
    const valid = await trigger(['basePrice', 'comparePrice']);
    if (valid) nextStep();
  };

  return (
    <div className="flex flex-col md:gap-5 gap-3">
      {/* Base Price */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          {t('addProduct.basePrice')} <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">
            $
          </span>
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="999.00"
            className={`${inputCls(errors.basePrice?.message)} pl-8`}
            {...register('basePrice', {
              required: t('addProduct.errors.basePriceRequired', 'Required'),
              min: {
                value: 0,
                message: t(
                  'addProduct.errors.priceMinValue',
                  'Must be positive'
                ),
              },
            })}
          />
        </div>
        {errors.basePrice && (
          <p className="mt-1 text-xs text-red-500">
            {errors.basePrice.message}
          </p>
        )}
      </div>

      {/* Compare-at Price */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          {t('addProduct.comparePrice')}
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">
            $
          </span>
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="849.00"
            className={`${inputCls(errors.comparePrice?.message)} pl-8`}
            {...register('comparePrice', {
              min: {
                value: 0,
                message: t(
                  'addProduct.errors.priceMinValue',
                  'Must be positive'
                ),
              },
              validate: (val, formValues) => {
                if (!val) return true;
                const compare = parseFloat(val);
                const base = parseFloat(formValues.basePrice);
                if (!isNaN(compare) && !isNaN(base) && compare > 0 && compare <= base) {
                  return t(
                    'addProduct.errors.comparePriceMustBeGreater',
                    'Compare-at price must be greater than base price'
                  );
                }
                return true;
              },
            })}
          />
        </div>
        {errors.comparePrice && (
          <p className="mt-1 text-xs text-red-500">
            {errors.comparePrice.message}
          </p>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex gap-3 mt-2">
        <button
          type="button"
          onClick={previousStep}
          className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 active:scale-[0.98]"
        >
          {t('addProduct.previous')}
        </button>
        <button
          type="button"
          onClick={handleContinue}
          className="flex-1 rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 active:scale-[0.98]"
        >
          {t('addProduct.continue')}
        </button>
      </div>
    </div>
  );
};

export default MobilePricingStep;
