import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createProductFull,
  createProductVariant,
  getProductById,
  updateProductFull,
  setProductThumbnail,
  updateProductVariant,
  uploadProductImage,
  uploadProductSizeChart,
} from '../../services/products';
import {
  buildProductVariantMutations,
  ensureVendorAttributesAndValues,
  mapFormToMultipartFormData,
  syncProductOptions,
} from './utils';
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
  formData?: FormData;
  productFormData: ProductFormData;
}

export function useSaveProduct({ isEdit, productId }: UseSaveProductOptions) {
  const queryClient = useQueryClient();
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  return useMutation({
    mutationFn: async ({ formData, productFormData }: SaveProductArgs) => {
      let rawResponse: unknown;

      let enrichedFormData = productFormData;
      try {
        const result = await ensureVendorAttributesAndValues(productFormData);
        enrichedFormData = result.formData;
      } catch (attrErr) {
        console.warn(
          'Failed ensuring vendor attributes before product save:',
          attrErr
        );
      }

      const multipartToSend = mapFormToMultipartFormData(enrichedFormData);

      if (isEdit && productId) {
        const updatePayload = {
          name: enrichedFormData.nameEn || enrichedFormData.nameAr || '',
          nameAr: enrichedFormData.nameAr || enrichedFormData.nameEn || '',
          categoryId: enrichedFormData.categoryId || '',
          description: enrichedFormData.description || '',
          descriptionAr:
            enrichedFormData.descriptionAr ||
            enrichedFormData.description ||
            '',
        };

        rawResponse = await updateProductFull(productId, updatePayload);

        try {
          const latestProduct = await getProductById(productId);
          await syncProductOptions(productId, enrichedFormData, latestProduct);
          const productWithSyncedOptions = await getProductById(productId);
          const variantMutations = buildProductVariantMutations(
            enrichedFormData,
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
      } else {
        rawResponse = await createProductFull(multipartToSend);
      }

      const unwrapped: any =
        rawResponse &&
        typeof rawResponse === 'object' &&
        'success' in rawResponse &&
        'data' in rawResponse
          ? (rawResponse as { data: unknown }).data
          : rawResponse;

      const targetId = productId || unwrapped?.id;

      // Post-creation sync for new products to guarantee options and variants are created
      if (!isEdit && targetId) {
        try {
          const latestProduct = await getProductById(targetId);
          const hasOptions =
            Array.isArray(latestProduct?.options) &&
            latestProduct.options.length > 0;
          const hasVariants =
            Array.isArray(latestProduct?.variants) &&
            latestProduct.variants.length > 0;
          const hasCards =
            Array.isArray(enrichedFormData.varianceCards) &&
            enrichedFormData.varianceCards.length > 0;

          if (hasCards && (!hasOptions || !hasVariants)) {
            await syncProductOptions(targetId, enrichedFormData, latestProduct);
            const productWithSyncedOptions = await getProductById(targetId);
            const variantMutations = buildProductVariantMutations(
              enrichedFormData,
              productWithSyncedOptions
            );

            await Promise.all(
              variantMutations.map((variant) =>
                createProductVariant(targetId, {
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
          }
        } catch (syncErr) {
          console.warn('Post-creation sync options/variants error:', syncErr);
        }
      }

      // Only upload images manually if backend createProductFull didn't process them
      const hasImagesFromBackend =
        Array.isArray(unwrapped?.images) && unwrapped.images.length > 0;

      if (!isEdit && targetId && !hasImagesFromBackend) {
        const pendingImages = multipartToSend.getAll('images');
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

      // Fallback: upload size charts if backend createProductFull didn't attach them
      const hasSizeChartsFromBackend =
        Array.isArray(unwrapped?.sizeChartImages) &&
        unwrapped.sizeChartImages.length > 0;

      if (!isEdit && targetId && !hasSizeChartsFromBackend) {
        const pendingSizeCharts =
          enrichedFormData.sizeChartImages &&
          enrichedFormData.sizeChartImages.length > 0
            ? enrichedFormData.sizeChartImages
            : (multipartToSend
                .getAll('sizeChart')
                .filter((f): f is File => f instanceof File) as File[]);

        if (pendingSizeCharts.length > 0) {
          try {
            const uploadedCharts = await Promise.all(
              pendingSizeCharts.map((file) =>
                uploadProductSizeChart(targetId, file)
              )
            );
            unwrapped.sizeChartImages = uploadedCharts;
          } catch (chartErr) {
            console.error(
              'Failed to upload size chart images after creation:',
              chartErr
            );
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
      queryClient.invalidateQueries({
        queryKey: ['dashboardInventoryProductsMap'],
      });
      queryClient.invalidateQueries({
        queryKey: ['dashboardTopSellingProducts'],
      });
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
