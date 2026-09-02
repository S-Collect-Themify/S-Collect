import { useState, useEffect } from 'react';
import { FormProvider } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Plus, ChevronDown, ChevronsRight } from 'lucide-react';
import ProductMedia from '../components/ui/ProductMedia';
import ProductStatus from '../components/ui/ProductStatus';
import ReviewPage from '../features/AddProducts/ReviewPage';
import BasicInfoFields from '../features/AddProducts/BasicInfoFields';
import CategorySelect from '../features/AddProducts/CategorySelect';
import SuccessPopup from '../features/AddProducts/SuccessPopup';
import MobileAddProduct from '../features/AddProducts/mobile/MobileAddProduct';
import { useAddProductPage } from '../features/AddProducts/useAddProductPage';
import { motion } from 'motion/react';
import type { VarianceCardData } from '../features/AddProducts/types';
import { containerVariants, itemVariants } from '../utils/animations';

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

  const [varianceCards, setVarianceCards] = useState<VarianceCardData[]>([
    {
      id: '1',
      size: 'XS',
      color: '',
      stock: 1,
      basePrice: '',
      comparePrice: '',
      sku: '',
    },
  ]);

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
    setVarianceCards((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        size: 'XS',
        color: '',
        stock: 1,
        basePrice: prev[0]?.basePrice || '',
        comparePrice: prev[0]?.comparePrice || '',
        sku: '',
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

                  {/* Options & Variance Cards */}
                  <div className="space-y-5">
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
                          className="relative rounded-2xl border border-gray-200/80 bg-white p-5 space-y-4 shadow-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                              {varianceCards.length > 1
                                ? `${t('addProduct.preview.variance', 'Variance')} #${cardIdx + 1}`
                                : ''}
                            </span>
                          </div>

                          {/* Size Dropdown */}
                          <div>
                            <label className="mb-2 block text-xs font-semibold text-gray-800">
                              {t('addProduct.size', 'Size')}{' '}
                              <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <select
                                value={card.size}
                                onChange={(e) =>
                                  handleUpdateCardField(
                                    card.id,
                                    'size',
                                    e.target.value
                                  )
                                }
                                className="w-full appearance-none rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-gray-950 focus:outline-none bg-white cursor-pointer pr-10"
                              >
                                <option value="" disabled>
                                  {t('addProduct.selectSize', 'Select Size')}
                                </option>
                                {SIZE_OPTIONS.map((s) => (
                                  <option key={s} value={s}>
                                    {s}
                                  </option>
                                ))}
                                {card.size &&
                                  !SIZE_OPTIONS.includes(card.size) && (
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
                            <label className="mb-2 block text-xs font-semibold text-gray-800">
                              {t('addProduct.color', 'Color')}{' '}
                              <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-gray-950 focus:outline-none bg-white"
                              placeholder={t('addProduct.enterColor', 'Red')}
                              value={card.color}
                              onChange={(e) =>
                                handleUpdateCardField(
                                  card.id,
                                  'color',
                                  e.target.value
                                )
                              }
                            />
                          </div>

                          {/* Stock Quantity Stepper */}
                          <div>
                            <label className="mb-2 block text-xs font-semibold text-gray-800">
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
                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <label className="mb-2 block text-xs font-semibold text-gray-800">
                                {t('addProduct.basePrice', 'Base Price')}{' '}
                                <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="number"
                                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-gray-950 focus:outline-none bg-white"
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
                              <label className="mb-2 block text-xs font-semibold text-gray-800">
                                {t('addProduct.comparePrice', 'Compare-at Price')}
                              </label>
                              <input
                                type="number"
                                className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none bg-white ${hasCompareError
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
                                <p className="mt-1 text-xs text-red-500">
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
                            <label className="mb-2 block text-xs font-semibold text-gray-800">
                              {t('addProduct.sku', 'SKU')}
                            </label>
                            <input
                              type="text"
                              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-gray-950 focus:outline-none bg-white font-mono"
                              placeholder="PRD-NAN-001"
                              value={card.sku}
                              onChange={(e) =>
                                handleUpdateCardField(
                                  card.id,
                                  'sku',
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Add Variance Link/Button */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={handleAddVarianceCard}
                      className="flex items-center gap-1.5 text-sm font-bold text-gray-900 underline hover:text-gray-700 cursor-pointer"
                    >
                      <Plus size={16} />
                      {t('addProduct.addVariance', 'Add Variance')}
                    </button>
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
        </motion.div>
      </>
    </FormProvider>
  );
};

export default AddProduct;
