import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormContext } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Trash2, ChevronDown, SlidersHorizontal, ExternalLink, X } from 'lucide-react';
import type { ProductFormData, VarianceCardData } from '../types';
import type { VendorAttribute } from '../../attributes/types';
import { useMobileAddProductStore } from './mobileAddProductStore';
import { useVendorAttributes } from '../../attributes/hooks/useAttributes';
import { VariantsTable } from '../components/VariantsTable';
import { ModernSelect } from '../../../components/ui/ModernSelect';
import { AutoGenerateVariantsModal } from '../components/AutoGenerateVariantsModal';
import { generateRandomSku } from '../utils';
import toast from 'react-hot-toast';

const DEFAULT_SIZE_OPTIONS = [
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

interface MobileInventoryStepProps {
  isEdit?: boolean;
}

const MobileInventoryStep = ({ isEdit }: MobileInventoryStepProps) => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const { watch, setValue } = useFormContext<ProductFormData>();

  const { data: vendorAttributes = [] } = useVendorAttributes();

  // Find default attributes (e.g. Size and Color)
  const defaultSizeAttr = useMemo(() => {
    return (
      vendorAttributes.find(
        (a) =>
          a.name?.toLowerCase() === 'size' ||
          a.name?.toLowerCase() === 'sizes' ||
          a.nameAr === 'المقاس' ||
          a.nameAr === 'المقاسات'
      ) || vendorAttributes[0]
    );
  }, [vendorAttributes]);

  const defaultColorAttr = useMemo(() => {
    return vendorAttributes.find(
      (a) =>
        (a.name?.toLowerCase() === 'color' ||
          a.name?.toLowerCase() === 'colors' ||
          a.nameAr === 'اللون' ||
          a.nameAr === 'الألوان') &&
        a.id !== defaultSizeAttr?.id
    );
  }, [vendorAttributes, defaultSizeAttr]);

  const [selectedAttributeIds, setSelectedAttributeIds] = useState<string[]>([]);
  const [isAttributesInitialized, setIsAttributesInitialized] = useState(false);

  useEffect(() => {
    if (vendorAttributes.length === 0 || isAttributesInitialized) return;

    const initialIds: string[] = [];
    if (defaultSizeAttr?.id) initialIds.push(defaultSizeAttr.id);
    if (defaultColorAttr?.id && !initialIds.includes(defaultColorAttr.id)) {
      initialIds.push(defaultColorAttr.id);
    }
    if (initialIds.length === 0 && vendorAttributes[0]?.id) {
      initialIds.push(vendorAttributes[0].id);
    }
    setSelectedAttributeIds(initialIds);
    setIsAttributesInitialized(true);
  }, [vendorAttributes, defaultSizeAttr, defaultColorAttr, isAttributesInitialized]);

  const activeAttributes = useMemo(() => {
    return selectedAttributeIds
      .map((id) => vendorAttributes.find((a) => a.id === id))
      .filter((a): a is VendorAttribute => Boolean(a));
  }, [selectedAttributeIds, vendorAttributes]);

  const unusedAttributes = useMemo(() => {
    return vendorAttributes.filter((a) => !selectedAttributeIds.includes(a.id));
  }, [vendorAttributes, selectedAttributeIds]);

  const handleAddAttribute = (attrId: string) => {
    if (attrId && !selectedAttributeIds.includes(attrId)) {
      setSelectedAttributeIds((prev) => [...prev, attrId]);
    }
  };

  const handleRemoveAttribute = (attrId: string) => {
    setSelectedAttributeIds((prev) => prev.filter((id) => id !== attrId));
  };

  const handleSwapAttribute = (oldId: string, newId: string) => {
    if (!newId) return;
    setSelectedAttributeIds((prev) =>
      prev.map((id) => (id === oldId ? newId : id))
    );
  };

  // Keep form's optionsMeta in sync so utils.ts can build proper options payload
  useEffect(() => {
    const metaList = activeAttributes.map((attr) => ({
      id: attr.id,
      name: attr.name,
      nameAr: attr.nameAr || attr.name,
      values: (attr.values || []).map((v) => ({
        id: v.id,
        value: v.value,
        valueAr: v.valueAr || v.value,
      })),
    }));

    if (metaList.length === 0) {
      metaList.push({
        id: '',
        name: 'Size',
        nameAr: 'المقاس',
        values: DEFAULT_SIZE_OPTIONS.map((s) => ({
          id: '',
          value: s,
          valueAr: s,
        })),
      });
    }

    setValue('optionsMeta', metaList);
  }, [activeAttributes, setValue]);

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
    const initialAttrs: Record<string, string> = {};
    activeAttributes.forEach((attr, idx) => {
      if (idx > 1) {
        initialAttrs[attr.id] = attr.values?.[0]?.value || '';
      }
    });

    const newCards: VarianceCardData[] = [
      ...varianceCards,
      {
        id: Date.now().toString(),
        size: activeAttributes[0]?.values?.[0]?.value || 'XS',
        color: activeAttributes[1]?.values?.[0]?.value || '',
        attributes: initialAttrs,
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

  const handleDuplicateVarianceCard = (card: VarianceCardData) => {
    const newCards: VarianceCardData[] = [
      ...varianceCards,
      {
        ...card,
        id: Date.now().toString(),
        sku: card.sku ? `${card.sku}-COPY` : '',
      },
    ];
    updateVarianceCards(newCards);
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

  const handleUpdateCardAttribute = (
    cardId: string,
    attributeId: string,
    val: string
  ) => {
    const newCards = varianceCards.map((c) => {
      if (c.id === cardId) {
        const attrIdx = activeAttributes.findIndex((a) => a.id === attributeId);
        const updated = {
          ...c,
          attributes: {
            ...(c.attributes || {}),
            [attributeId]: val,
          },
        };
        if (attrIdx === 0) {
          updated.size = val;
        } else if (attrIdx === 1) {
          updated.color = val;
        }
        return updated;
      }
      return c;
    });
    updateVarianceCards(newCards);
  };

  const [isAutoGenerateOpen, setIsAutoGenerateOpen] = useState(false);

  const handleAutoGenerateVariants = ({
    cards,
    attributeIds,
    colors,
    sizes,
    replaceExisting,
  }: {
    cards?: VarianceCardData[];
    attributeIds?: string[];
    colors?: string[];
    sizes?: string[];
    replaceExisting: boolean;
  }) => {
    // Ensure all generated attribute IDs are active
    if (attributeIds && attributeIds.length > 0) {
      setSelectedAttributeIds((prev) => {
        const set = new Set(prev);
        attributeIds.forEach((id) => set.add(id));
        return Array.from(set);
      });
    }

    let newCards: VarianceCardData[] = [];

    if (cards && cards.length > 0) {
      newCards = cards;
    } else {
      // Fallback for 2-attribute generation
      const sizeAttr = vendorAttributes.find(
        (a) =>
          a.name?.toLowerCase().includes('size') ||
          a.nameAr?.includes('مقاس')
      );
      const colorAttr = vendorAttributes.find(
        (a) =>
          a.name?.toLowerCase().includes('color') ||
          a.nameAr?.includes('لون')
      );

      const sizeAttrId = sizeAttr?.id || activeAttributes[0]?.id || '';
      const colorAttrId = colorAttr?.id || activeAttributes[1]?.id || '';

      const initialAttrs: Record<string, string> = {};
      activeAttributes.forEach((attr, idx) => {
        if (idx > 1) {
          initialAttrs[attr.id] = attr.values?.[0]?.value || '';
        }
      });

      let index = 0;
      for (const color of colors || []) {
        for (const size of sizes || []) {
          const cardAttrs = { ...initialAttrs };
          if (sizeAttrId) cardAttrs[sizeAttrId] = size;
          if (colorAttrId) cardAttrs[colorAttrId] = color;

          newCards.push({
            id: `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 6)}`,
            size,
            color,
            attributes: cardAttrs,
            stock: 1,
            basePrice: '0',
            comparePrice: '',
            sku: generateRandomSku(color, size),
          });
          index++;
        }
      }
    }

    if (newCards.length === 0) return;

    const isDefaultSingleEmpty =
      varianceCards.length === 1 &&
      !varianceCards[0].color &&
      !varianceCards[0].basePrice &&
      (varianceCards[0].stock === 1 || varianceCards[0].stock === 0);

    if (replaceExisting || isDefaultSingleEmpty) {
      updateVarianceCards(newCards);
    } else {
      updateVarianceCards([...varianceCards, ...newCards]);
    }

    toast.success(
      t(
        'addProduct.variantsGeneratedSuccess',
        'Successfully generated {{count}} variants with Price 0 and Stock 1',
        { count: newCards.length }
      )
    );
  };

  const handleContinue = () => {
    nextStep();
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Options & Attributes Info / Config Banner */}
      <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
              <SlidersHorizontal size={16} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900">
                {t('addProduct.productOptions', 'Product Options & Attributes')}
              </h4>
              <p className="text-[11px] text-gray-500">
                {activeAttributes.length > 0
                  ? t(
                      'addProduct.optionsLoadedFromAttributes',
                      'Options are populated from your pre-configured attributes library.'
                    )
                  : t(
                      'addProduct.optionsDefaultHint',
                      'Pre-configure reusable attributes to quickly choose sizes, colors, and options.'
                    )}
              </p>
            </div>
          </div>
          <Link
            to="/attributes"
            target="_blank"
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 bg-white px-2.5 py-1 rounded-lg border border-blue-200 shadow-2xs whitespace-nowrap"
          >
            {t('addProduct.manageAttributes', 'Manage')}
            <ExternalLink size={12} />
          </Link>
        </div>

        {/* Attribute pickers for active attributes and + Add Option */}
        {vendorAttributes.length > 0 && (
          <div className="pt-2.5 border-t border-blue-100/80 space-y-2.5">
            {activeAttributes.map((attr, idx) => {
              const selectableOptions = [
                {
                  label: isArabic ? attr.nameAr || attr.name : attr.name,
                  value: attr.id,
                  badge: attr.values?.length ? `${attr.values.length}` : undefined,
                },
                ...unusedAttributes.map((ua) => ({
                  label: isArabic ? ua.nameAr || ua.name : ua.name,
                  value: ua.id,
                  badge: ua.values?.length ? `${ua.values.length}` : undefined,
                })),
              ];

              return (
                <div key={attr.id} className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-gray-700 shrink-0">
                    {t('addProduct.optionLabel', 'Option {{num}}', { num: idx + 1 })}:
                  </span>
                  <div className="flex-1 max-w-[220px] flex items-center gap-1.5">
                    <div className="flex-1">
                      <ModernSelect
                        value={attr.id}
                        onChange={(newId) => handleSwapAttribute(attr.id, newId)}
                        options={selectableOptions}
                        minWidth={150}
                      />
                    </div>
                    {activeAttributes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveAttribute(attr.id)}
                        className="p-1 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                      >
                        <X size={15} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {unusedAttributes.length > 0 && (
              <div className="flex items-center justify-between gap-2 pt-1">
                <span className="text-xs font-semibold text-gray-600 shrink-0">
                  {t('addProduct.addOption', '+ Add Option')}:
                </span>
                <div className="flex-1 max-w-[220px]">
                  <ModernSelect
                    value=""
                    onChange={(newAttrId) => {
                      if (newAttrId) handleAddAttribute(newAttrId);
                    }}
                    options={unusedAttributes.map((ua) => ({
                      label: isArabic ? ua.nameAr || ua.name : ua.name,
                      value: ua.id,
                      badge: ua.values?.length ? `${ua.values.length}` : undefined,
                    }))}
                    placeholder={t('addProduct.addOption', '+ Add Option')}
                    minWidth={160}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Variants Table View */}
      <VariantsTable
        varianceCards={varianceCards}
        activeAttributes={activeAttributes}
        onUpdateCardField={handleUpdateCardField}
        onUpdateCardAttribute={handleUpdateCardAttribute}
        onAddVariance={handleAddVarianceCard}
        onAutoGenerateVariants={() => setIsAutoGenerateOpen(true)}
        onRemoveVariance={handleRemoveVarianceCard}
        onDuplicateVariance={handleDuplicateVarianceCard}
        isArabic={isArabic}
      />

      <AutoGenerateVariantsModal
        isOpen={isAutoGenerateOpen}
        onClose={() => setIsAutoGenerateOpen(false)}
        onGenerate={handleAutoGenerateVariants}
        vendorAttributes={vendorAttributes}
        activeAttributes={activeAttributes}
        hasExistingVariants={
          varianceCards.length > 1 ||
          Boolean(varianceCards[0]?.color) ||
          Boolean(varianceCards[0]?.basePrice)
        }
        isArabic={isArabic}
      />

      {/* Product Status Toggle */}
      {isEdit && (
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
      )}

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
