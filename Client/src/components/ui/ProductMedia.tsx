import { type ChangeEvent, useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useFormContext } from 'react-hook-form';
import type { ProductFormData } from '../../features/AddProducts/types';
import { compressImage } from '../../features/AddProducts/utils';

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
  const files = watch('images') || [];
  const existingImages = watch('existingImages') || [];
  const [previews, setPreviews] = useState<PreviewImage[]>([]);

  const filesKey = files.map((f) => `${f.name}-${f.size}`).join(',');
  const existingKey = existingImages.map((img) => img.id).join(',');

  useEffect(() => {
    const newPreviews: PreviewImage[] = [
      ...existingImages.map((img) => ({
        id: `existing-${img.id}`,
        preview: img.url,
        isExisting: true,
        imageId: img.id,
      })),
      ...files.map((file) => ({
        id: crypto.randomUUID(),
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

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(e.target.files || []);
    const compressed = await Promise.all(
      uploadedFiles.map((file) => compressImage(file))
    );
    setValue('images', [...files, ...compressed], {
      shouldValidate: true,
    });
  };

  const handleDelete = (indexToDelete: number) => {
    const preview = previews[indexToDelete];
    if (!preview) return;

    if (preview.isExisting && preview.imageId) {
      const updated = existingImages.filter(
        (img) => img.id !== preview.imageId
      );
      setValue('existingImages', updated, { shouldValidate: true });
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

          return (
            <div key={image.id} className="relative h-28 w-full sm:h-24 group">
              <img
                src={image.preview}
                alt=""
                className="h-full w-full rounded-xl object-cover"
              />

              {isThumbnail && (
                <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
                  Thumbnail
                </span>
              )}

              <button
                type="button"
                onClick={() => handleDelete(index)}
                className="absolute -top-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-md transition hover:bg-red-600 active:scale-95 cursor-pointer z-10"
              >
                <Trash2 size={12} />
              </button>
            </div>
          );
        })}

        <label
          htmlFor="images"
          className="flex h-28 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-gray-300 sm:h-24"
        >
          <Plus />
        </label>
      </div>
    </div>
  );
};

export default ProductMedia;
