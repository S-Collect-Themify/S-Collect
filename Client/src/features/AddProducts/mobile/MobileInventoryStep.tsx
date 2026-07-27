import { useTranslation } from 'react-i18next';
import { useFormContext } from 'react-hook-form';
import type { ProductFormData } from '../types';
import { useMobileAddProductStore } from './mobileAddProductStore';
import type { Visibility } from './mobileAddProductStore';
import { AnimateNumber } from 'motion-plus/react';

const LOW_STOCK_THRESHOLD = 10;

const MobileInventoryStep = () => {
  const { t } = useTranslation();
  const {
    register,
    trigger,
    formState: { errors },
  } = useFormContext<ProductFormData>();

  const {
    quantity,
    incrementQuantity,
    decrementQuantity,
    isActive,
    setIsActive,
    visibility,
    setVisibility,
    previousStep,
    nextStep,
  } = useMobileAddProductStore();

  const handleContinue = async () => {
    const valid = await trigger(['sku']);
    if (valid) nextStep();
  };

  const inputCls = (hasError?: string) =>
    `w-full rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none ${
      hasError ? 'border-red-400' : 'border-gray-200 focus:border-gray-900'
    }`;

  return (
    <div className="flex flex-col gap-5">
      {/* SKU */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          {t('addProduct.mobile.sku')}
        </label>
        <input
          className={inputCls(errors.sku?.message)}
          placeholder="APPL-IP15-256-BLK"
          {...register('sku', {
            required: t('addProduct.errors.skuRequired', 'Required'),
          })}
        />
        {errors.sku && (
          <p className="mt-1 text-xs text-red-500">{errors.sku.message}</p>
        )}
      </div>

      {/* Stock Quantity */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          {t('addProduct.mobile.stockQuantity')}
        </label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={decrementQuantity}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-lg font-semibold text-gray-600"
          >
            −
          </button>

          <div className="flex h-10 w-24 items-center justify-center rounded-xl border border-gray-200 bg-white">
            <AnimateNumber
              className="text-lg font-semibold"
              transition={{
                layout: {
                  duration: 0.25,
                },
                y: {
                  type: 'spring',
                  bounce: 0.2,
                  duration: 0.4,
                },
                opacity: {
                  duration: 0.2,
                },
              }}
            >
              {quantity}
            </AnimateNumber>
          </div>

          <button
            type="button"
            onClick={incrementQuantity}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-lg font-semibold text-gray-600"
          >
            +
          </button>
        </div>

        {quantity > 0 && quantity <= LOW_STOCK_THRESHOLD && (
          <div className="mt-2 flex items-start gap-1.5 rounded-xl bg-amber-50 border border-amber-100 px-3 py-2">
            <svg
              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-xs text-amber-600">
              Low stock alert will trigger at {LOW_STOCK_THRESHOLD} units.
            </p>
          </div>
        )}
      </div>

      {/* Product Status */}
      <div className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 bg-white">
        <span className="text-sm font-medium text-gray-700">
          {t('addProduct.mobile.productStatus')}
        </span>
        <label className="relative inline-flex cursor-pointer items-center">
          <input
            type="checkbox"
            className="peer sr-only"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          <div className="peer h-6 w-11 rounded-full bg-gray-200 transition peer-checked:bg-green-500 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition after:content-[''] peer-checked:after:translate-x-5" />
        </label>
      </div>

      {/* Visibility */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
          {t('addProduct.mobile.visibility')}
        </p>
        <div className="flex flex-col gap-2">
          {(
            [
              { key: 'homepage', label: t('addProduct.homepage', 'Homepage') },
              {
                key: 'promotions',
                label: t('addProduct.promotions', 'Promotions'),
              },
              {
                key: 'searchResults',
                label: t('addProduct.searchResults', 'Search Results'),
              },
            ] as { key: keyof Visibility; label: string }[]
          ).map(({ key, label }) => (
            <label
              key={key}
              className="flex items-center gap-3 rounded-xl border border-gray-100 px-4 py-2.5 cursor-pointer hover:bg-gray-50"
            >
              <input
                type="checkbox"
                checked={visibility[key]}
                onChange={(e) => setVisibility(key, e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-gray-900 accent-gray-900"
              />
              <span className="text-sm text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Navigation */}
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

export default MobileInventoryStep;
