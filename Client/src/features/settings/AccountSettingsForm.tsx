import { ArrowRight, ChevronDown, Info, Lock, X, CheckCircle2 } from 'lucide-react';
import { useState, useTransition } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

import {
  PasswordInput,
  PasswordStrengthBar,
  SectionCard,
  TextInput,
} from './shared';
import { getPasswordStrength, cn, isValidEmail } from './utils';
import type { AccountSettingsData, PasswordData } from './types';
import { changeEmail, confirmChangeEmail } from '../../services/auth';
import { useChangePassword } from './hooks/useChangePassword';
import { getErrorMessage } from '../../types/api';

type AccountSettingsFormValues = AccountSettingsData & PasswordData;

export function AccountSettingsForm({
  initialData,
  onSave,
  onSuccess,
}: {
  initialData: AccountSettingsData;
  onSave: (d: AccountSettingsData & PasswordData) => Promise<void>;
  onSuccess: () => void;
}) {
  const { t } = useTranslation();
  const [pwOpen, setPwOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const changePasswordMutation = useChangePassword();

  // Email Change Modal State
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailStep, setEmailStep] = useState<'request' | 'verify'>('request');
  const [newEmail, setNewEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [currentEmailDisplay, setCurrentEmailDisplay] = useState(initialData.email);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccessMsg, setEmailSuccessMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<AccountSettingsFormValues>({
    values: {
      ...initialData,
      email: currentEmailDisplay,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const newPassword = watch('newPassword');

  const handleRequestEmailChange = async () => {
    if (!isValidEmail(newEmail)) {
      setEmailError(t('settings.errors.invalidEmail') || 'Invalid email address');
      return;
    }
    setEmailLoading(true);
    setEmailError(null);
    try {
      await changeEmail(newEmail);
      setEmailStep('verify');
    } catch (err: unknown) {
      setEmailError(getErrorMessage(err, 'Failed to send email change request'));
    } finally {
      setEmailLoading(false);
    }
  };

  const handleConfirmEmailChange = async () => {
    if (!otpCode || otpCode.length < 6) {
      setEmailError('Please enter a valid 6-digit OTP code');
      return;
    }
    setEmailLoading(true);
    setEmailError(null);
    try {
      const refreshToken = localStorage.getItem('refreshToken') || '';
      await confirmChangeEmail(otpCode, refreshToken);
      setCurrentEmailDisplay(newEmail);
      setEmailSuccessMsg('Email changed successfully!');
      setTimeout(() => {
        setEmailModalOpen(false);
        setEmailStep('request');
        setNewEmail('');
        setOtpCode('');
        setEmailSuccessMsg(null);
      }, 1500);
    } catch (err: unknown) {
      setEmailError(getErrorMessage(err, 'Invalid or expired OTP code'));
    } finally {
      setEmailLoading(false);
    }
  };

  const onSubmit = (data: AccountSettingsFormValues) => {
    startTransition(async () => {
      try {
        if (data.currentPassword && data.newPassword) {
          await changePasswordMutation.mutateAsync({
            currentPassword: data.currentPassword,
            newPassword: data.newPassword,
          });
        }
        await onSave({ ...data, email: currentEmailDisplay });
        setValue('currentPassword', '');
        setValue('newPassword', '');
        setValue('confirmPassword', '');
        onSuccess();
      } catch (err) {
        console.error('Failed to save account settings:', err);
      }
    });
  };

  const onInvalid = () => {
    if (
      errors.currentPassword ||
      errors.newPassword ||
      errors.confirmPassword
    ) {
      setPwOpen(true);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit, onInvalid)}
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
                    {currentEmailDisplay || initialData.email}
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
                onClick={() => {
                  setEmailModalOpen(true);
                  setEmailStep('request');
                  setEmailError(null);
                }}
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
                className="p-1 rounded text-gray-500 transition-all duration-300 ease-out hover:bg-gray-100 hover:scale-110 mt-0.5"
                onClick={() => setPwOpen((v) => !v)}
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
                      />
                    )}
                  />

                  <div>
                    <Controller
                      name="newPassword"
                      control={control}
                      rules={{
                        validate: (val, formValues) => {
                          const hasPw = Boolean(
                            val ||
                            formValues.currentPassword ||
                            formValues.confirmPassword
                          );
                          if (hasPw && getPasswordStrength(val) < 4)
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

        <div className="flex justify-center md:justify-end pt-1">
          <button
            type="submit"
            disabled={isPending}
            className="py-3 px-4 rounded-lg text-sm font-semibold text-white bg-[#090909] md:w-fit w-full disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-all duration-200 ease-out active:scale-95 min-w-[130px] flex items-center justify-center cursor-pointer"
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

      {/* Email Change Modal */}
      {emailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl relative animate-fade-in-up">
            <button
              type="button"
              onClick={() => setEmailModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {emailStep === 'request' ? 'Change Email Address' : 'Verify OTP Code'}
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              {emailStep === 'request'
                ? 'An OTP code will be sent to your phone number on file to confirm this change.'
                : `Enter the 6-digit OTP code sent to your phone to confirm changing your email to ${newEmail}.`}
            </p>

            {emailError && (
              <div className="mb-4 p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">
                {emailError}
              </div>
            )}

            {emailSuccessMsg && (
              <div className="mb-4 p-3 flex items-center gap-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle2 size={16} />
                {emailSuccessMsg}
              </div>
            )}

            {emailStep === 'request' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    New Email Address
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="new-email@example.com"
                    className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-900"
                  />
                </div>
                <button
                  type="button"
                  disabled={emailLoading}
                  onClick={handleRequestEmailChange}
                  className="w-full py-2.5 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 cursor-pointer"
                >
                  {emailLoading ? 'Sending OTP...' : 'Send OTP Code'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    OTP Code (6 Digits)
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="123456"
                    className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm tracking-widest text-center font-mono focus:outline-none focus:border-gray-900"
                  />
                </div>
                <button
                  type="button"
                  disabled={emailLoading}
                  onClick={handleConfirmEmailChange}
                  className="w-full py-2.5 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 cursor-pointer"
                >
                  {emailLoading ? 'Verifying...' : 'Confirm Email Change'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
