import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useAdminSettingsStore } from '../store';
import i18n from '../../../i18n';

export const MobileVendorShippingRatesReport: React.FC = () => {
  const { t } = useTranslation();
  const { selectedZoneForReport, vendorRates, setViewMode } = useAdminSettingsStore();
  const isArabic = i18n.language === 'ar';
  const BackChevron = isArabic ? ChevronRight : ChevronLeft;
  const NextChevron = isArabic ? ChevronLeft : ChevronRight;

  const zoneDisplayName = selectedZoneForReport
    ? selectedZoneForReport.name.replace(' Region', '')
    : 'Riyadh';

  return (
    <div className="space-y-5 w-full pb-8">
      {/* Header & Back Navigation */}
      <div>
        <div className="flex items-center gap-2 text-xs text-gray-400 font-medium mb-1">
          <button
            type="button"
            onClick={() => setViewMode('shipping-zones')}
            className="p-1 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors cursor-pointer"
            title="Back"
          >
            <BackChevron size={18} />
          </button>
          <span>
            {t('banners.breadcrumb.settings', { defaultValue: 'Settings' })} /{' '}
            {t('shippingZones.title', { defaultValue: 'Shipping Zones' })}
          </span>
        </div>

        <h1 className="text-xl font-bold text-gray-900 mb-1">
          {zoneDisplayName}
        </h1>
        <p className="text-xs font-semibold text-gray-900">
          {t('shippingZones.ratesTitle', { defaultValue: 'Vendor Shipping Rates' })}
        </p>
      </div>

      {/* Vendor Cards List */}
      <div className="space-y-3.5">
        {vendorRates.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs hover:border-gray-200 transition-all"
          >
            <h3 className="font-bold text-gray-900 text-sm mb-3">
              {item.vendorName}
            </h3>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <span className="text-[11px] text-gray-400 block font-normal mb-0.5">
                  {t('shippingZones.table.standardRateShort', { defaultValue: 'Standard Rate' })}
                </span>
                <span className="text-xs text-gray-900 font-bold block">
                  {item.standardRate} SAR
                </span>
              </div>

              <div>
                <span className="text-[11px] text-gray-400 block font-normal mb-0.5">
                  {t('shippingZones.table.expressRateShort', { defaultValue: 'Express Rate' })}
                </span>
                <span className="text-xs text-gray-900 font-bold block">
                  {item.expressRate} SAR
                </span>
              </div>

              <div>
                <span className="text-[11px] text-gray-400 block font-normal mb-0.5">
                  {t('shippingZones.table.lastUpdated', { defaultValue: 'Last Updated' })}
                </span>
                <span className="text-xs text-gray-500 font-normal block truncate">
                  {item.lastUpdated}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Disclaimer Note */}
      <p className="text-xs text-gray-400 font-normal leading-relaxed">
        {t('shippingZones.footerNote', {
          defaultValue:
            '* Vendor rates are managed by vendors from their dashboard. Admin view only.',
        })}
      </p>

      {/* Mobile Pagination Footer */}
      <div className="flex items-center justify-between pt-2">
        <span className="text-xs text-gray-500 font-medium">
          Showing 1-5 of {vendorRates.length}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled
            className="p-2 rounded-xl border border-gray-200 text-gray-300 cursor-not-allowed bg-white"
          >
            <BackChevron size={16} />
          </button>
          <button
            type="button"
            disabled
            className="p-2 rounded-xl border border-gray-200 text-gray-300 cursor-not-allowed bg-white"
          >
            <NextChevron size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
