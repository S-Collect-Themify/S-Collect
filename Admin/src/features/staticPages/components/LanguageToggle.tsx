import { useTranslation } from 'react-i18next';
import type { EditorLanguage } from '../types';

interface LanguageToggleProps {
  value: EditorLanguage;
  onChange: (lang: EditorLanguage) => void;
}

/** Small EN/AR pill switch used to flip every bilingual editor field between languages. */
export const LanguageToggle = ({ value, onChange }: LanguageToggleProps) => {
  const { t } = useTranslation();

  return (
    <div className="inline-flex items-center gap-0.5 p-0.5 bg-gray-100 rounded-lg">
      <button
        type="button"
        onClick={() => onChange('en')}
        className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
          value === 'en' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        {t('staticPages.language.en', 'English')}
      </button>
      <button
        type="button"
        onClick={() => onChange('ar')}
        className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
          value === 'ar' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        {t('staticPages.language.ar', 'العربية')}
      </button>
    </div>
  );
};
