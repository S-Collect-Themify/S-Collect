import { type ChangeEvent, useEffect, useMemo, useState } from 'react';
import { FileSpreadsheet, Plus, Trash2, Maximize2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useFormContext } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import type { ProductFormData } from '../../features/AddProducts/types';
import { compressImage } from '../../features/AddProducts/utils';
import {
  deleteProductSizeChart,
  uploadProductSizeChart,
} from '../../services/products';
import { useParams } from 'react-router-dom';

interface PreviewImage {
  id: string;
  file?: File;
  preview: string;
  isExisting?: boolean;
  imageId?: string;
}

interface ProductSizeChartProps {
  isMobile?: boolean;
}

const MAX_SIZE_CHARTS = 4;

const ProductSizeChart = ({ isMobile }: ProductSizeChartProps) => {
  const { t } = useTranslation();
  const { setValue, watch } = useFormContext<ProductFormData>();
  const { productId } = useParams<{ productId: string }>();
  const queryClient = useQueryClient();

  const files = watch('sizeChartImages') || [];
  const existingImages = watch('existingSizeChartImages') || [];

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isUploadingApi, setIsUploadingApi] = useState(false);
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const [activePreviewModal, setActivePreviewModal] = useState<string | null>(
    null
  );

  const filesKey = files.map((f) => `${f.name}-${f.size}`).join(',');
  const existingKey = existingImages.map((img) => img.id).join(',');

  const deleteMutation = useMutation({
    mutationFn: ({ pid, imageId }: { pid: string; imageId: string }) =>
      deleteProductSizeChart(pid, imageId),
    onSuccess: () => {
      if (productId) {
        queryClient.invalidateQueries({ queryKey: ['product', productId] });
        queryClient.invalidateQueries({ queryKey: ['products'] });
        queryClient.invalidateQueries({
          queryKey: ['product-details', productId],
        });
      }
      toast.success(
        t(
          'addProduct.sizeChartDeleted',
          'Size chart image deleted successfully'
        )
      );
    },
    onError: (err) => {
      console.error('Failed to delete size chart image:', err);
      toast.error(
        t(
          'addProduct.sizeChartDeleteFailed',
          'Failed to delete size chart image'
        )
      );
    },
    onSettled: () => setDeletingId(null),
  });

  const previews: PreviewImage[] = useMemo(() => {
    return [
      ...existingImages.map((img) => ({
        id: `existing-chart-${img.id}`,
        preview: img.url,
        isExisting: true,
        imageId: img.id,
      })),
      ...files.map((file) => ({
        id: `${file.name}-${file.size}`,
        file,
        preview: URL.createObjectURL(file),
      })),
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filesKey, existingKey]);

  useEffect(() => {
    return () => {
      previews.forEach((image) => {
        if (!image.isExisting) {
          URL.revokeObjectURL(image.preview);
        }
      });
    };
  }, [previews]);

  useEffect(() => {
    files.forEach((file) => {
      const key = `${file.name}-${file.size}`;
      if (progressMap[key] === undefined) {
        setProgressMap((prev) => ({ ...prev, [key]: 0 }));

        let current = 0;
        const timer = setInterval(() => {
          current += Math.floor(Math.random() * 15) + 10;
          if (current >= 100) {
            current = 100;
            clearInterval(timer);
          }
          setProgressMap((prev) => ({ ...prev, [key]: current }));
        }, 120);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filesKey]);

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(e.target.files || []);
    if (uploadedFiles.length === 0) return;

    const currentCount = existingImages.length + files.length;
    if (currentCount + uploadedFiles.length > MAX_SIZE_CHARTS) {
      toast.error(
        t(
          'addProduct.maxSizeChartsExceeded',
          'You cannot upload more than 4 size chart images.'
        )
      );
      e.target.value = '';
      return;
    }

    setIsCompressing(true);
    try {
      const compressed = await Promise.all(
        uploadedFiles.map((file) => compressImage(file))
      );

      if (productId) {
        setIsUploadingApi(true);
        try {
          const uploadedResults = await Promise.all(
            compressed.map((file) => uploadProductSizeChart(productId, file))
          );
          const newExisting = uploadedResults.map((res: any) => ({
            id: res.id || res.imageId,
            url: res.url || res.imageUrl,
            isThumbnail: false,
          }));
          setValue(
            'existingSizeChartImages',
            [...existingImages, ...newExisting],
            {
              shouldValidate: true,
            }
          );
          queryClient.invalidateQueries({ queryKey: ['product', productId] });
          queryClient.invalidateQueries({ queryKey: ['products'] });
          queryClient.invalidateQueries({
            queryKey: ['product-details', productId],
          });
          toast.success(
            t(
              'addProduct.sizeChartUploaded',
              'Size chart image uploaded successfully'
            )
          );
        } catch (uploadErr) {
          console.error('Failed to upload size chart image:', uploadErr);
          toast.error(
            t(
              'addProduct.sizeChartUploadFailed',
              'Failed to upload size chart image'
            )
          );
        } finally {
          setIsUploadingApi(false);
        }
      } else {
        setValue('sizeChartImages', [...files, ...compressed], {
          shouldValidate: true,
        });
      }
    } catch (error) {
      console.error('Failed to process size chart images:', error);
    } finally {
      setIsCompressing(false);
      e.target.value = '';
    }
  };

  const handleDelete = (indexToDelete: number) => {
    const preview = previews[indexToDelete];
    if (!preview) return;

    if (preview.isExisting && preview.imageId) {
      if (productId) {
        setDeletingId(preview.imageId);
        deleteMutation.mutate(
          { pid: productId, imageId: preview.imageId },
          {
            onSuccess: () => {
              const updated = existingImages.filter(
                (img) => img.id !== preview.imageId
              );
              setValue('existingSizeChartImages', updated, {
                shouldValidate: true,
              });
            },
          }
        );
      } else {
        const updated = existingImages.filter(
          (img) => img.id !== preview.imageId
        );
        setValue('existingSizeChartImages', updated, { shouldValidate: true });
      }
    } else if (preview.file) {
      const updatedFiles = files.filter(
        (f) =>
          `${f.name}-${f.size}` !==
          `${preview.file!.name}-${preview.file!.size}`
      );
      setValue('sizeChartImages', updatedFiles, { shouldValidate: true });
    }
  };

  return (
    <div className={isMobile ? 'mt-4' : 'mt-6'}>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-gray-700" />
          <h5 className="font-semibold text-gray-900 text-sm md:text-base">
            {t('addProduct.sizeChart', 'Size Chart / Table Image')}
          </h5>
        </div>
        <span className="text-[11px] text-gray-400 font-medium">
          {previews.length}/{MAX_SIZE_CHARTS}
        </span>
      </div>

      <p className="text-xs text-gray-500 mb-3">
        {t(
          'addProduct.sizeChartDesc',
          'Upload size chart or measurement guide images for this product.'
        )}
      </p>

      <input
        id="size-chart-input"
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={handleUpload}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {previews.map((image, index) => {
          const isDeleting =
            image.imageId != null && deletingId === image.imageId;
          const key = image.file ? `${image.file.name}-${image.file.size}` : '';
          const currentProgress =
            key && progressMap[key] !== undefined ? progressMap[key] : 100;
          const isUploading = currentProgress < 100;

          return (
            <div
              key={image.id}
              className="relative h-28 w-full sm:h-24 group"
            >
              <div className="relative h-full w-full rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                <img
                  src={image.preview}
                  alt={t('addProduct.sizeChart', 'Size Chart')}
                  className={`h-full w-full object-cover transition duration-200 group-hover:scale-105 ${
                    isDeleting || isUploading ? 'opacity-40' : ''
                  }`}
                />

                {/* View enlarged button */}
                {!isDeleting && !isUploading && (
                  <button
                    type="button"
                    onClick={() => setActivePreviewModal(image.preview)}
                    className="absolute bottom-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-lg bg-black/60 text-white opacity-0 group-hover:opacity-100 transition hover:bg-black/80 cursor-pointer"
                    title={t('common.view', 'View')}
                  >
                    <Maximize2 size={12} />
                  </button>
                )}

                {isDeleting && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  </div>
                )}

                {isUploading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-black/60 text-white p-1">
                    <span className="text-[10px] font-semibold">
                      {currentProgress}%
                    </span>
                    <div className="mt-1 h-1 w-4/5 overflow-hidden rounded-full bg-white/20">
                      <div
                        className="h-full bg-white transition-all duration-150"
                        style={{ width: `${currentProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {!isDeleting && !isUploading && (
                <button
                  type="button"
                  onClick={() => handleDelete(index)}
                  className="absolute -top-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-md transition hover:bg-red-600 active:scale-95 cursor-pointer z-10"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          );
        })}

        {(isCompressing || isUploadingApi) && (
          <div className="relative h-28 w-full sm:h-24 flex items-center justify-center rounded-xl bg-gray-100 border border-gray-200">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-900 border-t-transparent" />
          </div>
        )}

        <label
          htmlFor={
            previews.length >= MAX_SIZE_CHARTS ? undefined : 'size-chart-input'
          }
          onClick={(e) => {
            if (previews.length >= MAX_SIZE_CHARTS) {
              e.preventDefault();
              toast.error(
                t(
                  'addProduct.maxSizeChartsExceeded',
                  'You cannot upload more than 4 size chart images.'
                )
              );
            }
          }}
          className={`flex h-28 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-gray-300 sm:h-24 bg-[#F7F7F8] hover:bg-gray-100 transition ${
            previews.length >= MAX_SIZE_CHARTS
              ? 'opacity-50 cursor-not-allowed'
              : ''
          }`}
        >
          <Plus size={18} className="text-gray-500" />
          <span className="text-[10px] text-gray-500 font-medium px-1 text-center">
            {t('addProduct.uploadSizeChart', 'Add Size Chart')}
          </span>
        </label>
      </div>

      {/* Full Resolution Preview Modal */}
      {activePreviewModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs"
          onClick={() => setActivePreviewModal(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-2xl bg-white p-2 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActivePreviewModal(null)}
              className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black cursor-pointer"
            >
              <X size={16} />
            </button>
            <img
              src={activePreviewModal}
              alt={t('addProduct.sizeChart', 'Size Chart Preview')}
              className="max-h-[85vh] max-w-[85vw] rounded-xl object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductSizeChart;
