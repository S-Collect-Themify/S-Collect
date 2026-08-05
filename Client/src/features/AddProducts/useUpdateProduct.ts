import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createProductVariant,
  getProductById,
  updateProductFull,
  setProductThumbnail,
  updateProductVariant,
} from '../../services/products';
import { buildProductVariantMutations, syncProductOptions } from './utils';
import type { ProductFormData } from './types';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import type { ApiAxiosError, ValidationErrorItem } from '../../types/api';
import axios from 'axios';

interface UpdateProductArgs {
  productId: string;
  formData: FormData;
  productFormData: ProductFormData;
}

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  return useMutation({
    mutationFn: async ({
      productId,
      formData,
      productFormData,
    }: UpdateProductArgs) => {
      const productForm = new FormData();
      formData.forEach((value, key) => {
        if (key !== 'options' && key !== 'variants') {
          productForm.append(key, value);
        }
      });
      const rawResponse = await updateProductFull(productId, productForm);

      const unwrapped =
        rawResponse &&
        typeof rawResponse === 'object' &&
        'success' in rawResponse &&
        'data' in rawResponse
          ? rawResponse.data
          : rawResponse;

      const latestProduct = await getProductById(productId);
      await syncProductOptions(productId, productFormData, latestProduct);
      const productWithSyncedOptions = await getProductById(productId);
      const variantMutations = buildProductVariantMutations(
        productFormData,
        productWithSyncedOptions
      );
      console.log(
        'Product variant requests:',
        variantMutations.map((variant) => ({
          method: variant.id ? 'PATCH' : 'POST',
          variantId: variant.id,
          body: variant.id
            ? {
                price: variant.price,
                compareAtPrice: variant.compareAtPrice,
                stock: variant.stock,
                isActive: variant.isActive,
              }
            : {
                optionValueIds: variant.optionValueIds,
                sku: variant.sku,
                price: variant.price,
                stock: variant.stock,
                compareAtPrice: variant.compareAtPrice,
              },
        }))
      );

      await Promise.all(
        variantMutations.map((variant) =>
          variant.id
            ? updateProductVariant(productId, variant.id, {
                price: variant.price,
                compareAtPrice: variant.compareAtPrice,
                stock: variant.stock,
                isActive: variant.isActive,
              })
            : createProductVariant(productId, {
                optionValueIds: variant.optionValueIds,
                sku: variant.sku,
                price: variant.price,
                compareAtPrice: variant.compareAtPrice,
                stock: variant.stock,
              })
        )
      );

      // 3. Set the thumbnail (prefer the image marked asThumbnail)
      const thumbnailImg = unwrapped?.images?.find(
        (img: any) => img.isThumbnail
      );
      const thumbnailImageId = thumbnailImg?.id || unwrapped?.images?.[0]?.id;
      if (productId && thumbnailImageId) {
        try {
          await setProductThumbnail(productId, thumbnailImageId);
        } catch (thumbError) {
          console.error('Failed to set thumbnail automatically:', thumbError);
        }
      }

      return unwrapped;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({
        queryKey: ['product', variables.productId],
      });
      queryClient.invalidateQueries({
        queryKey: ['product-details', variables.productId],
      });
      toast.success(
        isRtl ? 'تم تحديث المنتج بنجاح!' : 'Product updated successfully!'
      );
    },
    onError: (error: unknown) => {
      console.error('Update product API error:', error);
      const isAx = axios.isAxiosError(error);
      const axiosError = isAx ? (error as ApiAxiosError) : null;
      const responseData = axiosError?.response?.data;
      const apiError = responseData?.error || responseData;
      let detailsMsg = '';

      if (apiError && typeof apiError === 'object') {
        const details =
          apiError.validation || apiError.details || apiError.errors;
        if (Array.isArray(details)) {
          detailsMsg = details
            .map(
              (d: ValidationErrorItem) =>
                `${d.field || d.property || 'field'}: ${d.issue || d.message || 'invalid'}`
            )
            .join(', ');
        } else if (details && typeof details === 'object') {
          detailsMsg = Object.entries(details)
            .map(([k, v]) => `${k}: ${v}`)
            .join(', ');
        }
      }

      const mainMsg =
        (typeof apiError === 'object' ? apiError?.message : null) ||
        responseData?.message ||
        detailsMsg ||
        (error instanceof Error ? error.message : '');
      const fallbackMsg = isRtl
        ? 'فشل تحديث المنتج. يرجى التحقق من المدخلات.'
        : 'Failed to update product. Please verify inputs.';

      toast.error(mainMsg ? `${fallbackMsg} (${mainMsg})` : fallbackMsg);
    },
  });
};
