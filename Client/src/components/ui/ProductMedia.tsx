import { type ChangeEvent, useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useFormContext } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import type { ProductFormData } from '../../features/AddProducts/types';
import { compressImage } from '../../features/AddProducts/utils';
import { deleteProductImage } from '../../services/products';
import { useParams } from 'react-router-dom';

interface PreviewImage {
  id: string;
  file?: File;
  preview: string;
  isExisting?: boolean;
  imageId?: string;
}

const ProductMedia = () => {
  const { t } = useTranslation();
  const { setValue, watch } = useFormContext<ProductFormData>();
  const { productId } = useParams<{ productId: string }>();
  const queryClient = useQueryClient();
  const files = watch('images') || [];
  const existingImages = watch('existingImages') || [];
  const [previews, setPreviews] = useState<PreviewImage[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});

  const filesKey = files.map((f) => `${f.name}-${f.size}`).join(',');
  const existingKey = existingImages.map((img) => img.id).join(',');

  const deleteMutation = useMutation({
    mutationFn: ({ pid, imageId }: { pid: string; imageId: string }) =>
      deleteProductImage(pid, imageId),
    onSuccess: () => {
      if (productId) {
        queryClient.invalidateQueries({ queryKey: ['product', productId] });
        queryClient.invalidateQueries({ queryKey: ['products'] });
      }
      toast.success(t('addProduct.imageDeleted', 'Image deleted successfully'));
    },
    onError: (err) => {
      console.error('Failed to delete image:', err);
      toast.error(t('addProduct.imageDeleteFailed', 'Failed to delete image'));
    },
    onSettled: () => setDeletingId(null),
  });

  useEffect(() => {
    const newPreviews: PreviewImage[] = [
      ...existingImages.map((img) => ({
        id: `existing-${img.id}`,
        preview: img.url,
        isExisting: true,
        imageId: img.id,
      })),
      ...files.map((file) => ({
        id:
          typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : Math.random().toString(36).substring(2, 9) + Date.now(),
        file,
        preview: URL.createObjectURL(file),
      })),
    ];

    setPreviews(newPreviews);

    return () => {
      newPreviews.forEach((image) => {
        if (!image.isExisting) {
          URL.revokeObjectURL(image.preview);
        }
      });
    };
  }, [filesKey, existingKey]);

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
        }, 150);
      }
    });
  }, [filesKey]);

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(e.target.files || []);
    if (uploadedFiles.length === 0) return;
    setIsCompressing(true);
    try {
      const compressed = await Promise.all(
        uploadedFiles.map((file) => compressImage(file))
      );
      setValue('images', [...files, ...compressed], {
        shouldValidate: true,
      });
    } catch (error) {
      console.error('Failed to compress images:', error);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleDelete = (indexToDelete: number) => {
    const preview = previews[indexToDelete];
    if (!preview) return;

    if (preview.isExisting && preview.imageId) {
      // Delete from backend via dedicated endpoint
      if (productId) {
        setDeletingId(preview.imageId);
        deleteMutation.mutate(
          { pid: productId, imageId: preview.imageId },
          {
            onSuccess: () => {
              const updated = existingImages.filter(
                (img) => img.id !== preview.imageId
              );
              setValue('existingImages', updated, { shouldValidate: true });
            },
          }
        );
      } else {
        const updated = existingImages.filter(
          (img) => img.id !== preview.imageId
        );
        setValue('existingImages', updated, { shouldValidate: true });
      }
    } else if (preview.file) {
      const updatedFiles = files.filter(
        (f) =>
          `${f.name}-${f.size}` !==
          `${preview.file!.name}-${preview.file!.size}`
      );
      setValue('images', updatedFiles, { shouldValidate: true });
    }
  };

  return (
    <div>
      <h5 className="mb-4 font-semibold">{t('addProduct.productMedia')}</h5>

      <input
        id="images"
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={handleUpload}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {previews.map((image, index) => {
          const isThumbnail =
            image.isExisting &&
            existingImages.find((img) => img.id === image.imageId)?.isThumbnail;
          const isDeleting =
            image.imageId != null && deletingId === image.imageId;

          const key = image.file ? `${image.file.name}-${image.file.size}` : '';
          const currentProgress =
            key && progressMap[key] !== undefined ? progressMap[key] : 100;
          const isUploading = currentProgress < 100;

          return (
            <div key={image.id} className="relative h-28 w-full sm:h-24 group">
              <img
                src={image.preview}
                alt=""
                className={`h-full w-full rounded-xl object-cover transition ${
                  isDeleting || isUploading ? 'opacity-40' : ''
                }`}
              />

              {isThumbnail && (
                <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
                  Thumbnail
                </span>
              )}

              {isDeleting && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                </div>
              )}

              {isUploading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-black/55 text-white p-1">
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

        {isCompressing && (
          <div className="relative h-28 w-full sm:h-24 flex items-center justify-center rounded-xl bg-gray-100 border border-gray-200">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-900 border-t-transparent" />
          </div>
        )}

        <label
          htmlFor="images"
          className="flex h-28 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-gray-300 sm:h-24 bg-[#E9E9E9]"
        >
          <Plus />
        </label>
      </div>
    </div>
  );
};

export default ProductMedia;
