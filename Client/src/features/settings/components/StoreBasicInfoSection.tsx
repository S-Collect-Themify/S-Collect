import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { FieldWrap, TextInput } from '../shared';
import type { StoreProfileData } from '../types';
import { cn } from '../utils';

export function StoreBasicInfoSection({ isPending }: { isPending?: boolean }) {
  const { t, i18n } = useTranslation();
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<StoreProfileData>();

  const storeDescription = watch('storeDescription');
  const isAr = i18n.language === 'ar';

  return (
    <>
<<<<<<< HEAD
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="settings-surface-enter settings-stagger-2">
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
=======
      <div className="settings-surface-enter settings-stagger-2 mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="order-1 rtl:order-2">
          <FieldWrap
            label={t('settings.storeNameEn')}
            required={!isAr}
            error={errors.storeName?.message}
          >
            <TextInput
              placeholder={t('settings.storeNamePlaceholderEn')}
              disabled={isPending}
              error={errors.storeName?.message}
              {...register('storeName', {
                required: !isAr ? t('settings.errors.storeNameRequired') : false,
                validate: (v) =>
                  isAr || (v && v.trim() !== '') || t('settings.errors.storeNameRequired'),
>>>>>>> 4f2a744b5a6cfedce0edc3751dc4020621939ed8
              })}
            />
          </FieldWrap>
        </div>

<<<<<<< HEAD
        <div className="settings-surface-enter settings-stagger-2">
          <FieldWrap
            label={t('settings.storeNameAr')}
            error={errors.storeNameAr?.message}
          >
            <TextInput
              placeholder={t('settings.storeNameArPlaceholder')}
              disabled={isPending}
              error={errors.storeNameAr?.message}
              dir="rtl"
              {...register('storeNameAr')}
=======
        <div className="order-2 rtl:order-1">
          <FieldWrap
            label={t('settings.storeNameAr')}
            required={isAr}
            error={errors.storeNameAr?.message}
          >
            <TextInput
              placeholder={t('settings.storeNamePlaceholderAr')}
              disabled={isPending}
              error={errors.storeNameAr?.message}
              dir="rtl"
              {...register('storeNameAr', {
                required: isAr ? t('settings.errors.storeNameArRequired', 'اسم المتجر (بالعربية) مطلوب') : false,
                validate: (v) =>
                  !isAr || (v && v.trim() !== '') || t('settings.errors.storeNameArRequired', 'اسم المتجر (بالعربية) مطلوب'),
              })}
>>>>>>> 4f2a744b5a6cfedce0edc3751dc4020621939ed8
            />
          </FieldWrap>
        </div>
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
              'w-full h-[140px] resize-none rounded-lg border bg-white/50 px-4 pt-3 pb-8 text-sm text-[#090909] shadow-none outline-none transition-all duration-200 ease-out placeholder:text-gray-400 disabled:bg-white/50 disabled:text-[#969696] disabled:cursor-default focus:-translate-y-0.5',
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
    </>
  );
}
