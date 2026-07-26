import React from 'react';
import { useTranslation } from 'react-i18next';
import { Mail } from 'lucide-react';
import { useAdminSettingsStore } from '../store';

export const EmailExistsModal: React.FC = () => {
  const { t } = useTranslation();
  const { emailExistsModal, closeEmailExistsModal } = useAdminSettingsStore();

  if (!emailExistsModal.open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl border border-gray-100 relative">
        <div className="flex flex-col items-center">
          <div className="size-14 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mb-4 border border-amber-100">
            <Mail size={26} />
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {t('adminSettings.emailExistsTitle', { defaultValue: 'Email Already Exists' })}
          </h3>

          <p className="text-xs text-gray-500 leading-relaxed mb-6 max-w-xs">
            {t('adminSettings.emailExistsDesc', {
              defaultValue:
                'An admin with this email address already exists. Please use a different email or contact the existing admin.',
            })}
          </p>

          <div className="grid grid-cols-2 gap-3 w-full">
            <button
              type="button"
              onClick={closeEmailExistsModal}
              className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 text-xs font-semibold py-2.5 px-4 rounded-xl transition-colors cursor-pointer"
            >
              {t('common.cancel', { defaultValue: 'Cancel' })}
            </button>
            <button
              type="button"
              onClick={closeEmailExistsModal}
              className="w-full bg-black hover:bg-gray-800 text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              {t('common.tryAgain', { defaultValue: 'Try Again' })}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
