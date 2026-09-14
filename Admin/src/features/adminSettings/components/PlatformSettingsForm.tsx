import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';
import { usePlatformSettingsData } from '../hooks/usePlatformSettingsData';
import { ConfirmLanguageChangeModal } from './ConfirmLanguageChangeModal';
import i18n from '../../../i18n';

const LANGUAGES = [
  { value: 'Arabic', labelKey: 'adminSettings.languages.arabic' },
  { value: 'English', labelKey: 'adminSettings.languages.english' },
];

export const PlatformSettingsForm: React.FC = () => {
  const { t } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const {
    updateLanguageMutation,
    updateStockThresholdMutation,
    isSuperAdmin,
    defaultLanguage,
    defaultLowStockThreshold,
  } = usePlatformSettingsData();

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [pendingLanguage, setPendingLanguage] = useState<string>(defaultLanguage);

  // Form 1: Default Language
  const {
    register: registerLang,
    handleSubmit: handleSubmitLang,
    reset: resetLang,
    watch: watchLang,
    formState: { errors: errorsLang },
  } = useForm<{ defaultLanguage: string }>({
    defaultValues: { defaultLanguage },
    mode: 'onChange',
  });

  // Form 2: Low Stock Threshold
  const {
    register: registerStock,
    handleSubmit: handleSubmitStock,
    reset: resetStock,
    watch: watchStock,
    formState: { errors: errorsStock },
  } = useForm<{ defaultLowStockThreshold: number }>({
    defaultValues: { defaultLowStockThreshold: defaultLowStockThreshold ?? 10 },
    mode: 'onChange',
  });

  const selectedLanguage = watchLang('defaultLanguage');
  const selectedThreshold = watchStock('defaultLowStockThreshold');

  const isLanguageChanged = Boolean(selectedLanguage && selectedLanguage !== defaultLanguage);
  const isThresholdChanged = Boolean(
    selectedThreshold !== undefined &&
    selectedThreshold !== null &&
    Number(selectedThreshold) !== Number(defaultLowStockThreshold ?? 10)
  );

  React.useEffect(() => {
    resetLang({ defaultLanguage });
    setPendingLanguage(defaultLanguage);
  }, [defaultLanguage, resetLang]);

  React.useEffect(() => {
    resetStock({ defaultLowStockThreshold: defaultLowStockThreshold ?? 10 });
  }, [defaultLowStockThreshold, resetStock]);

  const onLanguageSubmit = (data: { defaultLanguage: string }) => {
    if (!isSuperAdmin || !isLanguageChanged) return;
    setPendingLanguage(data.defaultLanguage);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmLanguageChange = () => {
    updateLanguageMutation.mutate(pendingLanguage, {
      onSuccess: () => {
        setIsConfirmModalOpen(false);
      },
    });
  };

  const onStockSubmit = (data: { defaultLowStockThreshold: number }) => {
    if (!isSuperAdmin || !isThresholdChanged) return;
    updateStockThresholdMutation.mutate(Number(data.defaultLowStockThreshold));
  };

  return (
    <div className="space-y-6">
      {/* Form 1: Default Language */}
      <form
        onSubmit={handleSubmitLang(onLanguageSubmit)}
        className="bg-white rounded-xl p-6 border border-gray-100 shadow-xs flex flex-col justify-between"
      >
        <div>
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
              disabled={!isSuperAdmin || updateLanguageMutation.isPending}
              {...registerLang('defaultLanguage', {
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

          {errorsLang.defaultLanguage && (
            <p className="text-xs text-red-500 mt-1.5">
              {errorsLang.defaultLanguage.message}
            </p>
          )}
        </div>

        {/* Action Button - Only rendered for Super Admin */}
        {isSuperAdmin && (
          <div className="flex justify-end pt-4 border-t border-gray-50 mt-6">
            <button
              type="submit"
              disabled={!isLanguageChanged || updateLanguageMutation.isPending}
              className={`font-semibold text-sm px-6 py-2.5 rounded-lg transition-all inline-flex items-center gap-2 ${
                !isLanguageChanged || updateLanguageMutation.isPending
                  ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed opacity-70'
                  : 'bg-black hover:bg-gray-800 text-white cursor-pointer shadow-xs'
              }`}
            >
              {updateLanguageMutation.isPending && (
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              )}
              {t('adminSettings.updateLanguage', { defaultValue: 'Update Language' })}
            </button>
          </div>
        )}
      </form>

      {/* Form 2: Low Stock Threshold */}
      <form
        onSubmit={handleSubmitStock(onStockSubmit)}
        className="bg-white rounded-xl p-6 border border-gray-100 shadow-xs flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="defaultLowStockThreshold"
              className="text-sm font-semibold text-gray-900 block"
            >
              {t('adminSettings.lowStockThreshold', {
                defaultValue: 'Default Low Stock Threshold',
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
            <input
              id="defaultLowStockThreshold"
              type="number"
              min="0"
              disabled={!isSuperAdmin || updateStockThresholdMutation.isPending}
              {...registerStock('defaultLowStockThreshold', {
                valueAsNumber: true,
                required: isArabic ? 'حد المخزون مطلوب' : 'Stock threshold is required',
                min: { value: 0, message: isArabic ? 'يجب أن يكون 0 على الأقل' : 'Must be at least 0' },
              })}
              className={`w-full appearance-none border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 transition-colors ${
                !isSuperAdmin
                  ? 'bg-gray-100/80 text-gray-600 cursor-not-allowed border-gray-200'
                  : 'bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent'
              }`}
            />
          </div>

          {!isSuperAdmin && (
            <p className="text-xs text-gray-400 mt-2">
              {t('adminSettings.adminCannotChangeSettings', {
                defaultValue: 'Only Super Administrators can change platform settings.',
              })}
            </p>
          )}

          {errorsStock.defaultLowStockThreshold && (
            <p className="text-xs text-red-500 mt-1.5">
              {errorsStock.defaultLowStockThreshold.message}
            </p>
          )}
        </div>

        {/* Action Button - Only rendered for Super Admin */}
        {isSuperAdmin && (
          <div className="flex justify-end pt-4 border-t border-gray-50 mt-6">
            <button
              type="submit"
              disabled={!isThresholdChanged || updateStockThresholdMutation.isPending}
              className={`font-semibold text-sm px-6 py-2.5 rounded-lg transition-all inline-flex items-center gap-2 ${
                !isThresholdChanged || updateStockThresholdMutation.isPending
                  ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed opacity-70'
                  : 'bg-black hover:bg-gray-800 text-white cursor-pointer shadow-xs'
              }`}
            >
              {updateStockThresholdMutation.isPending && (
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              )}
              {t('adminSettings.updateThreshold', { defaultValue: 'Update Stock Threshold' })}
            </button>
          </div>
        )}
      </form>

      {/* Confirmation Modal */}
      <ConfirmLanguageChangeModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmLanguageChange}
        targetLanguage={pendingLanguage}
        isPending={updateLanguageMutation.isPending}
      />
    </div>
  );
};
