import { AlertTriangle, Layers } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { SectionCard, TextInput } from '../shared';
import type { AccountSettingsData, PasswordData } from '../types';

type AccountSettingsFormValues = AccountSettingsData & PasswordData;

export function InventorySettingsSection() {
  const { t } = useTranslation();
  const {
    register,
    formState: { errors },
  } = useFormContext<AccountSettingsFormValues>();

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
      </div>
    </SectionCard>
  );
}
