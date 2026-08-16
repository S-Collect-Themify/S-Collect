import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';
import { useAdminSettingsStore } from '../store';
import type { PlatformSettings } from '../types';
import i18n from '../../../i18n';

const LANGUAGES = [
  { value: 'Arabic', labelKey: 'adminSettings.languages.arabic' },
  { value: 'English', labelKey: 'adminSettings.languages.english' },
];

export const PlatformSettingsForm: React.FC = () => {
  const { t } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const { platformSettings, updatePlatformSettings } = useAdminSettingsStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PlatformSettings>({
    defaultValues: platformSettings,
    mode: 'onChange',
  });

  React.useEffect(() => {
    reset(platformSettings);
  }, [platformSettings, reset]);

  const onSubmit = (data: PlatformSettings) => {
    updatePlatformSettings(data);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white rounded-xl p-6 border border-gray-100 shadow-xs flex flex-col justify-between"
    >
      {/* Default Language */}
      <div className='Lang-part'>
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
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 rtl:right-auto rtl:left-0">
                <ChevronDown size={16} />
              </div>
        </div>
        {errors.defaultLanguage && (
          <p className="text-xs text-red-500 mt-1.5">
            {errors.defaultLanguage.message}
          </p>
        )}
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
