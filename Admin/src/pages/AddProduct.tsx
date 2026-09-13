import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import ProductMedia from '../components/ui/ProductMedia';
import ProductStatus from '../components/ui/ProductStatus';
import ReviewPage from '../features/AddProducts/ReviewPage';
import BasicInfoFields from '../features/AddProducts/BasicInfoFields';
import QuantityInput from '../features/AddProducts/QuantityInput';
import TagInput from '../features/AddProducts/TagInput';
import PricingFields from '../features/AddProducts/PricingFields';
import SuccessPopup from '../features/AddProducts/SuccessPopup';
import MobileAddProduct from '../features/AddProducts/mobile/MobileAddProduct';
import { mapFormToMultipartFormData } from '../features/AddProducts/utils';
import type { ProductFormData } from '../features/AddProducts/types';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { useCategories } from '../hooks/useCategories';
import { useCreateProduct } from '../features/AddProducts/useCreateProduct';
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
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const navigate = useNavigate();
  const { isMobile } = useBreakpoint();
  const { categories: categoriesList } = useCategories();
  const { mutate: createProduct, isPending } = useCreateProduct();

  const [isSuccess, setIsSuccess] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [createdThumbnail, setCreatedThumbnail] = useState<string | undefined>(undefined);

  const methods = useForm<ProductFormData>({
    defaultValues: {
      nameAr: '',
      nameEn: '',
      description: '',
      basePrice: '',
      comparePrice: '',
      sku: '',
      images: [],
      categoryId: '',
      season: 'all',
      enabled: true,
      quantity: 0,
      categories: [],
      sizes: [],
      colors: [],
    },
  });

  const enabled = methods.watch('enabled') ?? true;
  const quantity = methods.watch('quantity') ?? 0;
  const sizes = methods.watch('sizes') ?? [];
  const colors = methods.watch('colors') ?? [];

  // Derive categories dynamically from the selected categoryId
  const categoryId = methods.watch('categoryId') ?? '';
  const selectedCategory = Array.isArray(categoriesList) ? categoriesList.find((c) => c.id === categoryId) : undefined;
  const categories = selectedCategory ? [isArabic ? selectedCategory.nameAr : selectedCategory.name] : [];

  const makeAdder = (fieldName: 'categories' | 'sizes' | 'colors') => (value: string) => {
    const prev = methods.getValues(fieldName) || [];
    methods.setValue(fieldName, [...prev, value]);
  };

  const makeRemover = (fieldName: 'categories' | 'sizes' | 'colors') => (index: number) => {
    const prev = methods.getValues(fieldName) || [];
    methods.setValue(fieldName, prev.filter((_, i) => i !== index));
  };

  const onSubmit = (data: ProductFormData) => {
    console.log('Form data submitted for review:', data);
    const multipartData = mapFormToMultipartFormData(data);
    console.log('Prepared multipart/form-data:');
    console.log('- name:', multipartData.get('name'));
    console.log('- nameAr:', multipartData.get('nameAr'));
    console.log('- categoryId:', multipartData.get('categoryId'));
    setShowReview(true);
  };

  if (isMobile) {
    return <MobileAddProduct />;
  }

  if (showReview) {
    return (
      <ReviewPage
        formData={methods.getValues()}
        categories={categories}
        sizes={sizes}
        colors={colors}
        quantity={quantity}
        onPrevious={() => setShowReview(false)}
        onPublish={async () => {
          const data = methods.getValues();
          const multipartData = mapFormToMultipartFormData(data);
          createProduct(multipartData, {
            onSuccess: (response: any) => {
              const thumbnail = response?.images?.find((img: any) => img.isThumbnail)?.url || response?.images?.[0]?.url || response?.thumbnailUrl;
              if (thumbnail) {
                setCreatedThumbnail(thumbnail);
              } else {
                const firstImageFile = data.images?.[0];
                if (firstImageFile) {
                  setCreatedThumbnail(URL.createObjectURL(firstImageFile));
                }
              }
              setShowReview(false);
              setIsSuccess(true);
            },
          });
        }}
        isPublishing={isPending}
      />
    );
  }

  return (
    <FormProvider {...methods}>
      <> 
        <div
          className="px-4 lg:px-14 py-3 bg-white"
        >
          <h1 className="text-h4 font-bold">{t('addProduct.title')}</h1>
        </div>
        <motion.div
          className="flex-1 overflow-y-auto px-4  lg:px-14"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <div className="rounded-2xl  shadow-sm py-4 md:shadow-none">
            <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1fr_400px] xl:gap-10">
              {/* Left */}
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

                  <QuantityInput value={quantity} onChange={(val) => methods.setValue('quantity', val)} />

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

              {/* Right */}
              <motion.div variants={itemVariants}>
                <ProductMedia />
                <div className="mt-8">
                  <ProductStatus enabled={enabled} setEnabled={(val) => methods.setValue('enabled', val)} />
                </div>
              </motion.div>
            </div>

            <motion.div
              variants={itemVariants}
              className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-end sm:gap-4"
            >
              <button className="rounded-xl border border-red-500 px-6 py-3 text-red-500 transition hover:bg-red-50 cursor-pointer">
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

          {isSuccess && (
            <SuccessPopup
              onClose={() => {
                setIsSuccess(false);
                navigate('/');
              }}
              thumbnailUrl={createdThumbnail}
            />
          )}
        </motion.div>
      </>
    </FormProvider>
  );
};

export default AddProduct;
