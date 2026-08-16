import {
  X,
  ChartNoAxesCombined,
  FileChartColumn,
  PackageOpen,
  BadgePercent,
  CircleDollarSign,
  ArrowLeftRight,
  LayoutGrid,
  CirclePlus,
  Star,
  PackageCheck,
  Handbag,
  Settings,
  LogOut,
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import Logo from '../ui/Logo';
import LogoutModal from '../auth/LogoutModal';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Globe, Check } from 'lucide-react';
import i18n from '../../i18n';
import PortalDropdown from './PortalDropdown';
import toast from 'react-hot-toast';
import { logout, clearTokens } from '../../services/auth';

// ─── Types ────────────────────────────────────────────────────────────────────
interface NavItemProps {
  icon: ReactNode;
  labelKey: string;
  to?: string;
  danger?: boolean;
  onClick?: () => void;
  isLogout?: boolean;
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
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-label-md text-gray-400 hover:bg-gray-800/40 hover:text-gray-100 transition-all duration-200"
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
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors hover:bg-gray-700 ${lang.code === i18n.language
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
    <div>
      <NavLink
        to={to ?? '#'}
        onClick={onClick}
        className={({ isActive }) =>
          `group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors text-label-md
          ${isActive
            ? 'bg-gray-800 text-gray-50 font-medium'
            : danger
              ? 'text-red-500 hover:bg-red-500/10 hover:text-red-500'
              : 'text-gray-400 hover:bg-gray-800/40 hover:text-gray-100'
          }`
        }
      >
        <span className="shrink-0">{icon}</span>
        <span className="truncate">{t(labelKey)}</span>
      </NavLink>
    </div>
  );
};

// ─── Logout Nav Item ──────────────────────────────────────────────────────────
const LogoutNavItem = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await logout(refreshToken);
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      clearTokens();
      toast.success('Logged out successfully');
      navigate('/login', { replace: true });
      setOpen(false);
      setLoading(false);
    }
  };

  return (
    <>
      <div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors text-label-md text-gray-400 hover:bg-red-500/10 hover:text-red-500 w-full text-start"
        >
          <span className="shrink-0">
            <LogOut size={18} />
          </span>
          <span className="truncate">{t('sidebar.items.logout')}</span>
        </button>
      </div>

      <LogoutModal
        open={open}
        loading={loading}
        onClose={() => setOpen(false)}
        onConfirm={handleLogout}
      />
    </>
  );
};

// ─── Nav Section ──────────────────────────────────────────────────────────────
const NavSection = ({ titleKey, items, onItemClick }: NavSectionProps) => {
  const { t } = useTranslation();

  return (
    <div className="px-3 mt-5">
      <p className="text-caption font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
        {t(titleKey)}
      </p>
      <div className="flex flex-col gap-0.5">
        {items.map((item) =>
          item.isLogout ? (
            <LogoutNavItem key="logout" />
          ) : (
            <NavItem key={item.to} {...item} onClick={onItemClick} />
          )
        )}
      </div>
    </div>
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
    titleKey: 'sidebar.sections.financialReports',
    items: [
      {
        icon: <PackageOpen size={18} />,
        labelKey: 'sidebar.items.vendors',
        to: '/vendors',
      },
      {
        icon: <FileChartColumn size={18} />,
        labelKey: 'sidebar.items.vendorReports',
        to: '/vendor-reports',
      },
      {
        icon: <BadgePercent size={18} />,
        labelKey: 'sidebar.items.commissionRates',
        to: '/commission-rates',
      },
      {
        icon: <CircleDollarSign size={18} />,
        labelKey: 'sidebar.items.payouts',
        to: '/payouts',
      },
      {
        icon: <ArrowLeftRight size={18} />,
        labelKey: 'sidebar.items.transactions',
        to: '/transactions',
      },
    ],
  },
  {
    titleKey: 'sidebar.sections.management',
    items: [
      {
        icon: <LayoutGrid size={18} />,
        labelKey: 'sidebar.items.categories',
        to: '/categories',
      },
      {
        icon: <CirclePlus size={18} />,
        labelKey: 'sidebar.items.products',
        to: '/products',
      },
      {
        icon: <Star size={18} />,
        labelKey: 'sidebar.items.reviews',
        to: '/reviews',
      },
      {
        icon: <PackageCheck size={18} />,
        labelKey: 'sidebar.items.orders',
        to: '/orders',
      },
      {
        icon: <Handbag size={18} />,
        labelKey: 'sidebar.items.buyers',
        to: '/buyers',
      },
    ],
  },
  {
    titleKey: 'sidebar.sections.account',
    items: [
      {
        icon: <Settings size={18} />,
        labelKey: 'sidebar.items.adminSettings',
        to: '/admin-settings',
      },
      {
        icon: <LogOut size={18} />,
        labelKey: 'sidebar.items.logout',
        isLogout: true,
      },
    ],
  },
];

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

      <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-gray-800">
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
      </nav>
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

      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/70 z-60 sidebar:hidden overscroll-none"
            onClick={onClose}
          />

          <aside
            className={`w-64 h-dvh bg-(--gray-950) flex flex-col fixed top-0 z-70 sidebar:hidden ${
              isArabic ? 'right-0' : 'left-0'
            }`}
          >
            <div className="contents">{SidebarContent}</div>
          </aside>
        </>
      )}
    </>
  );
};

export default Sidebar;
