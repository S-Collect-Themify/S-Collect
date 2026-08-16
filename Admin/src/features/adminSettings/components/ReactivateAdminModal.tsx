import React from 'react';
import { useTranslation } from 'react-i18next';
import { UserCheck, Loader2 } from 'lucide-react';
import { useAdminSettingsStore } from '../store';
import { useAdminsData } from '../hooks/useAdminsData';

export const ReactivateAdminModal: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { reactivateAdminModal, closeReactivateAdminModal } = useAdminSettingsStore();
  const { toggleStatusMutation } = useAdminsData();
  const { open, admin } = reactivateAdminModal;

  if (!open || !admin) return null;

  const handleConfirmReactivate = async () => {
    try {
      await toggleStatusMutation.mutateAsync({
        id: admin.id,
        currentStatus: 'Inactive',
      });
      closeReactivateAdminModal();
    } catch {
      // Error handled by mutation onError
    }
  };

  const adminDisplayName =
    admin.name ||
    [admin.firstName, admin.lastName].filter(Boolean).join(' ') ||
    admin.email;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl border border-gray-100 relative">
        <div className="flex flex-col items-center">
          {/* Top Icon Badge */}
          <div className="size-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 border border-emerald-100">
            <UserCheck size={26} />
          </div>

          {/* Heading */}
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {t('adminSettings.confirmReactivateAdminTitle', {
              defaultValue: 'Reactivate Admin',
            })}
          </h3>

          {/* Description */}
          <p className="text-xs text-gray-500 leading-relaxed mb-6 max-w-xs">
            {i18n.language === 'ar' ? (
              <>
                هل أنت متأكد من إعادة تفعيل{' '}
                <span className="font-semibold text-gray-900">
                  {adminDisplayName}
                </span>
                ؟ سيستعيد المسؤول حق الوصول إلى لوحة الإدارة.
              </>
            ) : (
              <>
                Are you sure you want to reactivate{' '}
                <span className="font-semibold text-gray-900">
                  {adminDisplayName}
                </span>
                ? This will restore their access to the platform.
              </>
            )}
          </p>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 w-full">
            <button
              type="button"
              onClick={closeReactivateAdminModal}
              disabled={toggleStatusMutation.isPending}
              className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 text-xs font-semibold py-2.5 px-4 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              {t('common.cancel', { defaultValue: 'Cancel' })}
            </button>

            <button
              type="button"
              onClick={handleConfirmReactivate}
              disabled={toggleStatusMutation.isPending}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
            >
              {toggleStatusMutation.isPending && (
                <Loader2 size={14} className="animate-spin" />
              )}
              {t('adminSettings.reactivateAdminBtn', {
                defaultValue: 'Reactivate Admin',
              })}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReactivateAdminModal;
