import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

import { FieldWrap, TextInput } from '../shared';
import type { StoreProfileData } from '../types';
import { cn, isValidEmail } from '../utils';

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
                international
                defaultCountry="SA"
                value={field.value}
                onChange={(v) => field.onChange(v ?? '')}
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
