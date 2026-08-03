import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useAdminSettingsStore } from '../store';
import i18n from '../../../i18n';
import Toggle from '../../../components/ui/Toggle';

export const ShippingZonesList: React.FC = () => {
  const { t } = useTranslation();
  const { shippingZones, setViewMode, toggleShippingZoneStatus, viewZoneReport } =
    useAdminSettingsStore();
  const isArabic = i18n.language === 'ar';
  const ChevronIcon = isArabic ? ChevronLeft : ChevronRight;

  return (
    <div className="space-y-6">
      {/* Header & Breadcrumbs */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          {t('shippingZones.title', { defaultValue: 'Shipping Zones' })}
        </h1>
        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
          <button
            type="button"
            onClick={() => setViewMode('settings')}
            className="hover:text-black transition-colors cursor-pointer"
          >
            {t('banners.breadcrumb.settings', { defaultValue: 'Settings' })}
          </button>
          <ChevronIcon size={12} />
          <span className="text-gray-900 font-semibold">
            {t('shippingZones.title', { defaultValue: 'Shipping Zones' })}
          </span>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-gray-50/80 text-gray-500 font-semibold border-b border-gray-100">
              <tr>
                <th className="py-4 px-6">
                  {t('shippingZones.table.zoneName', { defaultValue: 'Zone Name' })}
                </th>
                <th className="py-4 px-6">
                  {t('shippingZones.table.vendorsCount', { defaultValue: 'Vendors Count' })}
                </th>
                <th className="py-4 px-6">
                  {t('shippingZones.table.status', { defaultValue: 'Status' })}
                </th>
                <th className="py-4 px-6 text-right rtl:text-left">
                  {t('shippingZones.table.actions', { defaultValue: 'Actions' })}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {shippingZones.map((zone) => (
                <tr key={zone.id} className="hover:bg-gray-50/50 transition-colors">
                  {/* Zone Name */}
                  <td className="py-4 px-6 font-semibold text-gray-900">{zone.name}</td>

                  {/* Vendors Count */}
                  <td className="py-4 px-6 text-gray-500 font-normal">
                    {t('shippingZones.registeredVendors', {
                      count: zone.vendorsCount,
                      defaultValue: `${zone.vendorsCount} Registered Vendors`,
                    })}
                  </td>

                  {/* Status Toggle Switch */}
                  <td className="py-4 px-6">
                    <Toggle
                      checked={zone.isActive}
                      onChange={() => toggleShippingZoneStatus(zone)}
                    />
                  </td>

                  {/* Actions (View Report) */}
                  <td className="py-4 px-6 text-right rtl:text-left">
                    <button
                      type="button"
                      onClick={() => viewZoneReport(zone)}
                      className="font-semibold text-gray-900 underline hover:text-black transition-colors cursor-pointer"
                    >
                      {t('shippingZones.table.viewReport', { defaultValue: 'View Report' })}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
