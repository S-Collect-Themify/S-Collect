import type { ReactNode } from 'react';
import { Phone, HelpCircle, Undo2, ScrollText, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useStaticPagesStore } from '../staticPagesStore';
import type { StaticPageTab } from '../types';

const TABS: { key: StaticPageTab; labelKey: string; defaultLabel: string; icon: ReactNode }[] = [
  { key: 'contact', labelKey: 'staticPages.tabs.contact', defaultLabel: 'Contact Us', icon: <Phone size={15} /> },
  { key: 'faq', labelKey: 'staticPages.tabs.faq', defaultLabel: 'FAQ', icon: <HelpCircle size={15} /> },
  { key: 'return', labelKey: 'staticPages.tabs.return', defaultLabel: 'Return Policy', icon: <Undo2 size={15} /> },
  { key: 'terms', labelKey: 'staticPages.tabs.terms', defaultLabel: 'Terms & Conditions', icon: <ScrollText size={15} /> },
  { key: 'privacy', labelKey: 'staticPages.tabs.privacy', defaultLabel: 'Privacy Policy', icon: <ShieldCheck size={15} /> },
];

export const StaticPagesTabs = () => {
  const { t } = useTranslation();
  const activeTab = useStaticPagesStore((s) => s.activeTab);
  const setActiveTab = useStaticPagesStore((s) => s.setActiveTab);

  return (
    <div className="flex items-center gap-1 overflow-x-auto border-b border-gray-100 mb-6 scrollbar-thin">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`shrink-0 flex items-center gap-1.5 px-4 py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
              isActive
                ? 'text-gray-900 border-black'
                : 'text-gray-400 border-transparent hover:text-gray-600'
            }`}
          >
            {tab.icon}
            <span>{t(tab.labelKey, tab.defaultLabel)}</span>
          </button>
        );
      })}
    </div>
  );
};
