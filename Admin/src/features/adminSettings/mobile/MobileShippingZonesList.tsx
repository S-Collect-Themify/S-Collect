import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useAdminSettingsStore } from '../store';
import { useShippingZonesData } from '../hooks/useShippingZonesData';
import { useAdminProfile } from '../../../hooks/useAdminProfile';
import { getToken, getDecodedToken } from '../../../services/auth';
import { ShippingZonesSkeleton } from '../components/skeletons/ShippingZonesSkeleton';
import i18n from '../../../i18n';
import Toggle from '../../../components/ui/Toggle';

export const MobileShippingZonesList: React.FC = () => {
  const { t } = useTranslation();
  const { setViewMode } = useAdminSettingsStore();
  const { shippingZones, isLoading, toggleZoneMutation } = useShippingZonesData();
  const { admin: currentLoggedInAdmin } = useAdminProfile();
  const isArabic = i18n.language === 'ar';
  const ChevronIcon = isArabic ? ChevronLeft : ChevronRight;

  const token = getToken();
  const decoded = useMemo(() => getDecodedToken(token), [token]);
  const roleStr = (currentLoggedInAdmin?.role || decoded?.role || '').toUpperCase();
  const isSuperAdmin = roleStr === 'SUPER_ADMIN' || roleStr === 'SUPERADMIN' || roleStr === 'SUPER ADMIN';

  const handleToggleZone = (zone: any) => {
    if (!isSuperAdmin) return;
    const targetCode = zone.code || zone.id;
    toggleZoneMutation.mutate({ code: targetCode, isEnabled: !zone.isActive });
  };

  return (
    <div className="space-y-5 w-full pb-8">
      {/* Header & Breadcrumbs */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 mb-0.5">
          {t('shippingZones.title', { defaultValue: 'Shipping Zones' })}
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
            {t('shippingZones.title', { defaultValue: 'Shipping Zones' })}
          </span>
        </div>
      </div>

      {/* Cards List */}
      {isLoading ? (
        <ShippingZonesSkeleton isMobile />
      ) : (
        <div className="space-y-3.5">
          {shippingZones.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 text-center text-gray-400 text-xs border border-gray-100">
              No shipping zones available.
            </div>
          ) : (
            shippingZones.map((zone) => (
              <div
                key={zone.id}
                className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs hover:border-gray-200 transition-all flex items-center justify-between gap-4"
              >
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-gray-900 text-sm mb-0.5">
                    {isArabic ? zone.nameAr || zone.nameEn || zone.name : zone.nameEn || zone.nameAr || zone.name}
                  </h3>
                  <p className="text-xs text-gray-400 font-normal">
                    {t('shippingZones.registeredVendors', {
                      count: zone.vendorsCount,
                      defaultValue: `${zone.vendorsCount} Registered Vendors`,
                    })}
                  </p>
                </div>

                <div className="shrink-0">
                  {isSuperAdmin ? (
                    <Toggle
                      checked={zone.isActive}
                      onChange={() => handleToggleZone(zone)}
                    />
                  ) : (
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        zone.isActive
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/50'
                          : 'bg-red-50 text-red-500 border border-red-100/50'
                      }`}
                    >
                      {zone.isActive
                        ? t('common.active', { defaultValue: 'Active' })
                        : t('common.inactive', { defaultValue: 'Inactive' })}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
