import { Menu, Store } from 'lucide-react';
import InputSearch from './InputSearch';
import { useTranslation } from 'react-i18next';
import { Globe, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import i18n from '../../i18n';
import PortalDropdown from './PortalDropdown';

import { useStoreProfile } from '../../features/settings/hooks/useStoreProfile';
import { useAccountSettings } from '../../features/settings/hooks/useAccountSettings';
import { NotificationBell } from '../../features/notifications';

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
  const { data: profile, isLoading: isProfileLoading } = useStoreProfile();
  const { data: account, isLoading: isAccountLoading } = useAccountSettings();

  const isLoading = isProfileLoading || isAccountLoading;
  const logoUrl = profile?.storeLogoUrl;

  const isArabic = i18n.language === 'ar';

  const vendorName = [account?.firstName, account?.lastName]
    .filter(Boolean)
    .join(' ')
    .trim();

  const storeName = (
    isArabic && profile?.storeNameAr
      ? profile.storeNameAr
      : profile?.storeName
  )?.trim();

  const emailName = (account?.email || profile?.publicEmail)
    ?.split('@')[0]
    ?.trim();

  const displayName =
    vendorName || storeName || emailName || (isArabic ? 'تاجر' : 'Vendor');

  const today = new Date().toLocaleDateString(
    isArabic ? 'ar-EG' : 'en-US',
    {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }
  );

  return (
    <header className="bg-(--gray-950) shadow-md px-4 py-3 sm:px-6 text-white sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          <div className="flex items-center gap-2 sidebar:hidden shrink-0">
            <a href="/" className="shrink-0">
              <img src="/mobLogo.png" alt="Logo" className="h-9 w-9 object-contain" />
            </a>
            <button
              type="button"
              onClick={onMenuClick}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-gray-100 hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Open sidebar"
            >
              <Menu size={22} />
            </button>
          </div>

          <div className="min-w-0">
            {isLoading ? (
              <div className="h-6 sm:h-7 w-32 sm:w-44 bg-white/20 rounded-md animate-pulse my-1" />
            ) : (
              <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold truncate tracking-tight">
                {isArabic
                  ? `مرحباً, ${displayName}`
                  : `Hello, ${displayName}`}
              </h1>
            )}
            <p className="text-xs sm:text-sm text-gray-300 truncate hidden sm:block">{today}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 shrink-0">
          <InputSearch />
          <LanguageDropdown />
          <NotificationBell />
          <div
            aria-label={t('header.account')}
            className="inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center text-gray-50 shrink-0"
          >
            {isProfileLoading ? (
              <div className="h-8 w-8 rounded-full bg-white/20 animate-pulse" />
            ) : logoUrl ? (
              <img
                src={logoUrl}
                alt="Store Logo"
                className="h-8 w-8 sm:h-9 sm:w-9 rounded-full object-cover border border-white/20"
              />
            ) : (
              <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-400 flex items-center justify-center shadow-sm">
                <Store size={18} />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
