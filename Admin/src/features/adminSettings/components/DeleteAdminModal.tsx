import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, ShieldAlert, Loader2 } from 'lucide-react';
import { useAdminSettingsStore } from '../store';
import { useAdminsData } from '../hooks/useAdminsData';

export const DeleteAdminModal: React.FC = () => {
  const { t } = useTranslation();
  const { deleteAdminModal, closeDeleteAdminModal } = useAdminSettingsStore();
  const { deleteAdminMutation } = useAdminsData();
  const { open, admin, isSuperAdminAlert } = deleteAdminModal;

  if (!open) return null;

  const handleConfirmDelete = async () => {
    if (admin) {
      try {
        await deleteAdminMutation.mutateAsync(admin.id);
        closeDeleteAdminModal();
      } catch {
        // Error is handled in mutation onError
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl border border-gray-100 relative">
        {isSuperAdminAlert ? (
          /* Cannot Delete Super Admin Alert */
          <div className="flex flex-col items-center">
            <div className="size-14 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4 border border-red-100">
              <ShieldAlert size={26} />
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {t('adminSettings.cannotDeleteSuperAdminTitle', { defaultValue: 'Cannot Delete Super Admin' })}
            </h3>

            <p className="text-xs text-gray-500 leading-relaxed mb-6 max-w-xs">
              {t('adminSettings.cannotDeleteSuperAdminDesc', {
                defaultValue:
                  'Super Admin accounts cannot be deleted. Please transfer Super Admin privileges to another admin first.',
              })}
            </p>

            <button
              type="button"
              onClick={closeDeleteAdminModal}
              className="w-full bg-black hover:bg-gray-800 text-white text-xs font-semibold py-3 px-4 rounded-xl transition-colors cursor-pointer"
            >
              {t('common.understood', { defaultValue: 'Understood' })}
            </button>
          </div>
        ) : (
          /* Standard Confirm Delete Admin */
          <div className="flex flex-col items-center">
            <div className="size-14 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4 border border-red-100">
              <AlertTriangle size={26} />
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {t('adminSettings.confirmDeleteAdminTitle', { defaultValue: 'Confirm Delete Admin' })}
            </h3>

            <p className="text-xs text-gray-500 leading-relaxed mb-6 max-w-xs">
              {t('adminSettings.confirmDeleteAdminDesc', {
                defaultValue:
                  'Are you sure you want to remove this admin? They will lose all access to the platform.',
              })}
            </p>

            <div className="grid grid-cols-2 gap-3 w-full">
              <button
                type="button"
                onClick={closeDeleteAdminModal}
                disabled={deleteAdminMutation.isPending}
                className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 text-xs font-semibold py-2.5 px-4 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                {t('common.cancel', { defaultValue: 'Cancel' })}
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleteAdminMutation.isPending}
                className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
              >
                {deleteAdminMutation.isPending && <Loader2 size={14} className="animate-spin" />}
                {t('adminSettings.deleteAdminBtn', { defaultValue: 'Delete Admin' })}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
