import React from 'react';
import { useTranslation } from 'react-i18next';
import { SquarePen, Trash2, Plus, ChevronRight, ChevronLeft } from 'lucide-react';
import i18n from '../../../i18n';
import { useAdminSettingsStore } from '../store';
import type { BannerItem } from '../types';

export const MobileBannersList: React.FC = () => {
  const { t } = useTranslation();
  const {
    banners,
    setViewMode,
    setEditingBanner,
    openDeleteModal,
  } = useAdminSettingsStore();
  const isArabic = i18n.language === 'ar';
  const ChevronIcon = isArabic ? ChevronLeft : ChevronRight;

  const handleEdit = (banner: BannerItem) => {
    setEditingBanner(banner);
    setViewMode('banners-edit');
  };

  return (
    <div className="space-y-5 w-full pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 mb-0.5">
            {t('banners.title', { defaultValue: 'Banners' })}
          </h1>
          <div className="flex items-center gap-1 text-[11px] text-gray-400 font-medium">
            <button
              type="button"
              onClick={() => setViewMode('settings')}
              className="hover:text-black transition-colors cursor-pointer"
            >
              {t('banners.breadcrumb.settings', { defaultValue: 'Settings' })}
            </button>
            <ChevronIcon size={10} />
            <span className="text-gray-700 font-semibold">
              {t('banners.title', { defaultValue: 'Banners' })}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingBanner(null);
            setViewMode('banners-add');
          }}
          className="bg-black hover:bg-gray-800 text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
        >
          <Plus size={14} />
          <span>{t('banners.addNewBanner', { defaultValue: 'Add New' })}</span>
        </button>
      </div>

      {/* Cards List */}
      {banners.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center text-gray-400 text-xs border border-gray-100 shadow-2xs">
          {t('banners.noBanners', { defaultValue: 'No banners added yet.' })}
        </div>
      ) : (
        <div className="space-y-3.5">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs hover:border-gray-200 transition-all"
            >
              {/* Top Row: Thumbnail + Title & Link */}
              <div className="flex items-start gap-3">
                <div className="w-24 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-100 shadow-2xs">
                  {banner.imageUrl ? (
                    <img
                      src={banner.imageUrl}
                      alt={banner.name}
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="size-full flex items-center justify-center text-gray-400 text-[10px] font-medium">
                      No Img
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-gray-900 text-sm mb-0.5 truncate">
                    {banner.name}
                  </h3>
                  <a
                    href={banner.redirectUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-gray-400 font-normal hover:underline hover:text-black transition-colors block truncate"
                  >
                    {banner.redirectUrl}
                  </a>
                </div>
              </div>

              {/* Bottom Row: Status + Date & Action Icons */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-3">
                <div className="flex items-center gap-2.5">
                  {banner.isActive ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100/50">
                      {t('banners.status.active', { defaultValue: 'Active' })}
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-500 border border-red-100/50">
                      {t('banners.status.inactive', { defaultValue: 'Inactive' })}
                    </span>
                  )}
                  <span className="text-xs text-gray-400 font-normal">
                    {banner.dateAdded}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(banner)}
                    className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-black transition-colors cursor-pointer"
                    title={t('banners.edit', { defaultValue: 'Edit Banner' })}
                  >
                    <SquarePen size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => openDeleteModal(banner)}
                    className="p-1.5 rounded-lg border border-red-100 bg-red-50/40 text-red-500 hover:bg-red-100 transition-colors cursor-pointer"
                    title={t('banners.delete', { defaultValue: 'Delete Banner' })}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
