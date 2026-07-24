import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAdminSettingsStore } from '../features/adminSettings/store';
import { PlatformSettingsForm } from '../features/adminSettings/components/PlatformSettingsForm';
import { AdminQuickActionsCards } from '../features/adminSettings/components/AdminQuickActionsCards';
import { BannersList } from '../features/adminSettings/components/BannersList';
import { BannerForm } from '../features/adminSettings/components/BannerForm';
import { DeleteBannerModal } from '../features/adminSettings/components/DeleteBannerModal';
import { ShippingSettingsModal } from '../features/adminSettings/components/ShippingSettingsModal';
import { AdminAccountsModal } from '../features/adminSettings/components/AdminAccountsModal';

const AdminSettings: React.FC = () => {
  const { t } = useTranslation();
  const { viewMode } = useAdminSettingsStore();
  const [shippingModalOpen, setShippingModalOpen] = useState(false);
  const [adminsModalOpen, setAdminsModalOpen] = useState(false);

  return (
    <div className="sidebar-page-container p-4 sm:p-6 lg:p-8 w-full min-h-screen">
      {/* Platform Settings Main View */}
      {viewMode === 'settings' && (
        <div className="space-y-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {t('adminSettings.title', { defaultValue: 'Platform Settings' })}
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Card: Platform Settings Form */}
            <div className="lg:col-span-8 flex flex-col">
              <PlatformSettingsForm />
            </div>

            {/* Right Stack: Quick Action Cards */}
            <div className="lg:col-span-4">
              <AdminQuickActionsCards
                onManageShipping={() => setShippingModalOpen(true)}
                onManageAdmins={() => setAdminsModalOpen(true)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Banners Listing View */}
      {viewMode === 'banners' && <BannersList />}

      {/* Add New Banner View */}
      {viewMode === 'banners-add' && <BannerForm mode="add" />}

      {/* Edit Banner View */}
      {viewMode === 'banners-edit' && <BannerForm mode="edit" />}

      {/* Modals */}
      <DeleteBannerModal />
      <ShippingSettingsModal
        open={shippingModalOpen}
        onClose={() => setShippingModalOpen(false)}
      />
      <AdminAccountsModal
        open={adminsModalOpen}
        onClose={() => setAdminsModalOpen(false)}
      />
    </div>
  );
};

export default AdminSettings;