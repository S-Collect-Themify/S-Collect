import React from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshCw, Plus, ChevronRight, ChevronLeft } from 'lucide-react';
import i18n from '../../../../i18n';

export interface BannersHeaderProps {
  bannersLoading: boolean;
  onRefresh: () => void;
  onAddNew: () => void;
  onNavigateSettings: () => void;
}

export const BannersHeader: React.FC<BannersHeaderProps> = ({
  bannersLoading,
  onRefresh,
  onAddNew,
  onNavigateSettings,
}) => {
  const { t } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const ChevronIcon = isArabic ? ChevronLeft : ChevronRight;

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          {t('banners.title', { defaultValue: 'Banners' })}
        </h1>
        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
          <button
            type="button"
            onClick={onNavigateSettings}
            className="hover:text-black transition-colors cursor-pointer"
          >
            {t('banners.breadcrumb.settings', { defaultValue: 'Settings' })}
          </button>
          <ChevronIcon size={12} />
          <span className="text-gray-900 font-semibold">
            {t('banners.title', { defaultValue: 'Banners' })}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onRefresh}
          disabled={bannersLoading}
          title="Refresh banners"
          className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw size={15} className={bannersLoading ? 'animate-spin' : ''} />
        </button>
        <button
          type="button"
          onClick={onAddNew}
          className="bg-black hover:bg-gray-800 text-white font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
        >
          <Plus size={16} />
          {t('banners.addNewBanner', { defaultValue: 'Add New Banner' })}
        </button>
      </div>
    </div>
  );
};
