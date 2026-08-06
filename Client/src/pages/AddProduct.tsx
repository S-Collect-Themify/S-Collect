import { useState, useEffect } from 'react';
import { FormProvider } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import ProductMedia from '../components/ui/ProductMedia';
import ProductStatus from '../components/ui/ProductStatus';
import ReviewPage from '../features/AddProducts/ReviewPage';
import BasicInfoFields from '../features/AddProducts/BasicInfoFields';
import QuantityInput from '../features/AddProducts/QuantityInput';
import TagInput from '../features/AddProducts/TagInput';
import CategorySelect from '../features/AddProducts/CategorySelect';
import SuccessPopup from '../features/AddProducts/SuccessPopup';
import MobileAddProduct from '../features/AddProducts/mobile/MobileAddProduct';
import { useAddProductPage } from '../features/AddProducts/useAddProductPage';
import { motion } from 'motion/react';

import { containerVariants, itemVariants } from '../utils/animations';

interface VarianceCardData {
  id: string;
  sizes: string[];
  colors: string[];
  basePrice: string;
  comparePrice: string;
}

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
    { id: '1', sizes: [], colors: [], basePrice: '', comparePrice: '' },
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
            sizes: fetchedProductData.sizes || [],
            colors: fetchedProductData.colors || [],
            basePrice: fetchedProductData.basePrice || '',
            comparePrice: fetchedProductData.comparePrice || '',
          },
        ]);
      }
    }
  }, [isEdit, fetchedProductData]);

  useEffect(() => {
    const allSizes = Array.from(new Set(varianceCards.flatMap((c) => c.sizes)));
    const allColors = Array.from(
      new Set(varianceCards.flatMap((c) => c.colors))
    );
    methods.setValue('sizes', allSizes);
    methods.setValue('colors', allColors);
    const firstPrice = varianceCards.find((c) => c.basePrice)?.basePrice || '';
    const firstCompare =
      varianceCards.find((c) => c.comparePrice)?.comparePrice || '';
    if (firstPrice) methods.setValue('basePrice', firstPrice);
    if (firstCompare) methods.setValue('comparePrice', firstCompare);
  }, [varianceCards, methods]);

  const handleAddVarianceCard = () => {
    setVarianceCards((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sizes: [],
        colors: [],
        basePrice: '',
        comparePrice: '',
      },
    ]);
  };

  const handleRemoveVarianceCard = (id: string) => {
    if (varianceCards.length > 1) {
      setVarianceCards((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const handleAddCardTag = (
    cardId: string,
    field: 'sizes' | 'colors',
    val: string
  ) => {
    setVarianceCards((prev) =>
      prev.map((c) => {
        if (c.id === cardId && !c[field].includes(val)) {
          return { ...c, [field]: [...c[field], val] };
        }
        return c;
      })
    );
  };

  const handleRemoveCardTag = (
    cardId: string,
    field: 'sizes' | 'colors',
    index: number
  ) => {
    setVarianceCards((prev) =>
      prev.map((c) => {
        if (c.id === cardId) {
          return {
            ...c,
            [field]: c[field].filter((_, i) => i !== index),
          };
        }
        return c;
      })
    );
  };

  const handleUpdateCardPrice = (
    cardId: string,
    field: 'basePrice' | 'comparePrice',
    val: string
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
        sizes={varianceCards[0]?.sizes || []}
        colors={varianceCards[0]?.colors || []}
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

                  <QuantityInput
                    value={quantity}
                    onChange={(val) => methods.setValue('quantity', val)}
                  />

                  {/* Category Dropdown (Right below Quantity) */}
                  <CategorySelect />

                  {/* Options & Variance Cards */}
                  <div className="space-y-5">
                    {varianceCards.map((card, cardIdx) => (
                      <div
                        key={card.id}
                        className="relative rounded-2xl border border-gray-200/80 bg-gray-50/40 p-5 space-y-5"
                      >
                        {varianceCards.length > 1 && (
                          <div className="flex items-center justify-between border-b border-gray-200/60 pb-2">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                              Variance #{cardIdx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveVarianceCard(card.id)}
                              className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors p-1 cursor-pointer font-medium"
                            >
                              <Trash2 size={13} />
                              {t('addProduct.removeVarianceCard', 'Remove Card')}
                            </button>
                          </div>
                        )}

                        <TagInput
                          label={t('addProduct.sizes', 'Size')}
                          required
                          items={card.sizes}
                          onAdd={(val) => handleAddCardTag(card.id, 'sizes', val)}
                          onRemove={(idx) => handleRemoveCardTag(card.id, 'sizes', idx)}
                          placeholder={t('addProduct.enterSize')}
                          addLabel={t('addProduct.addSize', 'Add Size')}
                          addBtnLabel={t('addProduct.add')}
                          cancelBtnLabel={t('addProduct.cancel')}
                        />

                        <TagInput
                          label={t('addProduct.colors', 'Color')}
                          required
                          items={card.colors}
                          onAdd={(val) => handleAddCardTag(card.id, 'colors', val)}
                          onRemove={(idx) => handleRemoveCardTag(card.id, 'colors', idx)}
                          placeholder={t('addProduct.enterColor')}
                          addLabel={t('addProduct.addColor', 'Add Color')}
                          addBtnLabel={t('addProduct.add')}
                          cancelBtnLabel={t('addProduct.cancel')}
                        />

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
                                handleUpdateCardPrice(card.id, 'basePrice', e.target.value)
                              }
                            />
                          </div>

                          <div>
                            <label className="mb-2 block text-xs font-semibold text-gray-800">
                              {t('addProduct.comparePrice', 'Compare-at Price')}{' '}
                              <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-gray-950 focus:outline-none bg-white"
                              placeholder="250 SAR"
                              step="0.01"
                              min="0"
                              value={card.comparePrice}
                              onChange={(e) =>
                                handleUpdateCardPrice(card.id, 'comparePrice', e.target.value)
                              }
                            />
                          </div>
                        </div>
                      </div>
                    ))}
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



                  {/* SKU Field */}
                  {!isEdit && (
                    <div className="pt-2">
                      <label className="mb-2 block text-xs font-semibold text-gray-800">
                        SKU <span className="text-red-500">*</span>
                      </label>
                      <input
                        className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-gray-950 focus:outline-none"
                        placeholder="PRD-NAN-001"
                        {...methods.register('sku', {
                          required: t('addProduct.errors.skuRequired'),
                        })}
                      />
                    </div>
                  )}
                </form>
              </motion.div>

              {/* Right Column: Media & Status */}
              <motion.div variants={itemVariants}>
                <ProductMedia />
                <div className="mt-8">
                  <ProductStatus
                    enabled={enabled}
                    setEnabled={(val) => methods.setValue('enabled', val)}
                    productId={productId}
                  />
                </div>
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
