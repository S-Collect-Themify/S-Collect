import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FormProvider } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Plus, ChevronDown, ChevronsRight, SlidersHorizontal, ExternalLink, Sparkles, X } from 'lucide-react';
import ProductMedia from '../components/ui/ProductMedia';
import ProductStatus from '../components/ui/ProductStatus';
import ReviewPage from '../features/AddProducts/ReviewPage';
import BasicInfoFields from '../features/AddProducts/BasicInfoFields';
import CategorySelect from '../features/AddProducts/CategorySelect';
import SuccessPopup from '../features/AddProducts/SuccessPopup';
import MobileAddProduct from '../features/AddProducts/mobile/MobileAddProduct';
import { useAddProductPage } from '../features/AddProducts/useAddProductPage';
import { useVendorAttributes } from '../features/attributes/hooks/useAttributes';
import type { VendorAttribute } from '../features/attributes/types';
import { VariantsTable } from '../features/AddProducts/components/VariantsTable';
import { ModernSelect } from '../components/ui/ModernSelect';
import { AutoGenerateVariantsModal } from '../features/AddProducts/components/AutoGenerateVariantsModal';
import { generateRandomSku } from '../features/AddProducts/utils';
import toast from 'react-hot-toast';
import { motion } from 'motion/react';
import type { VarianceCardData } from '../features/AddProducts/types';
import { containerVariants, itemVariants } from '../utils/animations';

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

