import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react';
import { useAdminSettingsStore } from '../store';

export const DisableZoneModal: React.FC = () => {
  const { t } = useTranslation();
  const { disableZoneModal, closeDisableZoneModal, confirmDisableZone } = useAdminSettingsStore();
  const { open } = disableZoneModal;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center shadow-2xl border border-gray-100 relative">
        <div className="flex flex-col items-center">
          <div className="size-14 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4 border border-red-100">
            <AlertTriangle size={26} />
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {t('shippingZones.disableZoneTitle', { defaultValue: 'Disable Zone' })}
          </h3>

          <p className="text-xs text-gray-500 leading-relaxed mb-6 max-w-xs">
            {t('shippingZones.disableZoneDesc', {
              defaultValue:
                'This zone has active shipping orders. Disabling will only affect new orders placed after this change. Do you want to continue?',
            })}
          </p>

          <div className="grid grid-cols-2 gap-3 w-full">
            <button
              type="button"
              onClick={closeDisableZoneModal}
              className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 text-xs font-semibold py-2.5 px-4 rounded-lg transition-colors cursor-pointer"
            >
              {t('common.cancel', { defaultValue: 'Cancel' })}
            </button>
            <button
              type="button"
              onClick={confirmDisableZone}
              className="w-full bg-red-600 hover:bg-red-700 text-white text-xs font-semibold py-2.5 px-4 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              {t('shippingZones.disableZoneBtn', { defaultValue: 'Disable Zone' })}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
