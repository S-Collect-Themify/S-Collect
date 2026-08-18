import { useRef, useState, useEffect, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { UploadCloud, X } from 'lucide-react';
import toast from 'react-hot-toast';
import type { ProductFormData } from '../types';
import { compressImage } from '../utils';

interface PreviewImage {
  id: string;
  file: File;
  preview: string;
}

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_IMAGES = 6;

const MobileImageUploader = () => {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);

  const { setValue, watch } = useFormContext<ProductFormData>();

  const files = watch('images') || [];
  const existingImages = watch('existingImages') || [];

  const [progressMap, setProgressMap] = useState<Record<string, number>>({});

  // Use a stable key based on file names+sizes to avoid re-running on every
  // render (watch() returns a new array reference each render, which would
  // cause an infinite loop if used directly as a useEffect dependency).
  const filesKey = files.map((f) => `${f.name}-${f.size}`).join(',');

  const previews: PreviewImage[] = useMemo(() => {
    return files.map((file) => ({
      id: `${file.name}-${file.size}`,
      file,
      preview: URL.createObjectURL(file),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filesKey]);

  useEffect(() => {
    return () => {
      previews.forEach((image) => URL.revokeObjectURL(image.preview));
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
        }, 150);
      }
    });
  }, [filesKey]);

  const handleSelect = async (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const currentCount = existingImages.length + files.length;
    if (currentCount + selectedFiles.length > MAX_IMAGES) {
      toast.error(
        t(
          'addProduct.maxImagesExceeded',
          'You cannot upload more than 6 images for a product.'
        )
      );
      if (inputRef.current) inputRef.current.value = '';
      return;
    }

    const validFiles = Array.from(selectedFiles).filter((file) => {
      if (!file.type.startsWith('image/')) return false;
      if (file.size > MAX_SIZE) return false;
      return true;
    });

    const compressed = await Promise.all(
      validFiles.map((file) => compressImage(file))
    );

    setValue('images', [...files, ...compressed], {
      shouldValidate: true,
    });
  };

  const removeImage = (index: number) => {
    const updated = files.filter((_, i) => i !== index);

    setValue('images', updated, {
      shouldValidate: true,
    });
  };

  return (
    <div className="mb-6">
      {/* Upload Box */}

      <button
        type="button"
        onClick={() => {
          const currentCount = existingImages.length + files.length;
          if (currentCount >= MAX_IMAGES) {
            toast.error(
              t(
                'addProduct.maxImagesExceeded',
                'You cannot upload more than 6 images for a product.'
              )
            );
            return;
          }
          inputRef.current?.click();
        }}
        className="flex h-35 w-full flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white transition hover:bg-gray-50 cursor-pointer"
      >
        <UploadCloud className="mb-3 h-8 w-8 text-gray-400" />

        <p className="text-sm font-medium text-gray-700">
          Tap to upload photos
        </p>

        <span className="text-xs text-gray-400">JPG, PNG up to 10MB</span>
      </button>

      <input
        ref={inputRef}
        type="file"
        hidden
        multiple
        accept="image/*"
        onChange={(e) => handleSelect(e.target.files)}
      />

      {/* Preview */}

      {previews.length > 0 && (
        <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
          {previews.map((image, index) => {
            const key = `${image.file.name}-${image.file.size}`;
            const currentProgress =
              progressMap[key] !== undefined ? progressMap[key] : 100;
            const isUploading = currentProgress < 100;

            return (
              <div
                key={image.id}
                className="relative h-20 w-20 flex-shrink-0 mt-4"
              >
                <img
                  src={image.preview}
                  alt=""
                  className="h-full w-full rounded-xl object-cover"
                />

                {/* Progress Overlay */}
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

                {/* Delete Button */}
                {!isUploading && (
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white shadow cursor-pointer transition active:scale-95 z-10"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MobileImageUploader;
