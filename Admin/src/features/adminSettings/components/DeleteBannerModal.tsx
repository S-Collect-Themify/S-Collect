import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useAdminSettingsStore } from '../store';
import { useBannersData } from '../hooks/useBannersData';

export const DeleteBannerModal: React.FC = () => {
  const { t } = useTranslation();
  const { deleteModal, closeDeleteModal } = useAdminSettingsStore();
  const { deleteBannerMutation } = useBannersData();

  if (!deleteModal.open || !deleteModal.banner) return null;

  const handleConfirm = async () => {
    if (deleteModal.banner) {
      try {
        await deleteBannerMutation.mutateAsync(deleteModal.banner.id);
        closeDeleteModal();
      } catch {
        // Error handled in mutation onError
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl border border-gray-100 relative">
        <div className="flex flex-col items-center">
          {/* Warning Icon Badge */}
          <div className="size-14 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4 border border-red-100">
            <AlertTriangle size={26} />
          </div>

          {/* Modal Title */}
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {t('banners.deleteModal.title', { defaultValue: 'Delete Banner' })}
          </h3>

          {/* Modal Message */}
          <p className="text-xs text-gray-500 leading-relaxed mb-6 max-w-xs">
            {t('banners.deleteModal.message', {
              defaultValue:
                'Are you sure you want to delete this banner? This action cannot be undone.',
            })}
          </p>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 w-full">
            <button
              type="button"
              onClick={closeDeleteModal}
              disabled={deleteBannerMutation.isPending}
              className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 text-xs font-semibold py-2.5 px-4 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              {t('common.cancel', { defaultValue: 'Cancel' })}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={deleteBannerMutation.isPending}
              className="w-full bg-red-600 hover:bg-red-700 text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition-colors cursor-pointer shadow-xs disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {deleteBannerMutation.isPending && <Loader2 size={14} className="animate-spin" />}
              {t('banners.deleteModal.confirm', { defaultValue: 'Delete Banner' })}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
