import {
  Boxes,
  PackageOpen,
  X,
  ChartNoAxesCombined,
  CirclePlus,
  Handbag,
  SquareUserRoundIcon,
  RotateCcw,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import type { ReactNode } from 'react';
import Logo from '../ui/Logo';
import LogoutButton from '../auth/LogoutButton';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { Variants } from 'motion/react';
import { Globe, Check } from 'lucide-react';
import i18n from '../../i18n';
import PortalDropdown from './PortalDropdown';

// ─── Types ────────────────────────────────────────────────────────────────────
interface NavItemProps {
  icon: ReactNode;
  labelKey: string;
  to: string;
  danger?: boolean;
  onClick?: () => void;
}

interface NavSectionProps {
  titleKey: string;
  items: NavItemProps[];
  onItemClick?: () => void;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// ─── Language Dropdown ────────────────────────────────────────────────────────
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
      align={isArabic ? 'right' : 'left'}
      minWidth={140}
      animate
      menuClassName="bg-gray-800 border border-gray-700 rounded-lg shadow-xl py-1 overflow-hidden"
      trigger={({ isOpen, toggle }) => (
        <button
          onClick={toggle}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-label-md text-gray-400 hover:bg-gray-800/40 hover:text-gray-100 transition-all duration-200 cursor-pointer"
        >
          <Globe size={18} className="shrink-0" />
          <span className="truncate">{currentLang.short}</span>
          <motion.span
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="ml-auto"
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
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors hover:bg-gray-700 cursor-pointer ${
                lang.code === i18n.language
                  ? 'text-white font-medium bg-gray-700/50'
                  : 'text-gray-400'
              }`}
            >
              <span className="text-base">{lang.short}</span>
              <span>{lang.label}</span>
              {lang.code === i18n.language && (
                <Check size={14} className="ml-auto text-gray-200" />
              )}
            </button>
          ))}
        </>
      )}
    </PortalDropdown>
  );
};

// ─── Nav Item ─────────────────────────────────────────────────────────────────
const NavItem = ({
  icon,
  labelKey,
  to,
  danger = false,
  onClick,
}: NavItemProps) => {
  const { t } = useTranslation();

  return (
    <motion.div variants={navItemVariants}>
      <NavLink
        to={to}
        onClick={onClick}
        className={({ isActive }) =>
          `group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 ease-in-out relative overflow-hidden text-label-md
          ${
            isActive
              ? 'bg-gray-800 text-gray-50 font-medium'
              : danger
                ? 'text-red-500 hover:bg-red-500/10 hover:text-red-500'
                : 'text-gray-400 hover:bg-gray-800/40 hover:text-gray-100'
          }`
        }
      >
        <span className="shrink-0">{icon}</span>
        <span className="truncate">{t(labelKey)}</span>
        <span className="absolute left-0 top-0 h-full w-0 bg-gray-700/20 group-hover:w-full transition-all duration-300" />
      </NavLink>
    </motion.div>
  );
};

// ─── Nav Section ──────────────────────────────────────────────────────────────
const NavSection = ({ titleKey, items, onItemClick }: NavSectionProps) => {
  const { t } = useTranslation();

  return (
    <motion.div variants={navListVariants} className="px-3 mt-5">
      <motion.p
        variants={navItemVariants}
        className="text-caption font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2"
      >
        {t(titleKey)}
      </motion.p>
      <motion.div variants={navListVariants} className="flex flex-col gap-0.5">
        {items.map((item) => (
          <NavItem key={item.to} {...item} onClick={onItemClick} />
        ))}
      </motion.div>
    </motion.div>
  );
};

// ─── Navigation Data ──────────────────────────────────────────────────────────
const NAV_SECTIONS: NavSectionProps[] = [
  {
    titleKey: 'sidebar.sections.main',
    items: [
      {
        icon: <ChartNoAxesCombined size={18} />,
        labelKey: 'sidebar.items.dashboard',
        to: '/',
      },
    ],
  },
  {
    titleKey: 'sidebar.sections.products',
    items: [
      {
        icon: <PackageOpen size={18} />,
        labelKey: 'sidebar.items.management',
        to: '/management',
      },
      {
        icon: <CirclePlus size={18} />,
        labelKey: 'sidebar.items.addProduct',
        to: '/add-product',
      },
    ],
  },
  {
    titleKey: 'sidebar.sections.management',
    items: [
      {
        icon: <Boxes size={18} />,
        labelKey: 'sidebar.items.inventory',
        to: '/inventory',
      },
      {
        icon: <Handbag size={18} />,
        labelKey: 'sidebar.items.incomingOrders',
        to: '/incoming-orders',
      },
      {
        icon: <Handbag size={18} />,
        labelKey: 'sidebar.sections.receivables',
        to: '/receivables',
      },
      {
        icon: <RotateCcw size={18} />,
        labelKey: 'sidebar.items.returns',
        to: '/returns',
      },
    ],
  },
  {
    titleKey: 'sidebar.sections.account',
    items: [
      {
        icon: <Handbag size={18} />,
        labelKey: 'sidebar.items.settings',
        to: '/settings',
      },
      {
        icon: <SquareUserRoundIcon size={18} />,
        labelKey: 'sidebar.items.accountSettings',
        to: '/account-settings',
      },
    ],
  },
];

// ─── Animation Variants ───────────────────────────────────────────────────────
const getSidebarVariants = (isArabic: boolean): Variants => ({
  open: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'tween',
      ease: 'easeOut',
      duration: 0.25,
    },
  },
  closed: {
    x: isArabic ? '100%' : '-100%',
    opacity: 0,
    transition: {
      type: 'tween',
      ease: 'easeIn',
      duration: 0.2,
    },
  },
});

const navListVariants: Variants = {
  open: {},
  closed: {},
};

const navItemVariants: Variants = {
  open: { opacity: 1, y: 0 },
  closed: { opacity: 1, y: 0 },
};

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const isArabic = i18n.language === 'ar';

  const sidebarVariants = getSidebarVariants(isArabic);

  const SidebarContent = (
    <>
      <div className="shrink-0 flex items-center justify-between pt-5 px-5 sidebar:justify-start">
        <Logo />
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-gray-300 hover:bg-gray-800 sidebar:hidden cursor-pointer"
          aria-label="Close sidebar"
        >
          <X size={20} />
        </button>
      </div>

      <motion.nav
        variants={navListVariants}
        className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-gray-800"
      >
        {NAV_SECTIONS.map((section) => (
          <NavSection
            key={section.titleKey}
            {...section}
            onItemClick={onClose}
          />
        ))}

        <div className="px-3 mt-5 sidebar:hidden">
          <LanguageDropdown />
        </div>
      </motion.nav>

      <div className="shrink-0 p-3">
        <LogoutButton />
      </div>
    </>
  );

  return (
    <>
      <aside
        className={`hidden sidebar:flex w-64 h-dvh bg-(--gray-950) flex-col sticky top-0 z-70 ${
          isArabic ? 'right-0' : 'left-0'
        }`}
      >
        {SidebarContent}
      </aside>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              key="sidebar-overlay"
              className="fixed inset-0 bg-black/70 z-60 sidebar:hidden overscroll-none"
              onClick={onClose}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />

            <motion.aside
              key="sidebar-mobile"
              className={`w-64 h-dvh bg-(--gray-950) flex flex-col fixed top-0 z-70 sidebar:hidden ${
                isArabic ? 'right-0' : 'left-0'
              }`}
              variants={sidebarVariants}
              initial="closed"
              animate="open"
              exit="closed"
            >
              <motion.div className="contents">{SidebarContent}</motion.div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
