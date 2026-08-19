import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import type { AddProductStep, ProductFormData } from './types';
import { getProductThumbnail, mapFormToMultipartFormData } from './utils';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { useCategories } from '../../hooks/useCategories';
import { useProduct } from './useProduct';
import { useSaveProduct } from './useSaveProduct';
import { deleteProductOptionValue } from '../../services/products';
import toast from 'react-hot-toast';

const defaultFormValues: ProductFormData = {
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
  enabled: true,
  quantity: 0,
  categories: [],
  sizes: [],
  colors: [],
};

export const useAddProductPage = () => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { productId } = useParams<{ productId: string }>();
  const isEdit = Boolean(productId);

  const { isMobile } = useBreakpoint();
  const { categories: categoriesList } = useCategories();
  const { data: fetchedProductData, isLoading: isProductLoading } =
    useProduct(productId);
  const { mutate: saveProduct, isPending } = useSaveProduct({
    isEdit,
    productId,
  });

  const rawState = searchParams.get('state')?.toLowerCase();
  const isPreviewState =
    rawState === 'preview' || rawState === 'prevewiw' || rawState === 'review';

  const [isSuccessStep, setIsSuccessStep] = useState(false);

  const step: AddProductStep = isSuccessStep
    ? 'success'
    : isPreviewState
      ? 'review'
      : 'form';

  // Set default query parameter state=add if no state is specified (Only for Add Product, not Edit Product)
  useEffect(() => {
    if (!isEdit && !searchParams.has('state')) {
      navigate('/add-product?state=add', { replace: true });
    }
  }, [isEdit, searchParams, navigate]);

  const setStep = (newStep: AddProductStep) => {
    if (newStep === 'success') {
      setIsSuccessStep(true);
    } else if (newStep === 'review') {
      setIsSuccessStep(false);
      navigate(
        isEdit
          ? `/edit-product/${productId}?state=preview`
          : '/add-product?state=preview'
      );
    } else if (newStep === 'form') {
      setIsSuccessStep(false);
      navigate(
        isEdit ? `/edit-product/${productId}` : '/add-product?state=add'
      );
    }
  };
  const [createdThumbnail, setCreatedThumbnail] = useState<string | undefined>(
    undefined
  );

  const methods = useForm<ProductFormData>({
    defaultValues: defaultFormValues,
  });

  // Populate form cleanly using reset() when edit data is fetched (Requirement 4)
  useEffect(() => {
    if (isEdit && fetchedProductData) {
      methods.reset(fetchedProductData);
    }
  }, [isEdit, fetchedProductData, methods]);

  // Watched form fields for UI state
  const enabled = methods.watch('enabled') ?? true;
  const quantity = methods.watch('quantity') ?? 0;
  const sizes = methods.watch('sizes') ?? [];
  const colors = methods.watch('colors') ?? [];
  const categoryId = methods.watch('categoryId') ?? '';

  // Derived category label memoized for performance (Requirement 7)
  const selectedCategory = useMemo(() => {
    return Array.isArray(categoriesList)
      ? categoriesList.find((c) => c.id === categoryId)
      : undefined;
  }, [categoriesList, categoryId]);

  const categories = useMemo(() => {
    if (!selectedCategory) return [];
    return [isArabic ? selectedCategory.nameAr : selectedCategory.name];
  }, [selectedCategory, isArabic]);

  // Helper creators for array fields
  const makeAdder =
    (fieldName: 'categories' | 'sizes' | 'colors') => (value: string) => {
      const prev = methods.getValues(fieldName) || [];
      methods.setValue(fieldName, [...prev, value]);
    };

  const makeRemover =
    (fieldName: 'categories' | 'sizes' | 'colors') => async (index: number) => {
      const prev = methods.getValues(fieldName) || [];
      const value = prev[index];

      if (
        isEdit &&
        productId &&
        (fieldName === 'sizes' || fieldName === 'colors')
      ) {
        const optionName = fieldName === 'sizes' ? 'size' : 'color';
        const option = methods
          .getValues('optionsMeta')
          ?.find((item) => item.name.trim().toLowerCase() === optionName);
        const optionValue = option?.values.find(
          (item) =>
            item.value.trim().toLowerCase() === value.trim().toLowerCase() ||
            item.valueAr.trim().toLowerCase() === value.trim().toLowerCase()
        );

        if (option?.id && optionValue?.id) {
          const isUsedByVariant = methods
            .getValues('variantsMeta')
            ?.some((variant) =>
              variant.optionValueIds.includes(optionValue.id)
            );

          if (isUsedByVariant) {
            toast.error(
              isArabic
                ? 'لا يمكن حذف هذه القيمة لأنها مستخدمة في نوع منتج. يجب حذف النوع المرتبط أولاً.'
                : 'This value is used by a variant. Delete the linked variant first.'
            );
            return;
          }

          try {
            await deleteProductOptionValue(
              productId,
              option.id,
              optionValue.id
            );
          } catch (error) {
            toast.error(
              error instanceof Error
                ? error.message
                : 'Failed to delete option value'
            );
            return;
          }
        }
      }

      methods.setValue(
        fieldName,
        prev.filter((_, i) => i !== index)
      );
    };

  // Form submission handler -> transition to Review step
  const onSubmit = () => {
    const values = methods.getValues();
    const cards = values.varianceCards || [];

    // Validate prices for variance cards
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const baseNum = parseFloat(card.basePrice);
      if (!card.basePrice || isNaN(baseNum) || baseNum <= 0) {
        toast.error(
          t(
            'addProduct.errors.basePriceRequired',
            'Base price is required for all variants and must be greater than 0'
          )
        );
        return;
      }

      if (card.comparePrice && card.comparePrice.trim() !== '') {
        const compareNum = parseFloat(card.comparePrice);
        if (!isNaN(compareNum) && compareNum > 0 && compareNum <= baseNum) {
          toast.error(
            t(
              'addProduct.errors.comparePriceMustBeGreater',
              'Compare-at price must be greater than base price'
            )
          );
          return;
        }
      }
    }

    setStep('review');
  };

  // Publish / Save handler -> execute saveProduct mutation and transition to Success step
  const handlePublish = async () => {
    const data = methods.getValues();
    const multipartData = mapFormToMultipartFormData(data);

    saveProduct(
      { formData: multipartData, productFormData: data },
      {
        onSuccess: (response: unknown) => {
          const thumbnail = getProductThumbnail(response, data.images?.[0]);
          if (thumbnail) {
            setCreatedThumbnail(thumbnail);
          }
          setStep('success');
        },
      }
    );
  };

  const handleCloseSuccess = () => {
    setStep('form');
    if (isEdit && productId) {
      navigate(`/product-details/${productId}`);
    } else {
      navigate('/');
    }
  };

  const handleCancel = () => {
    if (isEdit && productId) {
      navigate(`/product-details/${productId}`);
    } else {
      navigate('/');
    }
  };

  return {
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
    sizes,
    colors,
    categories,
    makeAdder,
    makeRemover,
    onSubmit,
    handlePublish,
    handleCloseSuccess,
    handleCancel,
  };
};
