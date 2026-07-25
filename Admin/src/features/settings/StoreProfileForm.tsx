import { ImageIcon, CloudUpload } from 'lucide-react';
import { type DragEvent, useId, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';

import { FieldWrap, TextInput } from './shared';
import type { StoreProfileData } from './types';
import { cn, isValidEmail } from './utils';

import { Controller, useForm } from 'react-hook-form';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

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
    <div className="border border-gray-200 rounded-lg bg-white px-4 py-3 flex items-center gap-3 transition-all duration-300 ease-out ">
      <div className="w-10 h-10 shrink-0 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center overflow-hidden">
        <img
          src={logoUrl}
          alt={t('settings.logo.alt')}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[#090909] ">{fileName}</p>
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
            className="text-xs underline text-red-500 hover:text-red-700"
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
        'flex flex-col items-center justify-center border-2 border-dashed rounded-lg py-7 cursor-pointer transition-all duration-300 ease-out ',
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
          'flex flex-col items-center justify-center border-2 border-dashed rounded-lg py-7 cursor-pointer transition-all duration-300 ease-out ',
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

export function StoreProfileForm({
  initialData,
  onSave,
  onSuccess,
}: {
  initialData: StoreProfileData;
  onSave: (d: StoreProfileData) => Promise<void>;
  onSuccess: () => void;
}) {
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    clearErrors,
    control,
    formState: { errors },
  } = useForm<StoreProfileData>({
    values: initialData,
  });

  const storeName = watch('storeName');
  const storeDescription = watch('storeDescription');
  const publicEmail = watch('publicEmail');
  const phoneNumber = watch('phoneNumber');
  const storeLogoUrl = watch('storeLogoUrl');
  const storeLogoFileName = watch('storeLogoFileName');

  const handleLogoUpload = (file: File) => {
    if (!file.type.startsWith('image/') || file.size > 2 * 1024 * 1024) {
      setError('storeLogoUrl', {
        message: t('settings.errors.imageUpload'),
      });
      setValue('storeLogoUrl', null);
      return;
    }
    if (storeLogoUrl?.startsWith('blob:')) URL.revokeObjectURL(storeLogoUrl);
    setValue('storeLogoUrl', URL.createObjectURL(file));
    setValue('storeLogoFileName', file.name);
    clearErrors('storeLogoUrl');
  };

  const handleLogoRemove = () => {
    if (storeLogoUrl?.startsWith('blob:')) URL.revokeObjectURL(storeLogoUrl);
    setValue('storeLogoUrl', null);
    setValue('storeLogoFileName', null);
    clearErrors('storeLogoUrl');
  };

  const onSubmit = (data: StoreProfileData) => {
    startTransition(async () => {
      await onSave(data);
      onSuccess();
    });
  };

  const hasErrors = Object.keys(errors).length > 0;

  const logoSection = errors.storeLogoUrl ? (
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
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div className="settings-surface-enter settings-stagger-1 mb-5">
        <p className="text-xs font-bold text-[#969696] mb-3">
          {t('settings.storePreview')}
        </p>
        <div className="border border-[#E9E9E9] rounded-lg bg-white/50 p-3 md:p-5 transition-all duration-300 ease-out ">
          <div className="flex items-center md:items-start gap-3 md:gap-5">
            <div className="w-14 h-14 md:w-20 md:h-20 shrink-0 rounded-full bg-[#F8F8F8]  flex items-center justify-center overflow-hidden">
              {storeLogoUrl ? (
                <img
                  src={storeLogoUrl}
                  alt={t('settings.logo.alt')}
                  className="w-full h-full object-cover"
                />
              ) : (
                <ImageIcon
                  size={16}
                  className="text-[#969696] w-6 h-6 md:w-8 md:h-8"
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-base font-medium text-[#090909]">
                {storeName || t('settings.storeNameFallback')}
              </p>
              <p className="text-sm font-medium text-[#969696] mt-0.5 line-clamp-1  md:line-clamp-2">
                {storeDescription || t('settings.storeDescriptionFallback')}
              </p>
              <p className="text-xs text-[#969696] mt-1 flex items-center gap-1.5 flex-wrap font-normal">
                {publicEmail && <span>{publicEmail}</span>}
                {publicEmail && phoneNumber && <span>•</span>}
                {phoneNumber && <span>{phoneNumber}</span>}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-surface-enter settings-stagger-2 mb-4">
        <FieldWrap
          label={t('settings.storeName')}
          required
          error={errors.storeName?.message}
        >
          <TextInput
            placeholder={t('settings.storeNamePlaceholder')}
            disabled={isPending}
            error={errors.storeName?.message}
            {...register('storeName', {
              required: t('settings.errors.storeNameRequired'),
              validate: (v) =>
                v.trim() !== '' || t('settings.errors.storeNameRequired'),
            })}
          />
        </FieldWrap>
      </div>

      <div className="settings-surface-enter settings-stagger-2 mb-4">
        <p className="text-sm font-bold text-[#090909] mb-2">
          {t('settings.storeLogo')}
        </p>
        {logoSection}
      </div>

      <div className="settings-surface-enter settings-stagger-3 mb-4 md:mb-6">
        <label
          htmlFor="store-description"
          className="block text-sm font-bold text-[#090909] mb-3"
        >
          {t('settings.storeDescription')}
        </label>
        <div className="relative">
          <textarea
            id="store-description"
            placeholder={t('settings.storeDescriptionPlaceholder')}
            disabled={isPending}
            className={cn(
              'w-full h-35 resize-none rounded-lg border bg-white/50 px-4 pt-3 pb-8 text-sm text-[#090909] shadow-none outline-none transition-all duration-200 ease-out placeholder:text-gray-400 disabled:bg-white/50 disabled:text-[#969696] disabled:cursor-default focus:-translate-y-0.5',
              errors.storeDescription
                ? 'border-red-400 bg-red-50 focus:border-red-400 focus:ring-1 focus:ring-red-100'
                : 'border-gray-200 focus:border-gray-300 focus:ring-1 focus:ring-gray-100'
            )}
            {...register('storeDescription', {
              required: t('settings.errors.storeDescriptionRequired'),
              validate: (v) =>
                v.trim() !== '' ||
                t('settings.errors.storeDescriptionRequired'),
              maxLength: {
                value: 500,
                message: t('settings.errors.storeDescriptionMaxLength'),
              },
            })}
          />
          {!errors.storeDescription && (
            <span className="pointer-events-none absolute bottom-3 right-3.5 text-[14px] leading-none text-gray-400">
              {(storeDescription ?? '').length} / 500
            </span>
          )}
        </div>
        {errors.storeDescription && (
          <p className="settings-pop-enter mt-1 text-[12px] text-red-500">
            {errors.storeDescription.message}
          </p>
        )}
      </div>

      <div className="settings-surface-enter settings-stagger-3 mb-4 md:mb-6">
        <h3 className="text-xl font-medium text-[#090909] mb-3">
          {t('settings.contactInformation')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FieldWrap
            label={t('settings.publicEmail')}
            error={errors.publicEmail?.message}
          >
            <TextInput
              type="email"
              placeholder={t('settings.emailPlaceholder')}
              disabled={isPending}
              error={errors.publicEmail?.message}
              {...register('publicEmail', {
                required: t('settings.errors.invalidEmail'),
                validate: (v) =>
                  isValidEmail(v) || t('settings.errors.invalidEmail'),
              })}
            />
          </FieldWrap>
          <FieldWrap
            label={t('settings.phoneNumber')}
            error={errors.phoneNumber?.message}
          >
            <Controller
              name="phoneNumber"
              control={control}
              rules={{
                required: t('settings.errors.invalidPhone'),
                validate: (v) => (v ? true : t('settings.errors.invalidPhone')),
              }}
              render={({ field }) => (
                <PhoneInput
                  international
                  defaultCountry="SA"
                  value={field.value}
                  onChange={(v) => field.onChange(v ?? '')}
                  disabled={isPending}
                  className={cn(
                    'phone-input-custom h-10 rounded-lg px-3',
                    errors.phoneNumber && 'phone-error'
                  )}
                />
              )}
            />
          </FieldWrap>
        </div>
      </div>

      <div className="settings-surface-enter settings-stagger-3 flex justify-center md:justify-end">
        <button
          type="submit"
          disabled={hasErrors || isPending}
          className={cn(
            'py-3 px-4 rounded-lg text-sm font-semibold text-white transition-all duration-200 w-full md:w-fit ease-out active:scale-95 cursor-pointer',
            hasErrors || isPending
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gray-950 hover:bg-gray-800'
          )}
        >
          {isPending ? t('settings.saving') : t('settings.saveChanges')}
        </button>
      </div>
    </form>
  );
}
    