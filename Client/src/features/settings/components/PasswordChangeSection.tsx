import { ChevronDown, Info } from 'lucide-react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { PasswordInput, PasswordStrengthBar, SectionCard } from '../shared';
import { getPasswordStrength, cn } from '../utils';
import type { AccountSettingsData, PasswordData } from '../types';
import { useAccountSettingsStore } from '../store/useAccountSettingsStore';

type AccountSettingsFormValues = AccountSettingsData & PasswordData;

export function PasswordChangeSection() {
  const { t } = useTranslation();
  const {
    control,
    watch,
    formState: { errors },
  } = useFormContext<AccountSettingsFormValues>();

  const pwOpen = useAccountSettingsStore((s) => s.pwOpen);
  const togglePwOpen = useAccountSettingsStore((s) => s.togglePwOpen);

  const newPassword = watch('newPassword');

  return (
    <SectionCard>
      <div className="md:p-5 px-4 py-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-base font-bold text-[#090909]">
              {t('settings.account.changePassword')}
            </p>
            <p className="text-xs text-normal text-[#545454] mt-1">
              {t('settings.account.changePasswordDescription')}
            </p>
          </div>
          <button
            type="button"
            aria-expanded={pwOpen}
            className="p-1 rounded text-gray-500 transition-all duration-300 ease-out hover:bg-gray-100 hover:scale-110 mt-0.5 cursor-pointer"
            onClick={togglePwOpen}
          >
            <ChevronDown
              size={16}
              className={cn(
                'transition-transform duration-300 ease-out',
                pwOpen ? 'rotate-180' : 'rotate-0'
              )}
            />
          </button>
        </div>

        <div
          className={cn(
            'grid transition-[grid-template-rows,opacity,margin] duration-500 ease-in-out',
            pwOpen
              ? 'grid-rows-[1fr] opacity-100 mt-5'
              : 'grid-rows-[0fr] opacity-0 mt-0'
          )}
        >
          <div className="overflow-hidden">
            <div
              className={cn(
                'space-y-4 transition-transform duration-500 ease-in-out',
                pwOpen ? 'translate-y-0' : '-translate-y-2'
              )}
            >
              <Controller
                name="currentPassword"
                control={control}
                rules={{
                  validate: (val, formValues) => {
                    if (!pwOpen) return true;
                    const hasPw = Boolean(
                      val ||
                      formValues.newPassword ||
                      formValues.confirmPassword
                    );
                    if (hasPw && !val)
                      return t('settings.errors.currentPasswordRequired');
                    return true;
                  },
                }}
                render={({ field, fieldState: { error } }) => (
                  <PasswordInput
                    label={t('settings.account.currentPassword')}
                    value={field.value ?? ''}
                    error={error?.message}
                    onChange={field.onChange}
                    autoComplete="current-password"
                  />
                )}
              />

              <div>
                <Controller
                  name="newPassword"
                  control={control}
                  rules={{
                    validate: (val, formValues) => {
                      if (!pwOpen) return true;
                      const hasPw = Boolean(
                        val ||
                        formValues.currentPassword ||
                        formValues.confirmPassword
                      );
                      if (hasPw && (!val || getPasswordStrength(val) < 4))
                        return t('settings.errors.newPasswordWeak');
                      return true;
                    },
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <PasswordInput
                      label={t('settings.account.newPassword')}
                      value={field.value ?? ''}
                      error={error?.message}
                      onChange={field.onChange}
                      autoComplete="new-password"
                    />
                  )}
                />
                <PasswordStrengthBar
                  password={newPassword ?? ''}
                  error={errors.newPassword?.message}
                />
              </div>

              <Controller
                name="confirmPassword"
                control={control}
                rules={{
                  validate: (val, formValues) => {
                    if (!pwOpen) return true;
                    const hasPw = Boolean(
                      val ||
                      formValues.currentPassword ||
                      formValues.newPassword
                    );
                    if (hasPw && val !== formValues.newPassword)
                      return t('settings.errors.passwordMismatch');
                    return true;
                  },
                }}
                render={({ field, fieldState: { error } }) => (
                  <PasswordInput
                    label={t('settings.account.confirmPassword')}
                    value={field.value ?? ''}
                    error={error?.message}
                    onChange={field.onChange}
                    autoComplete="new-password"
                  />
                )}
              />

              <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-md px-3 py-2.5">
                <Info size={14} className="text-blue-500 shrink-0 mt-0.5" />
                <p className="text-[12px] text-blue-700 leading-4">
                  {t('settings.account.passwordInfo')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
