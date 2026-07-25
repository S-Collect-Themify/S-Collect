import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useAdminSettingsStore } from '../store';
import i18n from '../../../i18n';

export const VendorShippingRatesReport: React.FC = () => {
  const { t } = useTranslation();
  const { selectedZoneForReport, vendorRates, setViewMode } = useAdminSettingsStore();
  const isArabic = i18n.language === 'ar';
  const ChevronIcon = isArabic ? ChevronLeft : ChevronRight;

  const zoneDisplayName = selectedZoneForReport
    ? selectedZoneForReport.name.replace(' Region', '')
    : 'Riyadh';

  return (
    <div className="space-y-6">
      {/* Header & Breadcrumbs */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          {t('shippingZones.ratesTitle', { defaultValue: 'Vendor Shipping Rates' })}
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
          <button
            type="button"
            onClick={() => setViewMode('shipping-zones')}
            className="hover:text-black transition-colors cursor-pointer"
          >
            {t('shippingZones.title', { defaultValue: 'Shipping Zones' })}
          </button>
          <ChevronIcon size={12} />
          <span className="text-gray-900 font-semibold">{zoneDisplayName}</span>
        </div>
      </div>

      {/* Vendor Shipping Rates Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-gray-50/80 text-gray-500 font-semibold border-b border-gray-100">
              <tr>
                <th className="py-4 px-6">
                  {t('shippingZones.table.vendorName', { defaultValue: 'Vendor Name' })}
                </th>
                <th className="py-4 px-6">
                  {t('shippingZones.table.standardRate', { defaultValue: 'Standard Rate (SAR)' })}
                </th>
                <th className="py-4 px-6">
                  {t('shippingZones.table.expressRate', { defaultValue: 'Express Rate (SAR)' })}
                </th>
                <th className="py-4 px-6 text-right rtl:text-left">
                  {t('shippingZones.table.lastUpdated', { defaultValue: 'Last Updated' })}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {vendorRates.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                  {/* Vendor Name */}
                  <td className="py-4 px-6 font-semibold text-gray-900">{item.vendorName}</td>

                  {/* Standard Rate */}
                  <td className="py-4 px-6 text-gray-700 font-medium">{item.standardRate} SAR</td>

                  {/* Express Rate */}
                  <td className="py-4 px-6 text-gray-700 font-medium">{item.expressRate} SAR</td>

                  {/* Last Updated */}
                  <td className="py-4 px-6 text-gray-500 text-right rtl:text-left">
                    {item.lastUpdated}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Note */}
        <div className="p-4 bg-gray-50/50 border-t border-gray-100">
          <p className="text-[11px] text-gray-400 font-normal">
            {t('shippingZones.footerNote', {
              defaultValue:
                '* Vendor rates are managed by vendors from their dashboard. Admin view only.',
            })}
          </p>
        </div>
      </div>
    </div>
  );
};
