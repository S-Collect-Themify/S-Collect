import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';
import { usePlatformSettingsData } from '../hooks/usePlatformSettingsData';
import type { PlatformSettings } from '../types';
import i18n from '../../../i18n';

const LANGUAGES = [
  { value: 'Arabic', labelKey: 'adminSettings.languages.arabic' },
  { value: 'English', labelKey: 'adminSettings.languages.english' },
];

export const PlatformSettingsForm: React.FC = () => {
  const { t } = useTranslation();
  const isArabic = i18n.language === 'ar';
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
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white rounded-xl p-6 border border-gray-100 shadow-xs flex flex-col justify-between"
    >
      {/* Default Language */}
      <div className="Lang-part">
        <div className="flex items-center justify-between mb-2">
          <label
            htmlFor="defaultLanguage"
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
            id="defaultLanguage"
            disabled={!isSuperAdmin || updateLanguageMutation.isPending || languageQuery.isLoading}
            {...register('defaultLanguage', {
              required: isArabic
                ? 'اللغة مطلوبة'
                : 'Default language is required',
            })}
            className={`w-full appearance-none border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 pr-10 transition-colors ${
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
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 rtl:right-auto rtl:left-0">
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

      {/* Action Button - Only rendered for Super Admin */}
      {isSuperAdmin && (
        <div className="flex justify-end pt-4 border-t border-gray-50 mt-4">
          <button
            type="submit"
            disabled={updateLanguageMutation.isPending}
            className="bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            {updateLanguageMutation.isPending && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {t('adminSettings.saveSettings', { defaultValue: 'Save Settings' })}
          </button>
        </div>
      )}
    </form>
  );
};
