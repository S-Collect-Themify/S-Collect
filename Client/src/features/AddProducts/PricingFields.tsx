import { useTranslation } from 'react-i18next';
import { useFormContext } from 'react-hook-form';
import type { ProductFormData } from './types';
import { useAddProductPage } from './useAddProductPage';

const PricingFields = () => {
  const { t } = useTranslation();
  const {
    register,
    formState: { errors },
  } = useFormContext<ProductFormData>();

  const { isEdit } = useAddProductPage();

  const inputCls = (hasError?: string) =>
    `w-full rounded-lg border px-4 py-3 focus:outline-none ${
      hasError
        ? 'border-red-500 focus:border-red-500'
        : 'border-gray-300 focus:border-gray-950'
    }`;

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-xs font-semibold text-gray-800">
            {t('addProduct.basePrice', 'Base Price')}{' '}
            <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            className={inputCls(errors.basePrice?.message)}
            placeholder="189 SAR"
            step="0.01"
            min="0"
            {...register('basePrice', {
              required: t('addProduct.errors.basePriceRequired'),
              min: { value: 0, message: t('addProduct.errors.priceMinValue') },
            })}
          />
          {errors.basePrice && (
            <p className="mt-1 text-xs text-red-500">
              {errors.basePrice.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold text-gray-800">
            {t('addProduct.comparePrice', 'Compare-at Price')}{' '}
            <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            className={inputCls(errors.comparePrice?.message)}
            placeholder="250 SAR"
            step="0.01"
            min="0"
            {...register('comparePrice', {
              required: t('addProduct.errors.comparePriceRequired'),
              min: { value: 0, message: t('addProduct.errors.priceMinValue') },
            })}
          />
          {errors.comparePrice && (
            <p className="mt-1 text-xs text-red-500">
              {errors.comparePrice.message}
            </p>
          )}
        </div>
      </div>

      {isEdit ? null : (
        <div className="pt-2">
          <label className="mb-2 block text-xs font-semibold text-gray-800">
            SKU <span className="text-red-500">*</span>
          </label>
          <input
            className={inputCls(errors.sku?.message)}
            placeholder="PRD-NAN-001"
            {...register('sku', {
              required: t('addProduct.errors.skuRequired'),
            })}
          />
          {errors.sku && (
            <p className="mt-1 text-xs text-red-500">{errors.sku.message}</p>
          )}
        </div>
      )}
    </>
  );
};

export default PricingFields;
