import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Image as ImageIcon, AlertCircle, ChevronDown, X } from 'lucide-react';
import { useAdminSettingsStore } from '../store';
import type { PlatformSettings } from '../types';
import i18n from '../../../i18n';

const CURRENCIES = [
  { value: 'SAR - Saudi Riyal', labelKey: 'adminSettings.currencies.sar' },
  { value: 'USD - US Dollar', labelKey: 'adminSettings.currencies.usd' },
  { value: 'AED - UAE Dirham', labelKey: 'adminSettings.currencies.aed' },
  { value: 'KWD - Kuwaiti Dinar', labelKey: 'adminSettings.currencies.kwd' },
];

const LANGUAGES = [
  { value: 'Arabic', labelKey: 'adminSettings.languages.arabic' },
  { value: 'English', labelKey: 'adminSettings.languages.english' },
];

export const PlatformSettingsForm: React.FC = () => {
  const { t } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const { platformSettings, updatePlatformSettings } = useAdminSettingsStore();

  const [logoPreview, setLogoPreview] = useState<string | null>(
    platformSettings.logoUrl || null
  );
  const [logoError, setLogoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PlatformSettings>({
    defaultValues: platformSettings,
    mode: 'onChange',
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/png', 'image/svg+xml', 'image/webp'];
    const MAX_SIZE = 2 * 1024 * 1024; // 2MB

    const isInvalidFormat = !allowedTypes.includes(file.type);
    const isInvalidSize = file.size > MAX_SIZE;

    if (isInvalidFormat || isInvalidSize) {
      setLogoError(
        isArabic
          ? 'تعذر رفع الصورة. يرجى التحقق من الصيغة والحجم.'
          : 'Unable to upload image. Please check format and size.'
      );
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setLogoError(null);
    const objectUrl = URL.createObjectURL(file);
    setLogoPreview(objectUrl);
    setValue('logoUrl', objectUrl);
    setValue('logoFileName', file.name);
  };

  const handleRemoveLogo = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLogoPreview(null);
    setLogoError(null);
    setValue('logoUrl', undefined);
    setValue('logoFileName', undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleTriggerUpload = () => {
    // Only trigger if no preview is active
    if (!logoPreview) {
      fileInputRef.current?.click();
    }
  };

  const onSubmit = (data: PlatformSettings) => {
    if (logoError) return;
    updatePlatformSettings({
      ...data,
      logoUrl: logoPreview || undefined,
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white rounded-xl p-6 border border-gray-100 shadow-xs flex flex-col justify-between"
    >
      <div>
        {/* Platform Name */}
        <div className="mb-6">
          <label
            htmlFor="platformName"
            className="text-sm font-semibold text-gray-900 mb-2 block"
          >
            {t('adminSettings.platformName', { defaultValue: 'Platform Name' })}{' '}
            <span className="text-red-500">*</span>
          </label>
          <input
            id="platformName"
            type="text"
            {...register('name', {
              required: isArabic
                ? 'اسم المنصة مطلوب'
                : 'Platform name is required',
              minLength: {
                value: 3,
                message: isArabic
                  ? 'يجب أن يكون اسم المنصة بين 3 و 50 حرفاً'
                  : 'Platform name must be between 3 and 50 characters',
              },
              maxLength: {
                value: 50,
                message: isArabic
                  ? 'يجب أن يكون اسم المنصة بين 3 و 50 حرفاً'
                  : 'Platform name must be between 3 and 50 characters',
              },
            })}
            className={`w-full border rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all ${
              errors.name
                ? 'border-red-400 bg-red-50/20'
                : 'border-gray-200 bg-white'
            }`}
            placeholder="CollectS"
          />
          {errors.name && (
            <p className="text-xs text-red-500 mt-1.5">{errors.name.message}</p>
          )}
        </div>

        {/* Platform Logo */}
        <div className="mb-6">
          <label className="text-sm font-semibold text-gray-900 mb-2 block">
            {t('adminSettings.platformLogo', { defaultValue: 'Platform Logo' })}
          </label>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png,image/svg+xml,image/webp"
            className="hidden"
          />

          <div
            onClick={handleTriggerUpload}
            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all relative ${
              logoError
                ? 'border-red-400 bg-red-50/30 cursor-pointer'
                : logoPreview
                  ? 'border-gray-200 bg-gray-50/40'
                  : 'border-gray-200 bg-gray-50/40 hover:bg-gray-50 hover:border-gray-300 cursor-pointer'
            }`}
          >
            {/* Show X button if logo uploaded */}
            {logoPreview && (
              <button
                type="button"
                onClick={handleRemoveLogo}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-gray-100 hover:bg-red-100 hover:text-red-600 text-gray-500 transition-colors cursor-pointer"
                title={isArabic ? 'إزالة الشعار' : 'Remove logo'}
              >
                <X size={16} />
              </button>
            )}

            {logoPreview ? (
              <div className="flex flex-col items-center">
                <img
                  src={logoPreview}
                  alt="Platform Logo"
                  className="h-16 object-contain mb-2 rounded-md"
                />
              </div>
            ) : logoError ? (
              <div className="flex flex-col items-center">
                <AlertCircle className="size-8 text-red-500 mb-2 stroke-[1.5]" />
                <p className="text-xs font-semibold text-red-500 mb-1">
                  {logoError}
                </p>
                <p className="text-xs text-red-400 font-normal mb-3">
                  {isArabic
                    ? 'اللوجو لا يتجاوز 2MB — الصيغ: PNG, SVG, WEBP'
                    : 'Logo max size 2MB — Formats: PNG, SVG, WEBP'}
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-black text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  {t('adminSettings.uploadLogo', {
                    defaultValue: 'Upload Logo',
                  })}
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <ImageIcon className="size-8 text-gray-300 mb-2 stroke-[1.5]" />
                <p className="text-xs text-gray-500 font-medium mb-3">
                  {t('adminSettings.noLogoUploaded', {
                    defaultValue: 'No Logo Uploaded',
                  })}
                </p>
                <button
                  type="button"
                  className="bg-black text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors mb-2"
                >
                  {t('adminSettings.uploadLogo', {
                    defaultValue: 'Upload Logo',
                  })}
                </button>
                <p className="text-[11px] text-gray-400 font-normal">
                  {isArabic
                    ? 'اللوجو لا يتجاوز 2MB — الصيغ: PNG, SVG, WEBP'
                    : 'PNG, SVG, WEBP — Max 2MB'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Currency & Default Language Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Currency */}
          <div>
            <label
              htmlFor="currency"
              className="text-sm font-semibold text-gray-900 mb-2 block"
            >
              {t('adminSettings.currency', { defaultValue: 'Currency' })}{' '}
              <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                id="currency"
                {...register('currency', {
                  required: isArabic ? 'العملة مطلوبة' : 'Currency is required',
                })}
                className="w-full appearance-none border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent pr-10 cursor-pointer"
              >
                {CURRENCIES.map((curr) => (
                  <option key={curr.value} value={curr.value}>
                    {curr.value}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 rtl:right-auto rtl:left-0">
                <ChevronDown size={16} />
              </div>
            </div>
            {errors.currency && (
              <p className="text-xs text-red-500 mt-1.5">
                {errors.currency.message}
              </p>
            )}
          </div>

          {/* Default Language */}
          <div>
            <label
              htmlFor="defaultLanguage"
              className="text-sm font-semibold text-gray-900 mb-2 block"
            >
              {t('adminSettings.defaultLanguage', {
                defaultValue: 'Default Language',
              })}{' '}
              <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                id="defaultLanguage"
                {...register('defaultLanguage', {
                  required: isArabic
                    ? 'اللغة مطلوبة'
                    : 'Default language is required',
                })}
                className="w-full appearance-none border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent pr-10 cursor-pointer"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.value}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 rtl:right-auto rtl:left-0">
                <ChevronDown size={16} />
              </div>
            </div>
            {errors.defaultLanguage && (
              <p className="text-xs text-red-500 mt-1.5">
                {errors.defaultLanguage.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex justify-end pt-4 border-t border-gray-50 mt-4">
        <button
          type="submit"
          className="bg-black hover:bg-gray-800 text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-colors cursor-pointer"
        >
          {t('adminSettings.saveSettings', { defaultValue: 'Save Settings' })}
        </button>
      </div>
    </form>
  );
};
