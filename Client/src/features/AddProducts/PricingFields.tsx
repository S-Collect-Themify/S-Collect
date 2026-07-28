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

    const {
      isEdit,
    } = useAddProductPage();

  const inputCls = (hasError?: string) =>
    `w-full rounded-lg border px-4 py-3 focus:outline-none ${
      hasError
        ? 'border-red-500 focus:border-red-500'
        : 'border-gray-300 focus:border-gray-950'
    }`;

  return (
    <>
      <h6 className="pt-6 font-semibold">{t('addProduct.pricingRules')}</h6>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block font-medium">
            {t('addProduct.basePrice')} <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            className={inputCls(errors.basePrice?.message)}
            placeholder="0.00"
            step="0.01"
            min="0"
            {...register('basePrice', {
              required: t('addProduct.errors.basePriceRequired'),
              min: { value: 0, message: t('addProduct.errors.priceMinValue') },
            })}
          />
          {errors.basePrice && (
            <p className="mt-1 text-sm text-red-500">
              {errors.basePrice.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block font-medium">
            {t('addProduct.comparePrice')}{' '}
            <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            className={inputCls(errors.comparePrice?.message)}
            placeholder="0.00"
            step="0.01"
            min="0"
            {...register('comparePrice', {
              required: t('addProduct.errors.comparePriceRequired'),
              min: { value: 0, message: t('addProduct.errors.priceMinValue') },
            })}
          />
          {errors.comparePrice && (
            <p className="mt-1 text-sm text-red-500">
              {errors.comparePrice.message}
            </p>
          )}
        </div>
      </div>

      {isEdit ? (
        ''
      ) : (
        <div className="max-w-md">
          <label className="mb-2 block font-medium">
            {t('addProduct.sku')} <span className="text-red-500">*</span>
          </label>
          <input
            className={inputCls(errors.sku?.message)}
            placeholder="SKU-001"
            {...register('sku', {
              required: t('addProduct.errors.skuRequired'),
            })}
          />
          {errors.sku && (
            <p className="mt-1 text-sm text-red-500">{errors.sku.message}</p>
          )}
        </div>
      )}
    </>
  );
};

export default PricingFields;
