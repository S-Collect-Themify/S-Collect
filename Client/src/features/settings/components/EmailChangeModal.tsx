import { CheckCircle2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { isValidEmail } from '../utils';
import { getErrorMessage } from '../../../types/api';
import { useAccountSettingsStore } from '../store/useAccountSettingsStore';
import {
  useRequestEmailChange,
  useConfirmEmailChange,
} from '../hooks/useEmailChange';

export function EmailChangeModal() {
  const { t } = useTranslation();

  const {
    emailModalOpen,
    emailStep,
    newEmail,
    otpCode,
    emailError,
    emailSuccessMsg,
    setEmailStep,
    setNewEmail,
    setOtpCode,
    setCurrentEmailDisplay,
    setEmailError,
    setEmailSuccessMsg,
    closeEmailModal,
  } = useAccountSettingsStore();

  const requestEmailMutation = useRequestEmailChange();
  const confirmEmailMutation = useConfirmEmailChange();

  const isLoading =
    requestEmailMutation.isPending || confirmEmailMutation.isPending;

  if (!emailModalOpen) return null;

  const handleRequestEmailChange = async () => {
    if (!isValidEmail(newEmail)) {
      setEmailError(
        t('settings.errors.invalidEmail') || 'Invalid email address'
      );
      return;
    }
    setEmailError(null);

    requestEmailMutation.mutate(newEmail, {
      onSuccess: () => {
        setEmailStep('verify');
      },
      onError: (err: unknown) => {
        setEmailError(
          getErrorMessage(err, 'Failed to send email change request')
        );
      },
    });
  };

  const handleConfirmEmailChange = async () => {
    if (!otpCode || otpCode.length < 6) {
      setEmailError('Please enter a valid 6-digit OTP code');
      return;
    }
    setEmailError(null);

    confirmEmailMutation.mutate(
      { code: otpCode, newEmail },
      {
        onSuccess: () => {
          setCurrentEmailDisplay(newEmail);
          setEmailSuccessMsg('Email changed successfully!');
          setTimeout(() => {
            closeEmailModal();
          }, 1500);
        },
        onError: (err: unknown) => {
          setEmailError(getErrorMessage(err, 'Invalid or expired OTP code'));
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl relative animate-fade-in-up">
        <button
          type="button"
          onClick={closeEmailModal}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer"
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
              disabled={isLoading}
              onClick={handleRequestEmailChange}
              className="w-full py-2.5 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? 'Sending OTP...' : 'Send OTP Code'}
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
              disabled={isLoading}
              onClick={handleConfirmEmailChange}
              className="w-full py-2.5 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? 'Verifying...' : 'Confirm Email Change'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
