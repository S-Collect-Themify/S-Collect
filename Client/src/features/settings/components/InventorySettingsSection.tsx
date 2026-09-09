import { AlertTriangle, Layers } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { SectionCard, TextInput } from '../shared';
import type { AccountSettingsData, PasswordData } from '../types';
import { useUpdateStockThreshold } from '../hooks/useUpdateStockThreshold';

type AccountSettingsFormValues = AccountSettingsData & PasswordData;

export function InventorySettingsSection() {
  const { t } = useTranslation();
  const {
    register,
    trigger,
    getValues,
    formState: { errors },
  } = useFormContext<AccountSettingsFormValues>();

  const updateStockMutation = useUpdateStockThreshold();

  const handleUpdateStock = async () => {
    const isValid = await trigger('lowStockThreshold');
    if (!isValid) return;

    const threshold = Number(getValues('lowStockThreshold'));
    if (!threshold || isNaN(threshold) || threshold < 1) return;

    try {
      await updateStockMutation.mutateAsync(threshold);
    } catch {
      // Error handled by mutation onError
    }
  };

  return (
    <SectionCard>
      <div className="md:p-5 px-4 py-6">
        <div className="flex items-center gap-2 mb-1">
          <Layers size={18} className="text-gray-700 shrink-0" />
          <p className="text-base font-bold text-[#090909]">
            {t('settings.account.inventorySettings', 'Inventory Preferences')}
          </p>
        </div>
        <p className="text-xs text-[#737373] mb-4 font-normal">
          {t(
            'settings.account.inventorySettingsDescription',
            'Configure inventory thresholds and stock alert preferences.'
          )}
        </p>

        <div className="max-w-md">
          <label
            htmlFor="lowStockThreshold"
            className="block text-xs font-bold text-[#090909] mb-1.5"
          >
            {t('settings.account.lowStockThreshold', 'Low Stock Alert Threshold')}
          </label>
          <div className="relative">
            <TextInput
              id="lowStockThreshold"
              type="number"
              min={1}
              step={1}
              error={errors.lowStockThreshold?.message}
              placeholder="5"
              className="pr-16"
              {...register('lowStockThreshold', {
                required: t(
                  'settings.errors.lowStockThresholdRequired',
                  'Low stock threshold is required.'
                ),
                min: {
                  value: 1,
                  message: t(
                    'settings.errors.lowStockThresholdMin',
                    'Threshold must be at least 1 unit.'
                  ),
                },
                valueAsNumber: true,
              })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleUpdateStock();
                }
              }}
            />
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-xs font-medium text-gray-400">
              {t('settings.account.units', 'units')}
            </div>
          </div>

          {errors.lowStockThreshold ? (
            <p className="settings-pop-enter mt-1 text-[12px] text-red-500">
              {errors.lowStockThreshold.message}
            </p>
          ) : (
            <div className="flex items-start gap-1.5 mt-2 text-xs text-gray-500 bg-amber-50/70 border border-amber-200/60 rounded-lg p-2.5">
              <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed text-amber-900">
                {t(
                  'settings.account.lowStockThresholdHint',
                  'Products with available stock at or below this number will be flagged as Low Stock in inventory management and dashboard alert summaries.'
                )}
              </p>
            </div>
          )}

        </div>
          <div className="flex justify-end mt-4">
            <button
              type="button"
              onClick={handleUpdateStock}
              disabled={updateStockMutation.isPending}
              className="py-2.5 px-4 rounded-lg text-xs md:text-sm font-semibold text-white bg-[#090909] hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 ease-out active:scale-95 flex items-center justify-center cursor-pointer w-full sm:w-fit min-w-[120px]"
            >
              {updateStockMutation.isPending ? (
                <span className="flex items-center gap-1 text-white">
                  <span>•</span>
                  <span>•</span>
                  <span>•</span>
                </span>
              ) : (
                t('settings.account.updateStock', 'Update Stock')
              )}
            </button>
          </div>
      </div>
    </SectionCard>
  );
}
