import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  updateProductFull,
  setProductThumbnail,
  updateProductVariant,
} from '../../services/products';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import type { ApiAxiosError, ValidationErrorItem } from '../../types/api';
import axios from 'axios';

interface UpdateProductArgs {
  productId: string;
  formData: FormData;
  variants?: {
    id: string;
    price?: number;
    compareAtPrice?: number;
    stock?: number;
    isActive?: boolean;
  }[];
}

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  return useMutation({
    mutationFn: async ({ productId, formData, variants }: UpdateProductArgs) => {
      // 1. Update product basic info (name, description, category, images, ...)
      const rawResponse = await updateProductFull(productId, formData);

      const unwrapped =
        rawResponse && typeof rawResponse === 'object' && 'success' in rawResponse && 'data' in rawResponse
          ? rawResponse.data
          : rawResponse;

      // 2. Update each variant's price/stock via the dedicated variant endpoint
      if (variants && variants.length > 0) {
        await Promise.all(
          variants.map((v) =>
            v.id
              ? updateProductVariant(productId, v.id, {
                  price: v.price,
                  compareAtPrice: v.compareAtPrice,
                  stock: v.stock,
                  isActive: v.isActive,
                })
              : Promise.resolve()
          )
        );
      }

      // 3. Set the thumbnail (prefer the image marked asThumbnail)
      const thumbnailImg = unwrapped?.images?.find((img: any) => img.isThumbnail);
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
      queryClient.invalidateQueries({ queryKey: ['product', variables.productId] });
      queryClient.invalidateQueries({ queryKey: ['product-details', variables.productId] });
      toast.success(
        isRtl
          ? 'تم تحديث المنتج بنجاح!'
          : 'Product updated successfully!'
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
        const details = apiError.validation || apiError.details || apiError.errors;
        if (Array.isArray(details)) {
          detailsMsg = details.map((d: ValidationErrorItem) => `${d.field || d.property || 'field'}: ${d.issue || d.message || 'invalid'}`).join(', ');
        } else if (details && typeof details === 'object') {
          detailsMsg = Object.entries(details).map(([k, v]) => `${k}: ${v}`).join(', ');
        }
      }

      const mainMsg = (typeof apiError === 'object' ? apiError?.message : null) || responseData?.message || detailsMsg || (error instanceof Error ? error.message : '');
      const fallbackMsg = isRtl
        ? 'فشل تحديث المنتج. يرجى التحقق من المدخلات.'
        : 'Failed to update product. Please verify inputs.';

      toast.error(mainMsg ? `${fallbackMsg} (${mainMsg})` : fallbackMsg);
    },
  });
};
