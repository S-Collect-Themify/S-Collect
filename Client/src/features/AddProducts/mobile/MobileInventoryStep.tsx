import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormContext } from 'react-hook-form';
import { Plus, Trash2, ChevronDown } from 'lucide-react';
import type { ProductFormData, VarianceCardData } from '../types';
import { useMobileAddProductStore } from './mobileAddProductStore';

const SIZE_OPTIONS = [
  'XS',
  'S',
  'M',
  'L',
  'XL',
  '2XL',
  '3XL',
  '4XL',
  'One Size',
];

const MobileInventoryStep = () => {
  const { t } = useTranslation();
  const { watch, setValue } = useFormContext<ProductFormData>();

  const { isActive, setIsActive, previousStep, nextStep } =
    useMobileAddProductStore();

  const watchedCards = watch('varianceCards');
  const basePriceForm = watch('basePrice');
  const comparePriceForm = watch('comparePrice');
  const skuForm = watch('sku');

  const varianceCards: VarianceCardData[] =
    watchedCards && watchedCards.length > 0
      ? watchedCards
      : [
          {
            id: '1',
            size: 'XS',
            color: '',
            stock: 1,
            basePrice: basePriceForm || '',
            comparePrice: comparePriceForm || '',
            sku: skuForm || '',
          },
        ];

  // Initialize varianceCards in form if not set
  useEffect(() => {
    if (!watchedCards || watchedCards.length === 0) {
      setValue('varianceCards', varianceCards);
    }
  }, [watchedCards, setValue]);

  const updateVarianceCards = (newCards: VarianceCardData[]) => {
    setValue('varianceCards', newCards, { shouldValidate: true });

    const totalStock = newCards.reduce(
      (acc, c) => acc + (Number(c.stock) || 0),
      0
    );
    setValue('quantity', totalStock);
    useMobileAddProductStore.getState().setQuantity(totalStock);

    const allSizes = Array.from(
      new Set(newCards.map((c) => c.size?.trim()).filter(Boolean))
    );
    const allColors = Array.from(
      new Set(newCards.map((c) => c.color?.trim()).filter(Boolean))
    );
    setValue('sizes', allSizes);
    setValue('colors', allColors);

    const firstPrice = newCards.find((c) => c.basePrice)?.basePrice || '';
    const firstCompare =
      newCards.find((c) => c.comparePrice)?.comparePrice || '';
    const firstSku = newCards.find((c) => c.sku)?.sku || '';

    if (firstPrice) setValue('basePrice', firstPrice);
    if (firstCompare) setValue('comparePrice', firstCompare);
    if (firstSku) setValue('sku', firstSku);
  };

  const handleAddVarianceCard = () => {
    const newCards: VarianceCardData[] = [
      ...varianceCards,
      {
        id: Date.now().toString(),
        size: 'XS',
        color: '',
        stock: 1,
        basePrice: varianceCards[0]?.basePrice || basePriceForm || '',
        comparePrice: varianceCards[0]?.comparePrice || comparePriceForm || '',
        sku: '',
      },
    ];
    updateVarianceCards(newCards);
  };

  const handleRemoveVarianceCard = (id: string) => {
    if (varianceCards.length > 1) {
      const newCards = varianceCards.filter((c) => c.id !== id);
      updateVarianceCards(newCards);
    }
  };

  const handleUpdateCardField = (
    cardId: string,
    field: keyof VarianceCardData,
    val: any
  ) => {
    const newCards = varianceCards.map((c) => {
      if (c.id === cardId) {
        return { ...c, [field]: val };
      }
      return c;
    });
    updateVarianceCards(newCards);
  };

  const handleContinue = () => {
    nextStep();
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Variance Cards Header & List */}
      <div className="space-y-4">
        {varianceCards.map((card, cardIdx) => {
          const baseNum = parseFloat(card.basePrice);
          const compareNum = parseFloat(card.comparePrice);
          const hasCompareError = Boolean(
            card.comparePrice &&
              card.comparePrice.trim() !== '' &&
              !isNaN(compareNum) &&
              !isNaN(baseNum) &&
              compareNum > 0 &&
              compareNum <= baseNum
          );

          return (
            <div
              key={card.id}
              className="relative rounded-2xl border border-gray-200 bg-white p-4 space-y-3.5 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                  {varianceCards.length > 1
                    ? `${t('addProduct.preview.variance', 'Variance')} #${cardIdx + 1}`
                    : t('addProduct.varianceCard', 'Product Variance')}
                </span>
                {varianceCards.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveVarianceCard(card.id)}
                    className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors p-1 cursor-pointer font-medium"
                    title={t(
                      'addProduct.removeVarianceCard',
                      'Remove Card'
                    )}
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>

              {/* Size Select */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-800">
                  {t('addProduct.size', 'Size')}{' '}
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={card.size}
                    onChange={(e) =>
                      handleUpdateCardField(card.id, 'size', e.target.value)
                    }
                    className="w-full appearance-none rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:border-gray-950 focus:outline-none bg-white cursor-pointer pr-10"
                  >
                    <option value="" disabled>
                      {t('addProduct.selectSize', 'Select Size')}
                    </option>
                    {SIZE_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                    {card.size && !SIZE_OPTIONS.includes(card.size) && (
                      <option value={card.size}>{card.size}</option>
                    )}
                  </select>
                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 rtl:right-auto rtl:left-3.5"
                  />
                </div>
              </div>

              {/* Color Input */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-800">
                  {t('addProduct.color', 'Color')}{' '}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:border-gray-950 focus:outline-none bg-white"
                  placeholder={t('addProduct.enterColor', 'Red')}
                  value={card.color}
                  onChange={(e) =>
                    handleUpdateCardField(card.id, 'color', e.target.value)
                  }
                />
              </div>

              {/* Stock Quantity Stepper */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-800">
                  {t('addProduct.stockQuantity', 'Stock Quantity')}
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      handleUpdateCardField(
                        card.id,
                        'stock',
                        Math.max(0, (card.stock || 0) - 1)
                      )
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-300 text-base font-semibold text-gray-700 hover:bg-gray-100 transition active:scale-95 cursor-pointer bg-white"
                  >
                    −
                  </button>
                  <div className="flex h-9 w-20 items-center justify-center rounded-xl border border-gray-300 bg-white">
                    <input
                      type="number"
                      min={0}
                      value={card.stock}
                      onChange={(e) =>
                        handleUpdateCardField(
                          card.id,
                          'stock',
                          Math.max(0, Number(e.target.value))
                        )
                      }
                      className="w-full text-center text-sm font-semibold focus:outline-none bg-transparent"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleUpdateCardField(
                        card.id,
                        'stock',
                        (card.stock || 0) + 1
                      )
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-300 text-base font-semibold text-gray-700 hover:bg-gray-100 transition active:scale-95 cursor-pointer bg-white"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Base Price & Compare-at Price */}
              <div className="grid gap-3 grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-800">
                    {t('addProduct.basePrice', 'Base Price')}{' '}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:border-gray-950 focus:outline-none bg-white"
                    placeholder="189 SAR"
                    step="0.01"
                    min="0"
                    value={card.basePrice}
                    onChange={(e) =>
                      handleUpdateCardField(
                        card.id,
                        'basePrice',
                        e.target.value
                      )
                    }
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-800">
                    {t('addProduct.comparePrice', 'Compare-at Price')}
                  </label>
                  <input
                    type="number"
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none bg-white ${
                      hasCompareError
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:border-gray-950'
                    }`}
                    placeholder="250 SAR"
                    step="0.01"
                    min="0"
                    value={card.comparePrice}
                    onChange={(e) =>
                      handleUpdateCardField(
                        card.id,
                        'comparePrice',
                        e.target.value
                      )
                    }
                  />
                  {hasCompareError && (
                    <p className="mt-1 text-[11px] text-red-500">
                      {t(
                        'addProduct.errors.comparePriceMustBeGreater',
                        'Compare-at price must be greater than base price'
                      )}
                    </p>
                  )}
                </div>
              </div>

              {/* SKU */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-800">
                  {t('addProduct.sku', 'SKU')}
                </label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:border-gray-950 focus:outline-none bg-white font-mono"
                  placeholder="PRD-NAN-001"
                  value={card.sku}
                  onChange={(e) =>
                    handleUpdateCardField(card.id, 'sku', e.target.value)
                  }
                />
              </div>
            </div>
          );
        })}

        {/* Add Variance Card Button */}
        <button
          type="button"
          onClick={handleAddVarianceCard}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 py-3 text-xs font-bold text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-colors bg-white cursor-pointer"
        >
          <Plus size={16} />
          {t('addProduct.addVariance', 'Add Variance')}
        </button>
      </div>

      {/* Product Status Toggle */}
      <div className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 bg-white">
        <span className="text-sm font-medium text-gray-700">
          {t('addProduct.mobile.productStatus', 'Product Status')}
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

      {/* Navigation Buttons */}
      <div className="flex gap-3 mt-2">
        <button
          type="button"
          onClick={previousStep}
          className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 active:scale-[0.98]"
        >
          {t('addProduct.previous', 'Previous')}
        </button>
        <button
          type="button"
          onClick={handleContinue}
          className="flex-1 rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 active:scale-[0.98]"
        >
          {t('addProduct.continue', 'Continue')}
        </button>
      </div>
    </div>
  );
};

export default MobileInventoryStep;