const AddProduct = () => {
  const {
    t,
    isEdit,
    productId,
    isMobile,
    isProductLoading,
    fetchedProductData,
    methods,
    step,
    setStep,
    isPending,
    createdThumbnail,
    enabled,
    quantity,
    categories,
    onSubmit,
    handlePublish,
    handleCloseSuccess,
    handleCancel,
  } = useAddProductPage();

  const { data: vendorAttributes = [] } = useVendorAttributes();
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  // Find standard Size attribute (if any)
  const defaultOption1Attr = useMemo(() => {
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

  // Find standard Color attribute (if any)
  const defaultOption2Attr = useMemo(() => {
    return (
      vendorAttributes.find(
        (a) =>
          (a.name?.toLowerCase() === 'color' ||
            a.name?.toLowerCase() === 'colors' ||
            a.nameAr === 'اللون' ||
            a.nameAr === 'الألوان') &&
          a.id !== defaultOption1Attr?.id
      ) ||
      (vendorAttributes.length > 1 &&
      vendorAttributes[1]?.id !== defaultOption1Attr?.id
        ? vendorAttributes[1]
        : undefined)
    );
  }, [vendorAttributes, defaultOption1Attr]);

  const [selectedAttributeIds, setSelectedAttributeIds] = useState<string[]>([]);
  const [isAttributesInitialized, setIsAttributesInitialized] = useState(false);

  // Initialize selectedAttributeIds once vendorAttributes or edit data loads
  useEffect(() => {
    if (vendorAttributes.length === 0 || isAttributesInitialized) return;

    if (
      isEdit &&
      fetchedProductData?.optionsMeta &&
      fetchedProductData.optionsMeta.length > 0
    ) {
      const matchedIds: string[] = [];
      fetchedProductData.optionsMeta.forEach((meta) => {
        const matched = vendorAttributes.find(
          (a) =>
            a.id === meta.id ||
            a.name?.toLowerCase() === meta.name?.toLowerCase() ||
            (meta.nameAr && a.nameAr === meta.nameAr)
        );
        if (matched && !matchedIds.includes(matched.id)) {
          matchedIds.push(matched.id);
        }
      });
      if (matchedIds.length > 0) {
        setSelectedAttributeIds(matchedIds);
        setIsAttributesInitialized(true);
        return;
      }
    }

    // Default initialization: Size and Color (or first two available attributes)
    const initialIds: string[] = [];
    if (defaultOption1Attr?.id) initialIds.push(defaultOption1Attr.id);
    if (defaultOption2Attr?.id && !initialIds.includes(defaultOption2Attr.id)) {
      initialIds.push(defaultOption2Attr.id);
    }
    if (initialIds.length === 0 && vendorAttributes[0]?.id) {
      initialIds.push(vendorAttributes[0].id);
    }
    setSelectedAttributeIds(initialIds);
    setIsAttributesInitialized(true);
  }, [
    vendorAttributes,
    defaultOption1Attr,
    defaultOption2Attr,
    isEdit,
    fetchedProductData,
    isAttributesInitialized,
  ]);

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

  // Keep optionsMeta in sync with form data
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

    methods.setValue('optionsMeta', metaList);
  }, [activeAttributes, methods]);

  const [varianceCards, setVarianceCards] = useState<VarianceCardData[]>([
    {
      id: '1',
      size: 'XS',
      color: '',
      attributes: {},
      stock: 1,
      basePrice: '',
      comparePrice: '',
      sku: '',
    },
  ]);

  const [isAutoGenerateOpen, setIsAutoGenerateOpen] = useState(false);

  // Sync varianceCards when edit product data is loaded
  useEffect(() => {
    if (isEdit && fetchedProductData) {
      if (
        Array.isArray(fetchedProductData.varianceCards) &&
        fetchedProductData.varianceCards.length > 0
      ) {
        setVarianceCards(fetchedProductData.varianceCards);
      } else if (
        (fetchedProductData.sizes && fetchedProductData.sizes.length > 0) ||
        (fetchedProductData.colors && fetchedProductData.colors.length > 0) ||
        fetchedProductData.basePrice
      ) {
        setVarianceCards([
          {
            id: '1',
            size: fetchedProductData.sizes?.[0] || 'XS',
            color: fetchedProductData.colors?.[0] || '',
            stock: fetchedProductData.quantity || 1,
            basePrice: fetchedProductData.basePrice || '',
            comparePrice: fetchedProductData.comparePrice || '',
            sku: fetchedProductData.sku || '',
          },
        ]);
      }
    }
  }, [isEdit, fetchedProductData]);

  // Keep form values in sync with varianceCards
  useEffect(() => {
    methods.setValue('varianceCards', varianceCards);

    const totalStock = varianceCards.reduce(
      (acc, c) => acc + (Number(c.stock) || 0),
      0
    );
    methods.setValue('quantity', totalStock);

    const allSizes = Array.from(
      new Set(varianceCards.map((c) => c.size?.trim()).filter(Boolean))
    );
    const allColors = Array.from(
      new Set(varianceCards.map((c) => c.color?.trim()).filter(Boolean))
    );
    methods.setValue('sizes', allSizes);
    methods.setValue('colors', allColors);

    const firstPrice =
      varianceCards.find((c) => c.basePrice)?.basePrice || '';
    const firstCompare =
      varianceCards.find((c) => c.comparePrice)?.comparePrice || '';
    const firstSku = varianceCards.find((c) => c.sku)?.sku || '';

    if (firstPrice) methods.setValue('basePrice', firstPrice);
    if (firstCompare) methods.setValue('comparePrice', firstCompare);
    if (firstSku) methods.setValue('sku', firstSku);
  }, [varianceCards, methods]);

  const handleAddVarianceCard = () => {
    const initialAttrs: Record<string, string> = {};
    activeAttributes.forEach((attr, idx) => {
      if (idx > 1) {
        initialAttrs[attr.id] = attr.values?.[0]?.value || '';
      }
    });

    setVarianceCards((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        size: activeAttributes[0]?.values?.[0]?.value || 'XS',
        color: activeAttributes[1]?.values?.[0]?.value || '',
        attributes: initialAttrs,
        stock: 1,
        basePrice: prev[0]?.basePrice || '',
        comparePrice: prev[0]?.comparePrice || '',
        sku: '',
      },
    ]);
  };

  const handleRemoveVarianceCard = (id: string) => {
    if (varianceCards.length > 1) {
      setVarianceCards((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const handleDuplicateVarianceCard = (card: VarianceCardData) => {
    setVarianceCards((prev) => [
      ...prev,
      {
        ...card,
        id: Date.now().toString(),
        sku: card.sku ? `${card.sku}-COPY` : '',
      },
    ]);
  };

  const handleUpdateCardField = (
    cardId: string,
    field: keyof VarianceCardData,
    val: any
  ) => {
    setVarianceCards((prev) =>
      prev.map((c) => {
        if (c.id === cardId) {
          return { ...c, [field]: val };
        }
        return c;
      })
    );
  };

  const handleUpdateCardAttribute = (
    cardId: string,
    attributeId: string,
    val: string
  ) => {
    setVarianceCards((prev) =>
      prev.map((c) => {
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
      })
    );
  };

  const handleAutoGenerateVariants = ({
    color,
    sizes,
    replaceExisting,
  }: {
    color: string;
    sizes: string[];
    replaceExisting: boolean;
  }) => {
    // Ensure Color attribute is active among options
    const colorAttr = vendorAttributes.find(
      (a) =>
        a.name?.toLowerCase().includes('color') ||
        a.nameAr?.includes('لون')
    );
    if (colorAttr && !selectedAttributeIds.includes(colorAttr.id)) {
      setSelectedAttributeIds((prev) => [...prev, colorAttr.id]);
    }

    const initialAttrs: Record<string, string> = {};
    activeAttributes.forEach((attr, idx) => {
      if (idx > 1) {
        initialAttrs[attr.id] = attr.values?.[0]?.value || '';
      }
    });

    const newCards: VarianceCardData[] = sizes.map((size, index) => {
      const cardAttrs = { ...initialAttrs };
      if (colorAttr) {
        cardAttrs[colorAttr.id] = color;
      }
      if (activeAttributes[0]) {
        cardAttrs[activeAttributes[0].id] = size;
      }

      return {
        id: `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 6)}`,
        size,
        color,
        attributes: cardAttrs,
        stock: 1, // Quantity is 1
        basePrice: '0', // Price is 0
        comparePrice: '',
        sku: generateRandomSku(color, size), // Random generated SKU
      };
    });

    const isDefaultSingleEmpty =
      varianceCards.length === 1 &&
      !varianceCards[0].color &&
      !varianceCards[0].basePrice &&
      (varianceCards[0].stock === 1 || varianceCards[0].stock === 0);

    if (replaceExisting || isDefaultSingleEmpty) {
      setVarianceCards(newCards);
    } else {
      setVarianceCards((prev) => [...prev, ...newCards]);
    }

    toast.success(
      t(
        'addProduct.variantsGeneratedSuccess',
        'Successfully generated {{count}} variants with Price 0 and Stock 1',
        { count: newCards.length }
      )
    );
  };

  if (isMobile) {
    return <MobileAddProduct productId={productId} />;
  }

  if (isEdit && isProductLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-gray-900" />
      </div>
    );
  }

  if (step === 'review') {
    return (
      <ReviewPage
        formData={methods.getValues()}
        categories={categories}
        sizes={varianceCards.map((c) => c.size).filter(Boolean)}
        colors={varianceCards.map((c) => c.color).filter(Boolean)}
        quantity={quantity}
        varianceCards={varianceCards}
        onPrevious={() => setStep('form')}
        onPublish={handlePublish}
        isPublishing={isPending}
        isEdit={isEdit}
      />
    );
  }

  return (
    <FormProvider {...methods}>
      <>
        <div className="sidebar-page-container-header">
          <h1 className="heading-page-title">
            {isEdit ? t('addProduct.editTitle') : t('addProduct.title')}
          </h1>
          <nav aria-label="Breadcrumb" className="mt-2 flex items-center gap-1.5 text-sm">
            <Link
              to="/management"
              className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              {t('sidebar.items.management', 'Management')}
            </Link>
            <ChevronsRight size={16} className="text-gray-400 rtl:rotate-180 shrink-0" />
            <span className="text-gray-900 font-semibold" aria-current="page">
              {isEdit ? t('addProduct.editTitle') : t('addProduct.title')}
            </span>
          </nav>
        </div>
        <motion.div
          className="sidebar-page-container"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <div className="rounded-2xl shadow-sm py-4 md:shadow-none">
            <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1fr_400px] xl:gap-10">
              {/* Left Column: Fields */}
              <motion.div variants={itemVariants}>
                <h5 className="mb-6 font-semibold">
                  {t('addProduct.productInformation')}
                </h5>

                <form
                  id="add-product-form"
                  onSubmit={methods.handleSubmit(onSubmit)}
                  className="space-y-5"
                >
                  <BasicInfoFields />

                  {/* Category Dropdown */}
                  <CategorySelect />

                  {/* Options & Variants Section */}
                  <div className="space-y-3">
                    {/* Header Bar: Title & Attribute Controls */}
                    <div className="flex flex-wrap items-center justify-between gap-3 bg-gray-50/80 border border-gray-200/80 rounded-2xl p-3.5 shadow-2xs">
                      {/* Title & Badge (shrink-0 ensures it NEVER squishes) */}
                      <div className="flex items-center gap-2.5 shrink-0">
                        <span className="p-2 rounded-xl bg-blue-50 text-blue-600 shrink-0">
                          <SlidersHorizontal size={16} />
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h6 className="text-sm font-bold text-gray-900 whitespace-nowrap">
                              {t('addProduct.inventory', 'Inventory & Variances')}
                            </h6>
                            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white border border-gray-200/90 text-gray-600 font-medium whitespace-nowrap shrink-0 shadow-2xs">
                              {varianceCards.length}{' '}
                              {varianceCards.length === 1
                                ? t('addProduct.preview.variance', 'variant')
                                : t('addProduct.variantsCount', 'variants')}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 whitespace-nowrap hidden md:block">
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

                      {/* Active attribute pills, + Add Option picker, and Manage link */}
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
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
                            <div
                              key={attr.id}
                              className="inline-flex items-center gap-1 bg-white pl-2.5 pr-1 py-1 rounded-xl border border-gray-200/90 shadow-2xs text-xs"
                            >
                              <span className="text-[11px] font-medium text-gray-500 whitespace-nowrap">
                                {t('addProduct.optionLabel', 'Option {{num}}', { num: idx + 1 })}:
                              </span>
                              <div className="w-24">
                                <ModernSelect
                                  value={attr.id}
                                  onChange={(newId) => handleSwapAttribute(attr.id, newId)}
                                  options={selectableOptions}
                                  className="!border-0 !bg-transparent hover:!bg-gray-50 !shadow-none !h-6 !px-1 font-semibold text-gray-900"
                                  minWidth={130}
                                />
                              </div>
                              {activeAttributes.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveAttribute(attr.id)}
                                  title={t('addProduct.removeOption', 'Remove option')}
                                  className="p-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition cursor-pointer"
                                >
                                  <X size={13} />
                                </button>
                              )}
                            </div>
                          );
                        })}

                        {/* "+ Add Option" Dropdown for remaining unused attributes */}
                        {unusedAttributes.length > 0 && (
                          <div className="w-32">
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
                              minWidth={150}
                            />
                          </div>
                        )}

                        <Link
                          to="/attributes"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline px-1.5 py-1 shrink-0"
                        >
                          <span>{t('addProduct.manageAttributes', 'Manage')}</span>
                          <ExternalLink size={12} />
                        </Link>

                        <button
                          type="button"
                          onClick={() => setIsAutoGenerateOpen(true)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 px-2.5 py-1 rounded-xl shadow-2xs transition cursor-pointer shrink-0"
                        >
                          <Sparkles size={12} className="text-indigo-600" />
                          <span>{t('addProduct.autoGenerateVariants', 'Auto Generate')}</span>
                        </button>
                      </div>
                    </div>

                    {/* Variants Editable Table */}
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
                  </div>
                </form>
              </motion.div>

              {/* Right Column: Media & Status */}
              <motion.div variants={itemVariants}>
                <ProductMedia />
                {isEdit && (
                  <div className="mt-8">
                    <ProductStatus
                      enabled={enabled}
                      setEnabled={(val) => methods.setValue('enabled', val)}
                      productId={productId}
                    />
                  </div>
                )}
              </motion.div>
            </div>

            {/* Bottom Actions */}
            <motion.div
              variants={itemVariants}
              className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-end sm:gap-4"
            >
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-xl border border-red-500 px-6 py-3 text-red-500 transition hover:bg-red-50 cursor-pointer"
              >
                {t('addProduct.cancel')}
              </button>
              <button
                type="submit"
                form="add-product-form"
                disabled={isPending}
                className="rounded-xl bg-gray-950 px-6 py-3 text-white transition hover:bg-gray-800 cursor-pointer disabled:opacity-50"
              >
                {isEdit
                  ? t('addProduct.save', 'Update')
                  : t('addProduct.continue')}
              </button>
            </motion.div>
          </div>

          {step === 'success' && (
            <SuccessPopup
              onClose={handleCloseSuccess}
              thumbnailUrl={createdThumbnail}
              isEdit={isEdit}
            />
          )}

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
        </motion.div>
      </>
    </FormProvider>
  );
};

export default AddProduct;
