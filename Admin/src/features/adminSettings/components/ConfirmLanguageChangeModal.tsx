import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, X } from 'lucide-react';

interface ConfirmLanguageChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  targetLanguage: string;
  isPending?: boolean;
}

export const ConfirmLanguageChangeModal: React.FC<ConfirmLanguageChangeModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  targetLanguage,
  isPending = false,
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const displayLanguage =
    targetLanguage === 'Arabic'
      ? t('adminSettings.languages.arabic', { defaultValue: 'Arabic' })
      : t('adminSettings.languages.english', { defaultValue: 'English' });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative bg-white rounded-2xl max-w-md w-full p-6 text-center shadow-2xl border border-gray-100">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isPending}
          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors rtl:right-auto rtl:left-4 cursor-pointer disabled:opacity-50"
        >
          <X size={18} />
        </button>

        <div className="flex flex-col items-center">
          {/* Globe Icon */}
          <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4 border border-blue-100">
            <Globe size={26} />
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {t('adminSettings.confirmLanguageModal.title', {
              defaultValue: 'Change Platform Default Language?',
            })}
          </h3>

          {/* Message */}
          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed mb-6 max-w-sm px-2">
            {t('adminSettings.confirmLanguageModal.message', {
              language: displayLanguage,
              defaultValue: `Are you sure you want to change the platform default language to ${displayLanguage}? This setting will become the default language for the platform.`,
            })}
          </p>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 w-full">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 text-xs sm:text-sm font-semibold py-2.5 px-4 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              {t('adminSettings.confirmLanguageModal.cancel', {
                defaultValue: 'Cancel',
              })}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isPending}
              className="w-full bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white text-xs sm:text-sm font-semibold py-2.5 px-4 rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed shadow-xs inline-flex items-center justify-center gap-2"
            >
              {isPending && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {t('adminSettings.confirmLanguageModal.confirm', {
                defaultValue: 'Yes, Change Language',
              })}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
