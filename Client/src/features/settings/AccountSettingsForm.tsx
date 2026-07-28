import { useEffect, useTransition } from 'react';
import { FormProvider, useForm, type FieldErrors } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import type { AccountSettingsData, PasswordData } from './types';
import { useChangePassword } from './hooks/useChangePassword';
import { useUpdateAccountSettings } from './hooks/useUpdateAccountSettings';
import { useAccountSettingsStore } from './store/useAccountSettingsStore';
import { PersonalInfoSection } from './components/PersonalInfoSection';
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
      email: currentEmailDisplay || initialData.email,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = (data: AccountSettingsFormValues) => {
    startTransition(async () => {
      try {
        if (data.currentPassword && data.newPassword) {
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
        };

        await updateAccountSettingsMutation.mutateAsync(updatedAccountData);

        if (onSave) {
          await onSave({ ...data, email: currentEmailDisplay || data.email });
        }

        methods.setValue('currentPassword', '');
        methods.setValue('newPassword', '');
        methods.setValue('confirmPassword', '');

        if (onSuccess) {
          onSuccess();
        }
      } catch (err) {
        console.error('Failed to save account settings:', err);
      }
    });
  };

  const onInvalid = (errors: FieldErrors<AccountSettingsFormValues>) => {
    if (
      errors.currentPassword ||
      errors.newPassword ||
      errors.confirmPassword
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
        <PasswordChangeSection />

        <div className="flex justify-center md:justify-end pt-1">
          <button
            type="submit"
            disabled={isSubmitting}
            className="py-3 px-4 rounded-lg text-sm font-semibold text-white bg-[#090909] md:w-fit w-full disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-all duration-200 ease-out active:scale-95 min-w-[130px] flex items-center justify-center cursor-pointer"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-1 text-white">
                <span>•</span>
                <span>•</span>
                <span>•</span>
              </span>
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
