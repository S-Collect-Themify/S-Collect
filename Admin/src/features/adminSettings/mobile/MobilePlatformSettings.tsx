import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';
import { useAdminSettingsStore } from '../store';
import { usePlatformSettingsData } from '../hooks/usePlatformSettingsData';
import { ConfirmLanguageChangeModal } from '../components/ConfirmLanguageChangeModal';
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
    <div className="space-y-6 w-full pb-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          {t('adminSettings.title', { defaultValue: 'Platform Settings' })}
        </h1>
      </div>

      {/* Form 1 Card: Default Language */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs">
        <form onSubmit={handleSubmitLang(onLanguageSubmit)} className="space-y-5">
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
                disabled={!isSuperAdmin || updateLanguageMutation.isPending}
                {...registerLang('defaultLanguage', {
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

            {errorsLang.defaultLanguage && (
              <p className="text-xs text-red-500 mt-1.5">
                {errorsLang.defaultLanguage.message}
              </p>
            )}
          </div>

          {/* Save Language Button */}
          {isSuperAdmin && (
            <div className="pt-2">
              <button
                type="submit"
                disabled={!isLanguageChanged || updateLanguageMutation.isPending}
                className={`w-full font-semibold text-sm py-3 rounded-xl transition-all inline-flex items-center justify-center gap-2 ${
                  !isLanguageChanged || updateLanguageMutation.isPending
                    ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed opacity-70'
                    : 'bg-black hover:bg-gray-800 text-white cursor-pointer shadow-2xs'
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
      </div>

      {/* Form 2 Card: Low Stock Threshold */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs">
        <form onSubmit={handleSubmitStock(onStockSubmit)} className="space-y-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="mob-defaultLowStockThreshold"
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
                id="mob-defaultLowStockThreshold"
                type="number"
                min="0"
                disabled={!isSuperAdmin || updateStockThresholdMutation.isPending}
                {...registerStock('defaultLowStockThreshold', {
                  valueAsNumber: true,
                  required: isArabic ? 'حد المخزون مطلوب' : 'Stock threshold is required',
                  min: { value: 0, message: isArabic ? 'يجب أن يكون 0 على الأقل' : 'Must be at least 0' },
                })}
                className={`w-full appearance-none border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 transition-colors ${
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

          {/* Update Stock Threshold Button */}
          {isSuperAdmin && (
            <div className="pt-2">
              <button
                type="submit"
                disabled={!isThresholdChanged || updateStockThresholdMutation.isPending}
                className={`w-full font-semibold text-sm py-3 rounded-xl transition-all inline-flex items-center justify-center gap-2 ${
                  !isThresholdChanged || updateStockThresholdMutation.isPending
                    ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed opacity-70'
                    : 'bg-black hover:bg-gray-800 text-white cursor-pointer shadow-2xs'
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
      </div>

      {/* Confirmation Modal */}
      <ConfirmLanguageChangeModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmLanguageChange}
        targetLanguage={pendingLanguage}
        isPending={updateLanguageMutation.isPending}
      />

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
