import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createProductFull, updateProductFull, setProductThumbnail } from '../../services/products';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import type { ApiAxiosError, ValidationErrorItem } from '../../types/api';
import axios from 'axios';

interface UseSaveProductOptions {
  isEdit: boolean;
  productId?: string;
}

export const useSaveProduct = ({ isEdit, productId }: UseSaveProductOptions) => {
  const queryClient = useQueryClient();
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  return useMutation({
    mutationFn: async (formData: FormData) => {
      let rawResponse: unknown;

      if (isEdit && productId) {
        rawResponse = await updateProductFull(productId, formData);
      } else {
        rawResponse = await createProductFull(formData);
      }

      const unwrapped: any =
        rawResponse && typeof rawResponse === 'object' && 'success' in rawResponse && 'data' in rawResponse
          ? (rawResponse as { data: unknown }).data
          : rawResponse;

      const targetId = productId || unwrapped?.id;
      const firstImageId = unwrapped?.images?.[0]?.id;

      if (targetId && firstImageId) {
        try {
          await setProductThumbnail(targetId, firstImageId);
        } catch (thumbError) {
          console.error('Failed to set thumbnail automatically:', thumbError);
        }
      }

      return unwrapped;
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      if (productId) {
        queryClient.invalidateQueries({ queryKey: ['product', productId] });
      }
      toast.success(
        isEdit
          ? (isRtl ? 'تم تحديث المنتج بنجاح!' : 'Product updated successfully!')
          : (isRtl ? 'تم نشر المنتج بنجاح!' : 'Product published successfully!')
      );
    },
    onError: (error: unknown) => {
      console.error('Save product API error:', error);
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
      const fallbackMsg = isEdit
        ? (isRtl ? 'فشل تحديث المنتج. يرجى التحقق من المدخلات.' : 'Failed to update product. Please verify inputs.')
        : (isRtl ? 'فشل نشر المنتج. يرجى التحقق من المدخلات.' : 'Failed to publish product. Please verify inputs.');

      toast.error(mainMsg ? `${fallbackMsg} (${mainMsg})` : fallbackMsg);
    },
  });
};
