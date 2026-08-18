import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

import { FieldWrap, TextInput } from '../shared';
import type { StoreProfileData } from '../types';
import { cn, isValidEmail, normalizeSaudiPhone } from '../utils';

export function StoreContactInfoSection({
  isPending,
}: {
  isPending?: boolean;
}) {
  const { t } = useTranslation();
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<StoreProfileData>();

  return (
    <div className="settings-surface-enter settings-stagger-3 mb-4 md:mb-6">
      <h3 className="text-xl font-medium text-[#090909] mb-3">
        {t('settings.contactInformation')}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FieldWrap
          label={t('settings.publicEmail')}
          error={errors.publicEmail?.message}
        >
          <TextInput
            type="email"
            placeholder={t('settings.emailPlaceholder')}
            disabled={isPending}
            error={errors.publicEmail?.message}
            {...register('publicEmail', {
              required: t('settings.errors.invalidEmail'),
              validate: (v) =>
                isValidEmail(v) || t('settings.errors.invalidEmail'),
            })}
          />
        </FieldWrap>
        <FieldWrap
          label={t('settings.phoneNumber')}
          error={errors.phoneNumber?.message}
        >
          <Controller
            name="phoneNumber"
            control={control}
            rules={{
              required: t('settings.errors.invalidPhone'),
              validate: (v) => (v ? true : t('settings.errors.invalidPhone')),
            }}
            render={({ field }) => (
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
                disabled={isPending}
                className={cn(
                  'phone-input-custom h-10 rounded-lg px-3',
                  errors.phoneNumber && 'phone-error'
                )}
              />
            )}
          />
        </FieldWrap>
      </div>
    </div>
  );
}
