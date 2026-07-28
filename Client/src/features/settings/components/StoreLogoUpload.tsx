import { CloudUpload } from 'lucide-react';
import { type DragEvent, useId, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import type { StoreProfileData } from '../types';
import { cn } from '../utils';

function LogoNormal({
  logoUrl,
  fileName,
  onReplace,
  onRemove,
}: {
  logoUrl: string;
  fileName: string;
  onReplace: (f: File) => void;
  onRemove: () => void;
}) {
  const id = useId();
  const { t } = useTranslation();

  return (
    <div className="border border-gray-200 rounded-lg bg-white px-4 py-3 flex items-center gap-3 transition-all duration-300 ease-out">
      <div className="w-10 h-10 shrink-0 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center overflow-hidden">
        <img
          src={logoUrl}
          alt={t('settings.logo.alt')}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[#090909]">{fileName}</p>
        <div className="flex md:items-center justify-end md:justify-start gap-2 mt-0.5">
          <label
            htmlFor={id}
            className="text-xs text-[#737373] cursor-pointer underline"
          >
            {t('settings.logo.replace')}
            <input
              id={id}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onReplace(f);
                e.target.value = '';
              }}
            />
          </label>
          <button
            type="button"
            className="text-xs underline text-red-500 hover:text-red-700 cursor-pointer"
            onClick={onRemove}
          >
            {t('settings.logo.remove')}
          </button>
        </div>
      </div>
    </div>
  );
}

function LogoEmpty({ onUpload }: { onUpload: (f: File) => void }) {
  const id = useId();
  const [drag, setDrag] = useState(false);
  const { t } = useTranslation();

  return (
    <label
      htmlFor={id}
      className={cn(
        'flex flex-col items-center justify-center border-2 border-dashed rounded-lg py-7 cursor-pointer transition-all duration-300 ease-out',
        drag
          ? 'border-gray-400 bg-gray-50'
          : 'border-gray-300 bg-white/50 hover:bg-gray-50'
      )}
      onDrop={(e: DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        setDrag(false);
        const f = e.dataTransfer.files?.[0];
        if (f) onUpload(f);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
    >
      <input
        id={id}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onUpload(f);
          e.target.value = '';
        }}
      />
      <div className="w-8 h-8 flex items-center justify-center mb-2">
        <CloudUpload className="text-[#969696] w-6 h-6 md:w-8 md:h-8" />
      </div>
      <p className="text-[13px] font-medium text-gray-700">
        {t('settings.logo.upload')}
      </p>
      <p className="text-[12px] text-gray-400 mt-0.5">
        {t('settings.logo.hint')}
      </p>
    </label>
  );
}

function LogoError({
  error,
  onUpload,
}: {
  error: string;
  onUpload: (f: File) => void;
}) {
  const id = useId();
  const [drag, setDrag] = useState(false);
  const { t } = useTranslation();

  return (
    <div>
      <label
        htmlFor={id}
        className={cn(
          'flex flex-col items-center justify-center border-2 border-dashed rounded-lg py-7 cursor-pointer transition-all duration-300 ease-out',
          drag
            ? 'border-red-400 bg-red-100'
            : 'border-red-300 bg-red-50 hover:bg-red-100'
        )}
        onDrop={(e: DragEvent<HTMLLabelElement>) => {
          e.preventDefault();
          setDrag(false);
          const f = e.dataTransfer.files?.[0];
          if (f) onUpload(f);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
      >
        <input
          id={id}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onUpload(f);
            e.target.value = '';
          }}
        />
        <div className="w-8 h-8 rounded-full border-2 border-red-400 flex items-center justify-center mb-2">
          <span className="text-red-400 font-bold text-[15px] leading-none select-none">
            !
          </span>
        </div>
        <p className="text-[13px] font-medium text-gray-700">
          {t('settings.logo.upload')}
        </p>
        <p className="text-[12px] text-gray-400 mt-0.5">
          {t('settings.logo.hint')}
        </p>
      </label>
      <p className="settings-pop-enter mt-1.5 text-[12px] text-red-500">
        {error}
      </p>
    </div>
  );
}

export function StoreLogoUpload() {
  const { t } = useTranslation();
  const {
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useFormContext<StoreProfileData>();

  const storeLogoUrl = watch('storeLogoUrl');
  const storeLogoFileName = watch('storeLogoFileName');

  const handleLogoUpload = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    const lastDotIndex = file.name.lastIndexOf('.');
    const extension = lastDotIndex !== -1 ? file.name.substring(lastDotIndex).toLowerCase() : '';
    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

    if (!validTypes.includes(file.type) || !validExtensions.includes(extension)) {
      setError('storeLogoUrl', {
        message: t('settings.errors.imageUpload', 'Only JPG, JPEG, PNG, or WEBP images are allowed'),
      });
<<<<<<< HEAD
      setValue('storeLogoUrl', null);
      setValue('logoFile', null);
      return;
    }
    if (storeLogoUrl?.startsWith('blob:')) URL.revokeObjectURL(storeLogoUrl);
    setValue('storeLogoUrl', URL.createObjectURL(file));
    setValue('storeLogoFileName', file.name);
=======
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('storeLogoUrl', {
        message: t('settings.errors.imageTooLarge', 'Image size must be less than 2MB'),
      });
      return;
    }

    if (storeLogoUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(storeLogoUrl);
    }

    setValue('storeLogoUrl', URL.createObjectURL(file), { shouldDirty: true });
    setValue('storeLogoFileName', file.name, { shouldDirty: true });
>>>>>>> 4f2a744b5a6cfedce0edc3751dc4020621939ed8
    setValue('logoFile', file, { shouldDirty: true });
    clearErrors('storeLogoUrl');
  };

  const handleLogoRemove = () => {
<<<<<<< HEAD
    if (storeLogoUrl?.startsWith('blob:')) URL.revokeObjectURL(storeLogoUrl);
    setValue('storeLogoUrl', null);
    setValue('storeLogoFileName', null);
=======
    if (storeLogoUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(storeLogoUrl);
    }
    setValue('storeLogoUrl', null, { shouldDirty: true });
    setValue('storeLogoFileName', null, { shouldDirty: true });
>>>>>>> 4f2a744b5a6cfedce0edc3751dc4020621939ed8
    setValue('logoFile', null, { shouldDirty: true });
    clearErrors('storeLogoUrl');
  };

  return (
    <div className="settings-surface-enter settings-stagger-2 mb-4">
      <p className="text-sm font-bold text-[#090909] mb-2">
        {t('settings.storeLogo')}
      </p>
      {errors.storeLogoUrl ? (
        <LogoError
          error={errors.storeLogoUrl.message as string}
          onUpload={handleLogoUpload}
        />
      ) : storeLogoUrl ? (
        <LogoNormal
          logoUrl={storeLogoUrl}
          fileName={storeLogoFileName ?? t('settings.logo.fileFallback')}
          onReplace={handleLogoUpload}
          onRemove={handleLogoRemove}
        />
      ) : (
        <LogoEmpty onUpload={handleLogoUpload} />
      )}
    </div>
  );
}
