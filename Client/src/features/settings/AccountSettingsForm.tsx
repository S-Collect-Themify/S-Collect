import { useEffect, useTransition } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import type { AccountSettingsData, PasswordData } from './types';
import { useChangePassword } from './hooks/useChangePassword';
import { useUpdateAccountSettings } from './hooks/useUpdateAccountSettings';
import { useAccountSettingsStore } from './store/useAccountSettingsStore';
import { useCooldown } from '../../hooks/useCooldown';
import { PersonalInfoSection } from './components/PersonalInfoSection';
import { InventorySettingsSection } from './components/InventorySettingsSection';
import { PasswordChangeSection } from './components/PasswordChangeSection';
import { EmailChangeModal } from './components/EmailChangeModal';

type AccountSettingsFormValues = AccountSettingsData & PasswordData;

export function AccountSettingsForm({
  initialData,
  onSave,
  onSuccess,
}: {
  initialData: AccountSettingsData;
  onSave?: (d: AccountSettingsData & PasswordData) => Promise<void>;
  onSuccess?: () => void;
}) {
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();

  const changePasswordMutation = useChangePassword();
  const updateAccountSettingsMutation = useUpdateAccountSettings();

  const {
    active: isCooldown,
    secondsLeft,
    trigger: triggerCooldown,
  } = useCooldown(60000, 'account_settings_save_cooldown');

  const pwOpen = useAccountSettingsStore((s) => s.pwOpen);
  const setPwOpen = useAccountSettingsStore((s) => s.setPwOpen);
  const currentEmailDisplay = useAccountSettingsStore(
    (s) => s.currentEmailDisplay
  );
  const setCurrentEmailDisplay = useAccountSettingsStore(
    (s) => s.setCurrentEmailDisplay
  );

  useEffect(() => {
    if (initialData?.email) {
      setCurrentEmailDisplay(initialData.email);
    }
  }, [initialData?.email, setCurrentEmailDisplay]);

  const methods = useForm<AccountSettingsFormValues>({
    values: {
      ...initialData,
      lowStockThreshold: initialData.lowStockThreshold ?? 5,
      email: currentEmailDisplay || initialData.email,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = (data: AccountSettingsFormValues) => {
    if (isCooldown) return;

    startTransition(async () => {
      try {
        if (pwOpen && data.currentPassword && data.newPassword) {
          await changePasswordMutation.mutateAsync({
            currentPassword: data.currentPassword,
            newPassword: data.newPassword,
          });
        }

        const updatedAccountData = {
          firstName: data.firstName,
          lastName: data.lastName,
          email: currentEmailDisplay || data.email,
          phoneNumber: data.phoneNumber,
          lowStockThreshold:
            data.lowStockThreshold !== undefined
              ? Number(data.lowStockThreshold)
              : 5,
        };

        await updateAccountSettingsMutation.mutateAsync(updatedAccountData);

        if (onSave) {
          await onSave({
            ...data,
            email: currentEmailDisplay || data.email,
            lowStockThreshold: updatedAccountData.lowStockThreshold,
          });
        }

        methods.setValue('currentPassword', '');
        methods.setValue('newPassword', '');
        methods.setValue('confirmPassword', '');

        triggerCooldown();

        if (onSuccess) {
          onSuccess();
        }
      } catch (err) {
        console.error('Failed to save account settings:', err);
      }
    });
  };

  const onInvalid = (errors: any) => {
    if (
      pwOpen &&
      (errors.currentPassword ||
        errors.newPassword ||
        errors.confirmPassword)
    ) {
      setPwOpen(true);
    }
  };

  const isSubmitting =
    isPending ||
    updateAccountSettingsMutation.isPending ||
    changePasswordMutation.isPending;

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit, onInvalid)}
        noValidate
        className="space-y-3 settings-surface-enter"
      >
        <PersonalInfoSection />
        <InventorySettingsSection />
        <PasswordChangeSection />

        <div className="flex justify-center md:justify-end pt-1">
          <button
            type="submit"
            disabled={isSubmitting || isCooldown}
            className="py-3 px-4 rounded-lg text-sm font-semibold text-white bg-[#090909] md:w-fit w-full disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-all duration-200 ease-out active:scale-95 min-w-[130px] flex items-center justify-center cursor-pointer"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-1 text-white">
                <span>•</span>
                <span>•</span>
                <span>•</span>
              </span>
            ) : isCooldown ? (
              t('settings.saveChangesCooldown', {
                seconds: secondsLeft,
                defaultValue: `${t('settings.saveChanges')} (${secondsLeft}s)`,
              })
            ) : (
              t('settings.saveChanges')
            )}
          </button>
        </div>
      </form>

      <EmailChangeModal />
    </FormProvider>
  );
}
