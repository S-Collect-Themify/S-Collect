import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Download } from 'lucide-react';
import type { FilterKey } from './constants';
import { FILTER_TABS } from './constants';
import type { InventoryVendorOption } from './types';
import { InventoryVendorFilter } from './InventoryVendorFilter';
import { InventoryImportButton } from './InventoryImportButton';

interface InventoryToolbarProps {
  search: string;
  activeTab: FilterKey;
  vendorId: string;
  vendorOptions: InventoryVendorOption[];
  isVendorsLoading: boolean;
  isExporting: boolean;
  isImporting: boolean;
  onSearchChange: (value: string) => void;
  onFilterChange: (key: FilterKey) => void;
  onVendorChange: (id: string) => void;
  onExport: () => void;
  onImport: (file: File) => void;
}

const ACTION_BTN_CLASS =
  'flex-1 sm:flex-initial flex items-center justify-center gap-2 h-10 px-4 rounded-lg border border-gray-300 bg-gray-50 text-label-md font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap';

export const InventoryToolbar = ({
  search,
  activeTab,
  vendorId,
  vendorOptions,
  isVendorsLoading,
  isExporting,
  isImporting,
  onSearchChange,
  onFilterChange,
  onVendorChange,
  onExport,
  onImport,
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

      {/* Vendor filter */}
      <div className="w-full sm:w-auto">
        <InventoryVendorFilter
          vendors={vendorOptions}
          selectedVendorId={vendorId}
          onSelectVendor={onVendorChange}
          isLoading={isVendorsLoading}
        />
      </div>

      {/* Import from / Export to Excel */}
      <div className="w-full sm:w-auto sm:ms-auto flex items-center gap-2">
        <InventoryImportButton
          onImport={onImport}
          isImporting={isImporting}
          className={ACTION_BTN_CLASS}
        />
        <button
          type="button"
          onClick={onExport}
          disabled={isExporting}
          className={ACTION_BTN_CLASS}
        >
          <Download size={15} className="shrink-0" />
          {isExporting
            ? t('inventoryPage.exporting', 'Exporting...')
            : t('inventoryPage.export', 'Export')}
        </button>
      </div>
    </div>
  );
};
