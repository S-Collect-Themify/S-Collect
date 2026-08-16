import { Link } from 'react-router-dom';
import { Menu, User } from 'lucide-react';
import InputSearch from './InputSearch';
import { useTranslation } from 'react-i18next';
import { Globe, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import i18n from '../../i18n';
import PortalDropdown from './PortalDropdown';
import { useAdminProfile } from '../../hooks/useAdminProfile';

interface HeaderProps {
  onMenuClick: () => void;
}

const LANGUAGES = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'ar', label: 'العربية', short: 'AR' },
];

const LanguageDropdown = () => {
  const isArabic = i18n.language === 'ar';

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('lang', lang);
  };

  const currentLang =
    LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0];

  return (
    <PortalDropdown
      align={isArabic ? 'left' : 'right'}
      minWidth={140}
      animate
      menuClassName="bg-white border border-gray-200 rounded-lg shadow-lg py-1 overflow-hidden"
      trigger={({ isOpen, toggle }) => (
        <button
          onClick={toggle}
          aria-label="Select language"
          className="flex items-center gap-2 bg-gray-50 text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <Globe size={16} />
          <span className="text-sm font-medium">{currentLang.short}</span>
          <motion.span
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </motion.span>
        </button>
      )}
    >
      {({ close }) => (
        <>
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                handleLanguageChange(lang.code);
                close();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors hover:bg-gray-50 ${
                lang.code === i18n.language
                  ? 'text-gray-900 font-medium bg-gray-50'
                  : 'text-gray-600'
              }`}
            >
              <span className="text-base">{lang.short}</span>
              <span>{lang.label}</span>
              {lang.code === i18n.language && (
                <Check size={14} className="ml-auto text-gray-900" />
              )}
            </button>
          ))}
        </>
      )}
    </PortalDropdown>
  );
};

const Header = ({ onMenuClick }: HeaderProps) => {
  const { t, i18n } = useTranslation();

  const today = new Date().toLocaleDateString(
    i18n.language === 'ar' ? 'ar-EG' : 'en-US',
    {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }
  );

  const { fullName } = useAdminProfile();
  const userName = fullName;

  return (
    <header className="bg-(--gray-950) shadow-md p-4 text-white sticky inset-0 z-50">
      <div className="container mx-auto flex flex-col gap-4 sidebar:flex-row sidebar:justify-between sidebar:items-center">
        <div className="flex items-center justify-between gap-4 sidebar:hidden">
          <div className="flex items-center gap-3">
            <a href="/">
              <img src="/mobLogo.png" alt="Logo" className="h-10 w-10" fetchPriority="high" />
            </a>
            <button
              type="button"
              onClick={onMenuClick}
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-gray-50 transition-colors cursor-pointer"
              aria-label="Open sidebar"
            >
              <Menu size={24} />
            </button>
          </div>
          <div className="flex items-center">
            <div className="sidebar:hidden block">
              <InputSearch />
            </div>
            <Link
              to="/login"
              className="inline-flex h-11 w-11 items-center justify-center text-gray-50 transition-colors"
              aria-label="Account"
            >
              <User size={24} />
            </Link>
          </div>
        </div>

        <div className="hidden items-center justify-between gap-4 sidebar:flex">
          <div>
            <p className="text-2xl font-bold">
              {t('header.greeting', { name: userName || 'Admin', defaultValue: `Hello, ${userName || 'Admin'} 👋` })}
            </p>
            <p className="text-sm text-gray-400">{today}</p>
          </div>
        </div>

        <div className="items-center gap-3 sidebar:gap-4 sidebar:flex hidden">
          <div className="flex-1 sidebar:flex-none sidebar:block hidden">
            <InputSearch />
          </div>

          <div className="hidden sidebar:flex">
            <LanguageDropdown />
          </div>

          <Link
            to="/login"
            className="hidden text-2xl hover:text-gray-300 sidebar:block"
            aria-label="Account"
          >
            <User />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
