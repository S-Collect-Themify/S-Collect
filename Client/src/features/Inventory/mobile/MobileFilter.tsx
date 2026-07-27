// features/Inventory/mobile/MobileFilter.tsx
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { FilterKey } from '../constants';
import { FILTER_TABS } from '../constants';

interface MobileFilterProps {
  search: string;
  activeTab: FilterKey;
  onSearchChange: (value: string) => void;
  onFilterChange: (key: FilterKey) => void;
}

export const MobileFilter = ({
  search,
  activeTab,
  onSearchChange,
  onFilterChange,
}: MobileFilterProps) => {
  const { t } = useTranslation();

  return (
    <div className="mb-4 space-y-3">
      {/* Search */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </span>
        <input
          type="text"
          placeholder={t('inventoryPage.search', 'Search products...')}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:border-gray-700 placeholder:text-gray-400 transition-colors"
        />
      </div>

      {/* Filter tabs — horizontally scrollable, no scrollbar shown */}
      <div
        className="flex gap-2 overflow-x-auto"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onFilterChange(tab.key)}
            className={`relative px-4 py-1.5 rounded-xl text-sm font-medium whitespace-nowrap shrink-0 transition-colors ${
              activeTab === tab.key
                ? 'text-white'
                : 'border border-gray-200 text-gray-500 bg-white hover:bg-gray-50'
            }`}
          >
            {/* Active tab background with smooth layout animation */}
            {activeTab === tab.key && (
              <motion.div
                layoutId="mobile-active-tab-pill"
                className="absolute inset-0 bg-gray-900 rounded-xl"
                transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 35,
                  mass: 0.8,
                }}
              />
            )}
            <span className="relative z-10">{t(tab.label)}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
