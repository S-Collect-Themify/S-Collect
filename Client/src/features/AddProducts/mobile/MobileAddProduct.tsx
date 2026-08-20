import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';

import type { ProductFormData } from '../types';
import { useProduct } from '../useProduct';
import MobileStepIndicator from './MobileStepIndicator';
import MobileBasicInfoStep from './MobileBasicInfoStep';
import MobileInventoryStep from './MobileInventoryStep';
import MobileReviewStep from './MobileReviewStep';
import { MobileLoadingPopup, MobileSuccessPopup } from './MobilePublishPopups';
import { useMobileAddProductStore } from './mobileAddProductStore';

interface MobileAddProductProps {
  productId?: string;
}

const MobileAddProduct = ({ productId }: MobileAddProductProps) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isArabic = i18n.language === 'ar';
  const isEdit = !!productId;

  const { data: productData, isLoading: isProductLoading } =
    useProduct(productId);

  const {
    step,
    isLoading,
    isSuccess,
    createdThumbnailUrl,
    previousStep,
    reset,
  } = useMobileAddProductStore();

  const methods = useForm<ProductFormData>({
    defaultValues: {
      nameAr: '',
      nameEn: '',
      description: '',
      descriptionAr: '',
      basePrice: '',
      comparePrice: '',
      sku: '',
      images: [],
      existingImages: [],
      optionsMeta: [],
      variantsMeta: [],
      categoryId: '',
    },
  });

  // Populate form + store when product data arrives in edit mode
  useEffect(() => {
    if (isEdit && productData) {
      methods.reset(productData);
      const store = useMobileAddProductStore.getState();
      productData.sizes?.forEach((s) => store.addSize(s));
      productData.colors?.forEach((c) => store.addColor(c));
      store.setQuantity(productData.quantity ?? 0);
      store.setIsActive(productData.enabled ?? true);
    }
  }, [isEdit, productData, methods]);

  const handleBack = () => (step > 1 ? previousStep() : navigate(-1));

  const handleDone = () => {
    reset();
    methods.reset();
    navigate('/management');
  };

  const stepTitles: Record<number, string> = {
    1: t('addProduct.mobile.basicInfo', 'Basic Information'),
    2: t('addProduct.mobile.inventory', 'Variants & Inventory'),
    3: t('addProduct.mobile.reviewPublish', 'Review & Publish'),
  };

  if (isEdit && isProductLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-gray-900" />
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <div
        className="flex h-full flex-col bg-white font-sans"
        dir={isArabic ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3.5 bg-white">
          <button
            type="button"
            onClick={handleBack}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 transition"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h1 className="text-base font-bold text-gray-900">
            {isEdit
              ? t('addProduct.mobile.editProduct', 'Edit Product')
              : t('addProduct.mobile.addProduct')}
          </h1>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 py-5">
          {/* Step indicator */}
          <MobileStepIndicator />

          {/* Step title */}
          {step < 3 && (
            <h2 className="mb-5 text-lg font-bold text-gray-900">
              {stepTitles[step]}
            </h2>
          )}

          {/* Step content */}
          {step === 1 && <MobileBasicInfoStep />}

          {step === 2 && <MobileInventoryStep />}

          {step === 3 && <MobileReviewStep productId={productId} />}
        </div>

        {/* Popups */}
        {isLoading && <MobileLoadingPopup />}
        {isSuccess && (
          <MobileSuccessPopup
            onClose={handleDone}
            thumbnailUrl={createdThumbnailUrl}
          />
        )}
      </div>
    </FormProvider>
  );
};

export default MobileAddProduct;
