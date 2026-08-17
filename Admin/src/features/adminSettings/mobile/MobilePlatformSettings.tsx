import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';
import { useAdminSettingsStore } from '../store';
import { usePlatformSettingsData } from '../hooks/usePlatformSettingsData';
import type { PlatformSettings } from '../types';
import i18n from '../../../i18n';

const LANGUAGES = [
  { value: 'Arabic', labelKey: 'adminSettings.languages.arabic' },
  { value: 'English', labelKey: 'adminSettings.languages.english' },
];

export const MobilePlatformSettings: React.FC = () => {
  const { t } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const { setViewMode } = useAdminSettingsStore();
  const {
    languageQuery,
    updateLanguageMutation,
    isSuperAdmin,
    defaultLanguage,
  } = usePlatformSettingsData();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PlatformSettings>({
    defaultValues: { defaultLanguage },
    mode: 'onChange',
  });

  React.useEffect(() => {
    reset({ defaultLanguage });
  }, [defaultLanguage, reset]);

  const onSubmit = (data: PlatformSettings) => {
    if (!isSuperAdmin) return;
    updateLanguageMutation.mutate(data.defaultLanguage);
  };

  return (
    <div className="space-y-6 w-full pb-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          {t('adminSettings.title', { defaultValue: 'Platform Settings' })}
        </h1>
      </div>

      {/* Main Platform Settings Form Card */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Default Language */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="mob-defaultLanguage"
                className="text-sm font-semibold text-gray-900 block"
              >
                {t('adminSettings.defaultLanguage', {
                  defaultValue: 'Default Language',
                })}{' '}
                {isSuperAdmin && <span className="text-red-500">*</span>}
              </label>
              {!isSuperAdmin && (
                <span className="inline-flex items-center text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md border border-gray-200">
                  {t('adminSettings.viewOnly', { defaultValue: 'View Only' })}
                </span>
              )}
            </div>

            <div className="relative">
              <select
                id="mob-defaultLanguage"
                disabled={!isSuperAdmin || updateLanguageMutation.isPending || languageQuery.isLoading}
                {...register('defaultLanguage', {
                  required: isArabic
                    ? 'اللغة مطلوبة'
                    : 'Default language is required',
                })}
                className={`w-full appearance-none border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 pr-10 transition-colors ${
                  !isSuperAdmin
                    ? 'bg-gray-100/80 text-gray-600 cursor-not-allowed border-gray-200'
                    : 'bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent cursor-pointer'
                }`}
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {t(lang.labelKey, { defaultValue: lang.value })}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 rtl:right-auto rtl:left-0">
                <ChevronDown size={16} />
              </div>
            </div>

            {!isSuperAdmin && (
              <p className="text-xs text-gray-400 mt-2">
                {t('adminSettings.adminCannotChangeLanguage', {
                  defaultValue:
                    'Only Super Administrators can change the default platform language.',
                })}
              </p>
            )}

            {errors.defaultLanguage && (
              <p className="text-xs text-red-500 mt-1.5">
                {errors.defaultLanguage.message}
              </p>
            )}
          </div>

          {/* Save Settings Button - Only rendered for Super Admin */}
          {isSuperAdmin && (
            <div className="pt-2">
              <button
                type="submit"
                disabled={updateLanguageMutation.isPending}
                className="w-full bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white font-semibold text-sm py-3 rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed shadow-2xs inline-flex items-center justify-center gap-2"
              >
                {updateLanguageMutation.isPending && (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                {t('adminSettings.saveSettings', { defaultValue: 'Save Settings' })}
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Navigation Quick Action Cards Stack */}
      <div className="space-y-3.5">
        {/* Admin Accounts Card */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-base font-bold text-gray-900 mb-1">
              {t('adminSettings.quickActions.adminsTitle', {
                defaultValue: 'Admin Accounts',
              })}
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed font-normal">
              {t('adminSettings.quickActions.adminsDesc', {
                defaultValue: 'Manage platform admin accounts and permissions',
              })}
            </p>
          </div>
          <div>
            <button
              type="button"
              onClick={() => setViewMode('admins')}
              className="bg-black hover:bg-gray-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <span>
                {t('adminSettings.quickActions.manageAdmins', {
                  defaultValue: 'Manage Admins',
                })}
              </span>
              <span className="text-sm rtl:rotate-180">→</span>
            </button>
          </div>
        </div>

        {/* Banners Card */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-base font-bold text-gray-900 mb-1">
              {t('adminSettings.quickActions.bannersTitle', {
                defaultValue: 'Banners',
              })}
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed font-normal">
              {t('adminSettings.quickActions.bannersDesc', {
                defaultValue: 'Manage homepage banners and promotional slots',
              })}
            </p>
          </div>
          <div>
            <button
              type="button"
              onClick={() => setViewMode('banners')}
              className="bg-black hover:bg-gray-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <span>
                {t('adminSettings.quickActions.manageBanners', {
                  defaultValue: 'Manage Banners',
                })}
              </span>
              <span className="text-sm rtl:rotate-180">→</span>
            </button>
          </div>
        </div>

        {/* Shipping Management Card */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-base font-bold text-gray-900 mb-1">
              {t('adminSettings.quickActions.shippingTitle', {
                defaultValue: 'Shipping Management',
              })}
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed font-normal">
              {t('adminSettings.quickActions.shippingDesc', {
                defaultValue: 'Manage shipping zones and view vendor rates',
              })}
            </p>
          </div>
          <div>
            <button
              type="button"
              onClick={() => setViewMode('shipping-zones')}
              className="bg-black hover:bg-gray-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <span>
                {t('adminSettings.quickActions.manageShipping', {
                  defaultValue: 'Manage Shipping',
                })}
              </span>
              <span className="text-sm rtl:rotate-180">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
