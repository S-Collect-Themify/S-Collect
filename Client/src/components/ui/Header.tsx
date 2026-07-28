import { Link } from 'react-router-dom';
import { Menu, User } from 'lucide-react';
import InputSearch from './InputSearch';
import { useTranslation } from 'react-i18next';
import { Globe, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import i18n from '../../i18n';
import PortalDropdown from './PortalDropdown';
import { useStoreProfile } from '../../features/settings/hooks/useStoreProfile';

import { useStoreProfile } from '../../features/settings/hooks/useStoreProfile';

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
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors hover:bg-gray-50 cursor-pointer ${
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
  const { data: profile } = useStoreProfile();

  const logoUrl = profile?.storeLogoUrl;
  console.log('Header Logo URL:', logoUrl);
  console.log('Full Profile:', profile);

  const today = new Date().toLocaleDateString(
    i18n.language === 'ar' ? 'ar-EG' : 'en-US',
    {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }
  );

  const storeDisplayName =
    i18n.language === 'ar' && profile?.storeNameAr
      ? profile.storeNameAr
      : profile?.storeName || (i18n.language === 'ar' ? 'المتجر' : 'Store');

  return (
    <header className="bg-(--gray-950) shadow-md p-4 text-white sticky inset-0 z-50">
      <div className="container mx-auto flex flex-col gap-4 sidebar:flex-row sidebar:justify-between sidebar:items-center">
        <div className="flex items-center justify-between gap-4 sidebar:hidden">
          <div className="flex items-center gap-3">
            <a href="/">
              <img src="/mobLogo.png" alt="Logo" className="h-10 w-10" />
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
          <div className="flex items-center gap-2">
            <div className="sidebar:hidden block">
              <InputSearch />
            </div>
            <Link
              to="/settings"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full overflow-hidden border border-gray-700 bg-gray-800 text-gray-50 transition-colors shrink-0"
              aria-label={t('header.account')}
            >
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Store Logo"
                  className="h-8 w-8 rounded-full object-cover border border-white/20"
                />
              ) : (
                <User size={24} />
              )}
            </Link>
          </div>
        </div>

        <div className="hidden items-center justify-between gap-4 sidebar:flex">
          <div>
            <h1 className="text-2xl font-bold">
              {i18n.language === 'ar'
                ? `مرحباً, ${storeDisplayName} 👋`
                : `Hello, ${storeDisplayName} 👋`}
            </h1>
            <p className="text-sm text-gray-200">{today}</p>
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
            to="/settings"
            aria-label={t('header.account')}
            className="hidden sidebar:flex h-10 w-10 items-center justify-center rounded-full overflow-hidden border border-gray-700 bg-gray-800 text-gray-200 hover:border-gray-500 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white shrink-0"
          >
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Store Logo"
                className="h-7 w-7 rounded-full object-cover border border-white/20"
              />
            ) : (
              <User />
            )}
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
