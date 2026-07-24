import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import type { AddProductStep, ProductFormData } from './types';
import { getProductThumbnail, mapFormToMultipartFormData } from './utils';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { useCategories } from '../../hooks/useCategories';
import { useProduct } from './useProduct';
import { useSaveProduct } from './useSaveProduct';

const defaultFormValues: ProductFormData = {
  nameAr: '',
  nameEn: '',
  description: '',
  basePrice: '',
  comparePrice: '',
  sku: '',
  images: [],
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
  const { productId } = useParams<{ productId: string }>();
  const isEdit = Boolean(productId);

  const { isMobile } = useBreakpoint();
  const { categories: categoriesList } = useCategories();
  const { data: fetchedProductData, isLoading: isProductLoading } = useProduct(productId);
  const { mutate: saveProduct, isPending } = useSaveProduct({ isEdit, productId });

  const [step, setStep] = useState<AddProductStep>('form');
  const [createdThumbnail, setCreatedThumbnail] = useState<string | undefined>(undefined);

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
  const makeAdder = (fieldName: 'categories' | 'sizes' | 'colors') => (value: string) => {
    const prev = methods.getValues(fieldName) || [];
    methods.setValue(fieldName, [...prev, value]);
  };

  const makeRemover = (fieldName: 'categories' | 'sizes' | 'colors') => (index: number) => {
    const prev = methods.getValues(fieldName) || [];
    methods.setValue(fieldName, prev.filter((_, i) => i !== index));
  };

  // Form submission handler -> transition to Review step
  const onSubmit = () => {
    setStep('review');
  };

  // Publish / Save handler -> execute saveProduct mutation and transition to Success step
  const handlePublish = async () => {
    const data = methods.getValues();
    const multipartData = mapFormToMultipartFormData(data);

    saveProduct(multipartData, {
      onSuccess: (response: unknown) => {
        const thumbnail = getProductThumbnail(response, data.images?.[0]);
        if (thumbnail) {
          setCreatedThumbnail(thumbnail);
        }
        setStep('success');
      },
    });
  };

  const handleCloseSuccess = () => {
    setStep('form');
    navigate('/');
  };

  return {
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
  };
};
