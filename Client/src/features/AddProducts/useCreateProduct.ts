import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createProductFull,
  setProductThumbnail,
  uploadProductImage,
} from '../../services/products';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import type { ApiAxiosError, ValidationErrorItem } from '../../types/api';
import axios from 'axios';

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const rawResponse = await createProductFull(formData);

      // Unwrap if the response is in a { success: boolean, data: T } envelope
      const unwrapped: any =
        rawResponse &&
        typeof rawResponse === 'object' &&
        'success' in rawResponse &&
        'data' in rawResponse
          ? rawResponse.data
          : rawResponse;

      const productId = unwrapped?.id;
      const hasImagesFromBackend =
        Array.isArray(unwrapped?.images) && unwrapped.images.length > 0;

      if (productId && !hasImagesFromBackend) {
        const pendingImages = formData.getAll('images');
        if (pendingImages && pendingImages.length > 0) {
          const filesToUpload = pendingImages.filter(
            (f): f is File => f instanceof File
          );
          if (filesToUpload.length > 0) {
            try {
              const uploadedResults = await Promise.all(
                filesToUpload.map((file) => uploadProductImage(productId, file))
              );
              const formattedNewImages = uploadedResults.map((res: any) => ({
                id: res.id || res.imageId,
                url: res.url || res.imageUrl,
                isThumbnail: Boolean(res.isThumbnail),
              }));
              unwrapped.images = formattedNewImages;
            } catch (imgErr) {
              console.error('Failed to upload images after creation:', imgErr);
            }
          }
        }
      }

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products-manage'] });
      toast.success(
        isRtl ? 'تم نشر المنتج بنجاح!' : 'Product published successfully!'
      );
    },
    onError: (error: unknown) => {
      console.error('Create product API error:', error);
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
        ? 'فشل نشر المنتج. يرجى التحقق من المدخلات.'
        : 'Failed to publish product. Please verify inputs.';

      toast.error(mainMsg ? `${fallbackMsg} (${mainMsg})` : fallbackMsg);
    },
  });
};
