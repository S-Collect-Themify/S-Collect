import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { FilterKey } from './constants';
import { FILTER_TABS } from './constants';

interface InventoryToolbarProps {
  search: string;
  activeTab: FilterKey;
  onSearchChange: (value: string) => void;
  onFilterChange: (key: FilterKey) => void;
}

export const InventoryToolbar = ({
  search,
  activeTab,
  onSearchChange,
  onFilterChange,
}: InventoryToolbarProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 mb-6">
      {/* Search - Full width on mobile */}
      <div className="relative w-full sm:w-auto">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="icon-stroke"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </span>
        <input
          type="text"
          placeholder={t('inventoryPage.search')}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full sm:w-48 pl-9 pr-3 py-2 text-body-md border border-gray-300 rounded-lg bg-gray-100 text-gray-900 focus:outline-none focus:border-gray-600 placeholder:text-gray-400 transition-colors"
        />
      </div>

      {/* Filter Tabs - Scrollable on small screens */}
      <div className="w-full sm:w-auto overflow-x-auto no-scrollbar -mx-1 px-1">
        <div className="flex gap-2 min-w-max sm:min-w-0 p-0.5 bg-gray-100 rounded-lg">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => onFilterChange(tab.key)}
              className={`relative px-4 py-2 rounded-md text-label-md transition-colors cursor-pointer select-none whitespace-nowrap ${
                activeTab === tab.key
                  ? 'text-gray-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {/* Active tab background with smooth layout animation */}
              {activeTab === tab.key && (
                <motion.div
                  layoutId="active-tab-pill"
                  className="absolute inset-0 bg-gray-900 rounded-md shadow-sm"
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
    </div>
  );
};
