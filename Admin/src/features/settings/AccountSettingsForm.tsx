import { Lock } from 'lucide-react';
import { useState, useTransition } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

import {
  SectionCard,
  TextInput,
} from './shared';
import { cn } from './utils';
import type { AccountSettingsData } from './types';

type AccountSettingsFormValues = AccountSettingsData;

interface ApiErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

const getErrorMessage = (err: unknown, fallback: string) => {
  const error = err as ApiErrorResponse;
  return error.response?.data?.message || error.message || fallback;
};

export function AccountSettingsForm({
  initialData,
  onSave,
  onSuccess,
}: {
  initialData: AccountSettingsData;
  onSave: (d: AccountSettingsData) => Promise<void>;
  onSuccess: () => void;
}) {
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();
  const [saveError, setSaveError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<AccountSettingsFormValues>({
    values: {
      ...initialData,
    },
  });

  const onSubmit = (data: AccountSettingsFormValues) => {
    setSaveError(null);
    startTransition(async () => {
      try {
        await onSave(data);
        onSuccess();
      } catch (err: unknown) {
        setSaveError(getErrorMessage(err, 'Failed to save account settings'));
      }
    });
  };

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="space-y-3 settings-surface-enter"
      >
        <SectionCard>
          <div className="md:p-5 px-4 py-6">
            <p className="text-base font-bold text-[#090909]">
              {t('settings.account.personalInformation')}
            </p>
            <p className="text-xs text-[#737373] mt-1  mb-2 md:mb-4 font-normal">
              {t('settings.account.personalInformationDescription')}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs font-bold text-[#090909] mb-1.5">
                  {t('settings.account.firstName')}
                </p>
                <TextInput
                  error={errors.firstName?.message}
                  {...register('firstName', {
                    required: t('settings.errors.firstNameRequired'),
                    validate: (v) =>
                      v.trim() !== '' || t('settings.errors.firstNameRequired'),
                  })}
                />
                {errors.firstName && (
                  <p className="settings-pop-enter mt-1 text-[12px] text-red-500">
                    {errors.firstName.message}
                  </p>
                )}
              </div>
              <div>
                <p className="text-xs font-bold text-[#090909] mb-1.5">
                  {t('settings.account.lastName')}
                </p>
                <TextInput
                  error={errors.lastName?.message}
                  {...register('lastName', {
                    required: t('settings.errors.lastNameRequired'),
                    validate: (v) =>
                      v.trim() !== '' || t('settings.errors.lastNameRequired'),
                  })}
                />
                {errors.lastName && (
                  <p className="settings-pop-enter mt-1 text-[12px] text-red-500">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="mb-4">
              <p className="text-xs font-bold text-[#090909] mb-1.5">
                {t('settings.account.emailAddress')}
              </p>
              <div className="relative">
                <div className="h-10 px-3 pr-10 flex items-center border border-gray-200 rounded-md bg-white transition-all duration-200 ease-out ">
                  <span className="text-[13px] text-gray-500">
                    {initialData.email}
                  </span>
                </div>
                <span className="absolute inset-y-0 right-3 flex items-center text-gray-400">
                  <Lock size={14} />
                </span>
              </div>
              <p className="text-[11px] text-gray-400 mt-1 leading-4">
                {t('settings.account.emailLockedHint')}
              </p>
            </div>

            <div>
              <p className="text-xs font-bold text-[#090909] mb-1.5">
                {t('settings.account.phoneNumber')}
              </p>
              <Controller
                name="phoneNumber"
                control={control}
                rules={{
                  required: t('settings.errors.invalidPhone'),
                  validate: (v) => (v ? true : t('settings.errors.invalidPhone')),
                }}
                render={({ field, fieldState: { error } }) => (
                  <>
                    <PhoneInput
                      international
                      defaultCountry="SA"
                      value={field.value}
                      onChange={(v) => field.onChange(v ?? '')}
                      className={cn(
                        'phone-input-custom h-10 rounded-lg px-3',
                        error && 'phone-error'
                      )}
                    />
                    {error && (
                      <p className="settings-pop-enter mt-1 text-[12px] text-red-500">
                        {error.message}
                      </p>
                    )}
                  </>
                )}
              />
            </div>
          </div>
        </SectionCard>

        {saveError && (
          <div className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">
            {saveError}
          </div>
        )}

        <div className="flex justify-center md:justify-end pt-1">
          <button
            type="submit"
            disabled={isPending}
            className="py-3 px-4 rounded-lg text-sm font-semibold text-white bg-[#090909] md:w-fit w-full disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-all duration-200 ease-out active:scale-95 min-w-32.5 flex items-center justify-center cursor-pointer"
          >
            {isPending ? (
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

    </>
  );
}
