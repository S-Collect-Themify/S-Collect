import { ArrowRight, Lock } from 'lucide-react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

import { SectionCard, TextInput } from '../shared';
import { cn, normalizeSaudiPhone } from '../utils';
import type { AccountSettingsData, PasswordData } from '../types';
import { useAccountSettingsStore } from '../store/useAccountSettingsStore';

type AccountSettingsFormValues = AccountSettingsData & PasswordData;

export function PersonalInfoSection() {
  const { t } = useTranslation();
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<AccountSettingsFormValues>();

  const currentEmailDisplay = useAccountSettingsStore(
    (s) => s.currentEmailDisplay
  );
  const openEmailModal = useAccountSettingsStore((s) => s.openEmailModal);

  return (
    <SectionCard>
      <div className="md:p-5 px-4 py-6">
        <p className="text-base font-bold text-[#090909]">
          {t('settings.account.personalInformation')}
        </p>
        <p className="text-xs text-[#737373] mt-1 mb-2 md:mb-4 font-normal">
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
            <div className="h-10 px-3 pr-10 flex items-center border border-gray-200 rounded-md bg-white transition-all duration-200 ease-out">
              <span className="text-[13px] text-gray-500">
                {currentEmailDisplay}
              </span>
            </div>
            <span className="absolute inset-y-0 right-3 flex items-center text-gray-400">
              <Lock size={14} />
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1 leading-4">
            {t('settings.account.emailLockedHint')}
          </p>
          <button
            type="button"
            onClick={openEmailModal}
            className="mt-1 flex items-center gap-0.5 text-[12px] text-gray-700 font-semibold hover:text-gray-900 transition-all duration-200 ease-out cursor-pointer"
          >
            {t('settings.account.requestEmailChange')}
            <ArrowRight size={11} className="mt-0.5" />
          </button>
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
                  defaultCountry="SA"
                  country="SA"
                  countrySelectComponent={() => (
                    <div className="flex items-center gap-1.5 pe-2.5 me-2.5 border-e border-gray-200 shrink-0 select-none pointer-events-none">
                      <img
                        src="https://purecatamphetamine.github.io/country-flag-icons/3x2/SA.svg"
                        alt="Saudi Arabia"
                        className="w-5 h-3.5 rounded-[2px] object-cover shadow-sm"
                      />
                      <span className="text-xs font-semibold text-gray-700 dir-ltr">+966</span>
                    </div>
                  )}
                  value={normalizeSaudiPhone(field.value)}
                  onChange={(v) => field.onChange(normalizeSaudiPhone(v))}
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
  );
}
