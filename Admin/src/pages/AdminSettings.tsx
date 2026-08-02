import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAdminSettingsStore } from '../features/adminSettings/store';
import { PlatformSettingsForm } from '../features/adminSettings/components/PlatformSettingsForm';
import { AdminQuickActionsCards } from '../features/adminSettings/components/AdminQuickActionsCards';
import { BannersList } from '../features/adminSettings/components/BannersList';
import { BannerForm } from '../features/adminSettings/components/BannerForm';
import { DeleteBannerModal as DeleteBannerModalComponent } from '../features/adminSettings/components/DeleteBannerModal';
import { AdminsList } from '../features/adminSettings/components/AdminsList';
import { AdminForm } from '../features/adminSettings/components/AdminForm';
import { DeleteAdminModal } from '../features/adminSettings/components/DeleteAdminModal';
import { EmailExistsModal } from '../features/adminSettings/components/EmailExistsModal';
import { ShippingZonesList } from '../features/adminSettings/components/ShippingZonesList';
import { DisableZoneModal } from '../features/adminSettings/components/DisableZoneModal';

// Mobile Components
import { MobilePlatformSettings } from '../features/adminSettings/mobile/MobilePlatformSettings';
import { MobileBannersList } from '../features/adminSettings/mobile/MobileBannersList';
import { MobileBannerForm } from '../features/adminSettings/mobile/MobileBannerForm';
import { MobileAdminsList } from '../features/adminSettings/mobile/MobileAdminsList';
import { MobileAdminForm } from '../features/adminSettings/mobile/MobileAdminForm';
import { MobileShippingZonesList } from '../features/adminSettings/mobile/MobileShippingZonesList';

const AdminSettings: React.FC = () => {
  const { t } = useTranslation();
  const { viewMode, setViewMode } = useAdminSettingsStore();

  return (
    <div className="sidebar-page-container p-4 sm:p-6 lg:p-8 w-full min-h-screen">
      {/* Platform Settings Main View */}
      {viewMode === 'settings' && (
        <>
          {/* Mobile View */}
          <div className="block lg:hidden">
            <MobilePlatformSettings />
          </div>

          {/* Desktop View */}
          <div className="hidden lg:block space-y-6">
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
                  onManageShipping={() => setViewMode('shipping-zones')}
                  onManageAdmins={() => setViewMode('admins')}
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Banners Listing View */}
      {viewMode === 'banners' && (
        <>
          <div className="block md:hidden">
            <MobileBannersList />
          </div>
          <div className="hidden md:block">
            <BannersList />
          </div>
        </>
      )}

      {/* Add New Banner View */}
      {viewMode === 'banners-add' && (
        <>
          <div className="block md:hidden">
            <MobileBannerForm mode="add" />
          </div>
          <div className="hidden md:block">
            <BannerForm mode="add" />
          </div>
        </>
      )}

      {/* Edit Banner View */}
      {viewMode === 'banners-edit' && (
        <>
          <div className="block md:hidden">
            <MobileBannerForm mode="edit" />
          </div>
          <div className="hidden md:block">
            <BannerForm mode="edit" />
          </div>
        </>
      )}

      {/* Admins Listing View */}
      {viewMode === 'admins' && (
        <>
          <div className="block md:hidden">
            <MobileAdminsList />
          </div>
          <div className="hidden md:block">
            <AdminsList />
          </div>
        </>
      )}

      {/* Add New Admin View */}
      {viewMode === 'admins-add' && (
        <>
          <div className="block md:hidden">
            <MobileAdminForm mode="add" />
          </div>
          <div className="hidden md:block">
            <AdminForm mode="add" />
          </div>
        </>
      )}

      {/* Edit Admin View */}
      {viewMode === 'admins-edit' && (
        <>
          <div className="block md:hidden">
            <MobileAdminForm mode="edit" />
          </div>
          <div className="hidden md:block">
            <AdminForm mode="edit" />
          </div>
        </>
      )}

      {/* Shipping Zones View */}
      {viewMode === 'shipping-zones' && (
        <>
          <div className="block md:hidden">
            <MobileShippingZonesList />
          </div>
          <div className="hidden md:block">
            <ShippingZonesList />
          </div>
        </>
      )}

      {/* Modals */}
      <DeleteBannerModalComponent />
      <DeleteAdminModal />
      <EmailExistsModal />
      <DisableZoneModal />
    </div>
  );
};

export default AdminSettings;