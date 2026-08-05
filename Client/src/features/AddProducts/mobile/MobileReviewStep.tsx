import { useTranslation } from 'react-i18next';
import { useFormContext } from 'react-hook-form';
import { CircleCheckBig } from 'lucide-react';
import type { ProductFormData } from '../types';
import { useMobileAddProductStore } from './mobileAddProductStore';
import { mapFormToMultipartFormData } from '../utils';
import { useCreateProduct } from '../useCreateProduct';
import { useUpdateProduct } from '../useUpdateProduct';

const STEPS = [
  { key: 'basicInfo', label: 'Basic Info' },
  { key: 'categorization', label: 'Categorization' },
  { key: 'pricing', label: 'Pricing' },
  { key: 'inventory', label: 'Inventory' },
  { key: 'review', label: 'Review' },
];

interface MobileReviewStepProps {
  productId?: string;
}

const MobileReviewStep = ({ productId }: MobileReviewStepProps) => {
  const { t } = useTranslation();
  const { watch } = useFormContext<ProductFormData>();
  const formData = watch();
  const { mutate: createProduct } = useCreateProduct();
  const { mutate: updateProduct } = useUpdateProduct();
  const isEdit = !!productId;

  const { categories, quantity, sizes, colors, previousStep } =
    useMobileAddProductStore();

  const thumbnailImage =
    formData.existingImages?.find((img) => img.isThumbnail) ||
    formData.existingImages?.[0];
  const newImageFile = formData.images?.[0];
  const thumbnailSrc =
    thumbnailImage?.url ||
    (newImageFile ? URL.createObjectURL(newImageFile) : undefined);

  const handlePublish = () => {
    useMobileAddProductStore.setState({ isLoading: true });
    const productFormData = {
      ...formData,
      sizes,
      colors,
      quantity,
    };
    const multipartData = mapFormToMultipartFormData(productFormData);

    const onSuccess = (response: any) => {
      const thumbnail =
        response?.images?.find((img: any) => img.isThumbnail)?.url ||
        response?.images?.[0]?.url ||
        response?.thumbnailUrl;
      let finalThumbnail = thumbnail;
      if (!finalThumbnail) {
        const firstImageFile = formData.images?.[0];
        if (firstImageFile) {
          finalThumbnail = URL.createObjectURL(firstImageFile);
        }
      }
      useMobileAddProductStore.setState({
        isLoading: false,
        isSuccess: true,
        createdThumbnailUrl: finalThumbnail,
      });
    };

    const onError = () => {
      useMobileAddProductStore.setState({ isLoading: false });
    };

    if (isEdit && productId) {
      updateProduct(
        { productId, formData: multipartData, productFormData },
        { onSuccess, onError }
      );
    } else {
      createProduct(multipartData, { onSuccess, onError });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Product preview card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        <div className="flex gap-3">
          {/* Thumbnail */}
          <div className="h-16 w-16 shrink-0 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden">
            {thumbnailSrc ? (
              <img
                src={thumbnailSrc}
                alt={formData.nameEn || formData.nameAr || ''}
                className="h-full w-full object-cover"
              />
            ) : (
              <svg
                className="h-7 w-7 text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            )}
          </div>

          <div className="min-w-0">
            <p className="text-xs text-gray-400">Electronics</p>
            <h3 className="text-sm font-bold leading-tight truncate">
              {formData.nameEn || formData.nameAr || '—'}
            </h3>
            {formData.basePrice && (
              <p className="text-sm font-semibold text-gray-800 mt-0.5">
                ${formData.basePrice}
              </p>
            )}
          </div>
        </div>

        {/* Grid info */}
        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
          <div>
            <p className="text-gray-400 uppercase tracking-wide mb-0.5 text-[10px]">
              BRAND
            </p>
            <p className="font-semibold text-gray-800">—</p>
          </div>
          <div>
            <p className="text-gray-400 uppercase tracking-wide mb-0.5 text-[10px]">
              SKU
            </p>
            <p className="font-semibold text-gray-800 truncate">
              {formData.sku || '—'}
            </p>
          </div>
          <div>
            <p className="text-gray-400 uppercase tracking-wide mb-0.5 text-[10px]">
              STOCK
            </p>
            <p className="font-semibold text-gray-800">{quantity} units</p>
          </div>
          <div>
            <p className="text-gray-400 uppercase tracking-wide mb-0.5 text-[10px]">
              STATUS
            </p>
            <span className="inline-block rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">
              Active
            </span>
          </div>
          {formData.comparePrice && (
            <div>
              <p className="text-gray-400 uppercase tracking-wide mb-0.5 text-[10px]">
                DISCOUNT
              </p>
              <p className="font-semibold text-gray-800">
                ${formData.comparePrice}
              </p>
            </div>
          )}
          {formData.basePrice && (
            <div>
              <p className="text-gray-400 uppercase tracking-wide mb-0.5 text-[10px]">
                COST
              </p>
              <p className="font-semibold text-gray-800">
                ${formData.basePrice}
              </p>
            </div>
          )}
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <div className="mt-3">
            <p className="mb-1.5 text-[10px] uppercase tracking-wide text-gray-400">
              Categories
            </p>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((c, i) => (
                <span
                  key={i}
                  className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Step summary */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        <h5 className="mb-3 text-sm font-semibold text-gray-800">
          Step Summary
        </h5>
        <div className="space-y-2.5">
          {STEPS.map((step) => (
            <div key={step.key} className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{step.label}</span>
              <CircleCheckBig size={16} className="text-green-500" />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3 mt-1">
        <button
          type="button"
          onClick={previousStep}
          className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 active:scale-[0.98]"
        >
          {t('addProduct.previous', 'Previous')}
        </button>
        <button
          type="button"
          onClick={handlePublish}
          className="flex-1 rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 active:scale-[0.98]"
        >
          {isEdit
            ? t('addProduct.save', 'Save Changes')
            : t('addProduct.publish', 'Publish')}
        </button>
      </div>
    </div>
  );
};

export default MobileReviewStep;
