import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react';
import { useAdminSettingsStore } from '../store';

export const DeleteBannerModal: React.FC = () => {
  const { t } = useTranslation();
  const { deleteModal, closeDeleteModal, confirmDeleteBanner } = useAdminSettingsStore();

  if (!deleteModal.open || !deleteModal.banner) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-gray-100 relative text-center">
        {/* Warning Icon Badge */}
        <div className="size-16 rounded-full bg-red-50/80 text-red-600 flex items-center justify-center mx-auto mb-5">
          <AlertTriangle className="size-8 stroke-[1.75]" />
        </div>

        {/* Modal Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {t('banners.deleteModal.title', { defaultValue: 'Confirm Delete Banner' })}
        </h3>

        {/* Modal Subtitle / Description */}
        <p className="text-sm text-gray-500 font-normal leading-relaxed mb-8 max-w-xs mx-auto">
          {t('banners.deleteModal.message', {
            defaultValue: 'Are you sure you want to delete this banner? This action cannot be undone.',
          })}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={closeDeleteModal}
            className="flex-1 py-3 px-5 text-sm font-semibold text-gray-800 bg-gray-50 border border-gray-200/80 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
          >
            {t('banners.deleteModal.cancel', { defaultValue: 'Cancel' })}
          </button>

          <button
            type="button"
            onClick={confirmDeleteBanner}
            className="flex-1 py-3 px-5 text-sm font-semibold text-white bg-red-700 hover:bg-red-800 rounded-xl transition-colors cursor-pointer"
          >
            {t('banners.deleteModal.confirm', { defaultValue: 'Delete Permanently' })}
          </button>
        </div>
      </div>
    </div>
  );
};
