import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProductFull, setProductThumbnail } from '../../services/products';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import type { ApiAxiosError, ValidationErrorItem } from '../../types/api';
import axios from 'axios';

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  return useMutation({
    mutationFn: async ({ productId, formData }: { productId: string; formData: FormData }) => {
      const rawResponse = await updateProductFull(productId, formData);

      const unwrapped =
        rawResponse && typeof rawResponse === 'object' && 'success' in rawResponse && 'data' in rawResponse
          ? rawResponse.data
          : rawResponse;

      const firstImageId = unwrapped?.images?.[0]?.id;
      if (productId && firstImageId) {
        try {
          await setProductThumbnail(productId, firstImageId);
        } catch (thumbError) {
          console.error('Failed to set thumbnail automatically:', thumbError);
        }
      }

      return unwrapped;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', variables.productId] });
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
