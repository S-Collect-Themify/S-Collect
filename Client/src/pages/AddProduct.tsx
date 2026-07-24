import { FormProvider } from 'react-hook-form';
import ProductMedia from '../components/ui/ProductMedia';
import ProductStatus from '../components/ui/ProductStatus';
import ReviewPage from '../features/AddProducts/ReviewPage';
import BasicInfoFields from '../features/AddProducts/BasicInfoFields';
import QuantityInput from '../features/AddProducts/QuantityInput';
import TagInput from '../features/AddProducts/TagInput';
import PricingFields from '../features/AddProducts/PricingFields';
import SuccessPopup from '../features/AddProducts/SuccessPopup';
import MobileAddProduct from '../features/AddProducts/mobile/MobileAddProduct';
import { useAddProductPage } from '../features/AddProducts/useAddProductPage';
import { motion } from 'motion/react';
import type { Variants } from 'motion/react';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 15 },
  },
};

const AddProduct = () => {
  const {
    t,
    isEdit,
    productId,
    isMobile,
    isProductLoading,
    methods,
    step,
    setStep,
    isPending,
    createdThumbnail,
    enabled,
    quantity,
    sizes,
    colors,
    categories,
    makeAdder,
    makeRemover,
    onSubmit,
    handlePublish,
    handleCloseSuccess,
  } = useAddProductPage();

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
        sizes={sizes}
        colors={colors}
        quantity={quantity}
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
          <h1 className="heading-page-title">{t('addProduct.title')}</h1>
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

                  <TagInput
                    label={t('addProduct.sizes')}
                    required
                    items={sizes}
                    onAdd={makeAdder('sizes')}
                    onRemove={makeRemover('sizes')}
                    placeholder={t('addProduct.enterSize')}
                    addLabel={t('addProduct.addSize')}
                    addBtnLabel={t('addProduct.add')}
                    cancelBtnLabel={t('addProduct.cancel')}
                  />

                  <TagInput
                    label={t('addProduct.colors')}
                    required
                    items={colors}
                    onAdd={makeAdder('colors')}
                    onRemove={makeRemover('colors')}
                    placeholder={t('addProduct.enterColor')}
                    addLabel={t('addProduct.addColor')}
                    addBtnLabel={t('addProduct.add')}
                    cancelBtnLabel={t('addProduct.cancel')}
                  />

                  <PricingFields />
                </form>
              </motion.div>

              {/* Right Column: Media & Status */}
              <motion.div variants={itemVariants}>
                <ProductMedia />
                <div className="mt-8">
                  <ProductStatus
                    enabled={enabled}
                    setEnabled={(val) => methods.setValue('enabled', val)}
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
                onClick={() => setStep('form')}
                className="rounded-xl border border-red-500 px-6 py-3 text-red-500 transition hover:bg-red-50 cursor-pointer"
              >
                {t('addProduct.cancel')}
              </button>
              <button
                type="submit"
                form="add-product-form"
                className="rounded-xl bg-gray-950 px-6 py-3 text-white transition hover:bg-gray-800 cursor-pointer"
              >
                {t('addProduct.continue')}
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
