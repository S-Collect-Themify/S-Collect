import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createProductFull,
  createProductVariant,
  getProductById,
  updateProductFull,
  setProductThumbnail,
  updateProductVariant,
  uploadProductImage,
} from '../../services/products';
import { buildProductVariantMutations, syncProductOptions } from './utils';
import type { ProductFormData } from './types';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import type { ApiAxiosError, ValidationErrorItem } from '../../types/api';
import axios from 'axios';

interface UseSaveProductOptions {
  isEdit: boolean;
  productId?: string;
}

interface SaveProductArgs {
  formData: FormData;
  productFormData: ProductFormData;
}

export function useSaveProduct({ isEdit, productId }: UseSaveProductOptions) {
  const queryClient = useQueryClient();
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  return useMutation({
    mutationFn: async ({ formData, productFormData }: SaveProductArgs) => {
      let rawResponse: unknown;

      if (isEdit && productId) {
        try {
          rawResponse = await updateProductFull(productId, formData);
        } catch (fullError) {
          console.warn(
            'updateProductFull with variants failed, falling back:',
            fullError
          );
          const productForm = new FormData();
          formData.forEach((value, key) => {
            if (key !== 'options' && key !== 'variants') {
              productForm.append(key, value);
            }
          });
          rawResponse = await updateProductFull(productId, productForm);

          try {
            const latestProduct = await getProductById(productId);
            await syncProductOptions(productId, productFormData, latestProduct);
            const productWithSyncedOptions = await getProductById(productId);
            const variantMutations = buildProductVariantMutations(
              productFormData,
              productWithSyncedOptions
            );

            await Promise.all(
              variantMutations.map((variant) =>
                variant.id
                  ? updateProductVariant(productId, variant.id, {
                      price: variant.price,
                      compareAtPrice: variant.compareAtPrice,
                      stock: variant.stock,
                      isActive: variant.isActive,
                    }).catch((err) => {
                      console.warn(
                        `Failed to update variant ${variant.id}:`,
                        err
                      );
                    })
                  : createProductVariant(productId, {
                      optionValueIds: variant.optionValueIds,
                      sku: variant.sku,
                      price: variant.price,
                      compareAtPrice: variant.compareAtPrice,
                      stock: variant.stock,
                    }).catch((err) => {
                      console.warn(
                        `Failed to create variant ${variant.sku}:`,
                        err
                      );
                    })
              )
            );
          } catch (syncErr) {
            console.warn('Sync options/variants error:', syncErr);
          }
        }
      } else {
        rawResponse = await createProductFull(formData);
      }

      const unwrapped: any =
        rawResponse &&
        typeof rawResponse === 'object' &&
        'success' in rawResponse &&
        'data' in rawResponse
          ? (rawResponse as { data: unknown }).data
          : rawResponse;

      const targetId = productId || unwrapped?.id;

      // Only upload images manually if backend createProductFull didn't process them
      const hasImagesFromBackend =
        Array.isArray(unwrapped?.images) && unwrapped.images.length > 0;

      if (!isEdit && targetId && !hasImagesFromBackend) {
        const pendingImages = formData.getAll('images');
        if (pendingImages && pendingImages.length > 0) {
          const filesToUpload = pendingImages.filter(
            (f): f is File => f instanceof File
          );
          if (filesToUpload.length > 0) {
            try {
              const uploadedResults = await Promise.all(
                filesToUpload.map((file) => uploadProductImage(targetId, file))
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

      // Use the image marked as thumbnail, or fall back to the first image
      const thumbnailImg = unwrapped?.images?.find(
        (img: any) => img.isThumbnail
      );
      const thumbnailImageId = thumbnailImg?.id || unwrapped?.images?.[0]?.id;

      if (targetId && thumbnailImageId) {
        try {
          await setProductThumbnail(targetId, thumbnailImageId);
        } catch (thumbError) {
          console.error('Failed to set thumbnail automatically:', thumbError);
        }
      }

      return unwrapped;
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products-manage'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardInventoryAlerts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardInventoryProductsMap'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardTopSellingProducts'] });
      if (productId) {
        queryClient.invalidateQueries({ queryKey: ['product', productId] });
        queryClient.invalidateQueries({
          queryKey: ['product-details', productId],
        });
      }
      toast.success(
        isEdit
          ? isRtl
            ? 'تم تحديث المنتج بنجاح!'
            : 'Product updated successfully!'
          : isRtl
            ? 'تم نشر المنتج بنجاح!'
            : 'Product published successfully!'
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
      const fallbackMsg = isEdit
        ? isRtl
          ? 'فشل تحديث المنتج. يرجى التحقق من المدخلات.'
          : 'Failed to update product. Please verify inputs.'
        : isRtl
          ? 'فشل نشر المنتج. يرجى التحقق من المدخلات.'
          : 'Failed to publish product. Please verify inputs.';

      toast.error(mainMsg ? `${fallbackMsg} (${mainMsg})` : fallbackMsg);
    },
  });
}
