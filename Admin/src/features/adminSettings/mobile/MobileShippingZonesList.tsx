import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useAdminSettingsStore } from '../store';
import { useShippingZonesData } from '../hooks/useShippingZonesData';
import { ShippingZonesSkeleton } from '../components/skeletons/ShippingZonesSkeleton';
import i18n from '../../../i18n';
import Toggle from '../../../components/ui/Toggle';

export const MobileShippingZonesList: React.FC = () => {
  const { t } = useTranslation();
  const { setViewMode } = useAdminSettingsStore();
  const { shippingZones, isLoading, toggleZoneMutation } = useShippingZonesData();
  const isArabic = i18n.language === 'ar';
  const ChevronIcon = isArabic ? ChevronLeft : ChevronRight;

  const handleToggleZone = (zone: any) => {
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
                  <Toggle
                    checked={zone.isActive}
                    onChange={() => handleToggleZone(zone)}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
