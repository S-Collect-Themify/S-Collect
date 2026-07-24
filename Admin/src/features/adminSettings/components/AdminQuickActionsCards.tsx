import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAdminSettingsStore } from '../store';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import i18n from '../../../i18n';

interface AdminQuickActionsCardsProps {
  onManageShipping?: () => void;
  onManageAdmins?: () => void;
}

export const AdminQuickActionsCards: React.FC<AdminQuickActionsCardsProps> = ({
  onManageShipping,
  onManageAdmins,
}) => {
  const { t } = useTranslation();
  const { setViewMode } = useAdminSettingsStore();
  const isArabic = i18n.language === 'ar';

  const ArrowIcon = isArabic ? ArrowLeft : ArrowRight;

  return (
    <div className="flex flex-col gap-4">
      {/* Admin Accounts Card */}
      <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-xs flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-1">
            {t('adminSettings.adminAccounts.title', { defaultValue: 'Admin Accounts' })}
          </h3>
          <p className="text-xs text-gray-500 font-normal">
            {t('adminSettings.adminAccounts.description', {
              defaultValue: 'Manage platform admin accounts and permissions',
            })}
          </p>
        </div>
        <button
          type="button"
          onClick={onManageAdmins}
          className="bg-black hover:bg-gray-800 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0"
        >
          {t('adminSettings.adminAccounts.button', { defaultValue: 'Manage Admins' })}
          <ArrowIcon size={14} />
        </button>
      </div>

      {/* Banners Card */}
      <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-xs flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-1">
            {t('adminSettings.bannersCard.title', { defaultValue: 'Banners' })}
          </h3>
          <p className="text-xs text-gray-500 font-normal">
            {t('adminSettings.bannersCard.description', {
              defaultValue: 'Manage homepage banners and promotional slots',
            })}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setViewMode('banners')}
          className="bg-black hover:bg-gray-800 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0"
        >
          {t('adminSettings.bannersCard.button', { defaultValue: 'Manage Banners' })}
          <ArrowIcon size={14} />
        </button>
      </div>

      {/* Shipping Management Card */}
      <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-xs flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-1">
            {t('adminSettings.shippingCard.title', { defaultValue: 'Shipping Management' })}
          </h3>
          <p className="text-xs text-gray-500 font-normal">
            {t('adminSettings.shippingCard.description', {
              defaultValue: 'Manage shipping zones and view vendor rates',
            })}
          </p>
        </div>
        <button
          type="button"
          onClick={onManageShipping}
          className="bg-black hover:bg-gray-800 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0"
        >
          {t('adminSettings.shippingCard.button', { defaultValue: 'Manage Shipping' })}
          <ArrowIcon size={14} />
        </button>
      </div>
    </div>
  );
};
