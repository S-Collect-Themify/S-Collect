import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronRight, ChevronLeft, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useAdminSettingsStore } from '../store';
import { useShippingZonesData } from '../hooks/useShippingZonesData';
import { useAdminProfile } from '../../../hooks/useAdminProfile';
import { getToken, getDecodedToken } from '../../../services/auth';
import type { ShippingZoneItem } from '../types';
import { ShippingZonesSkeleton } from './skeletons/ShippingZonesSkeleton';
import i18n from '../../../i18n';
import Toggle from '../../../components/ui/Toggle';

export const ShippingZonesList: React.FC = () => {
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

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    zone: ShippingZoneItem | null;
    targetStatus: boolean;
  }>({
    open: false,
    zone: null,
    targetStatus: true,
  });

  const handleToggleClick = (zone: ShippingZoneItem) => {
    setConfirmModal({
      open: true,
      zone,
      targetStatus: !zone.isActive,
    });
  };

  const handleCloseModal = () => {
    setConfirmModal({ open: false, zone: null, targetStatus: true });
  };

  const handleConfirmStatusChange = async () => {
    if (!confirmModal.zone) return;
    const targetCode = confirmModal.zone.code || confirmModal.zone.id;
    try {
      await toggleZoneMutation.mutateAsync({
        code: targetCode,
        isEnabled: confirmModal.targetStatus,
      });
    } catch {
      // Error handled in mutation onError
    } finally {
      handleCloseModal();
    }
  };

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
        {isLoading ? (
          <ShippingZonesSkeleton />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right text-xs border-collapse">
              <thead className="bg-gray-200 text-black font-semibold border-b border-gray-100">
                <tr>
                  <th className="py-4 px-6 text-left rtl:text-right">
                    {t('shippingZones.table.zoneName', { defaultValue: 'Zone Name' })}
                  </th>
                  <th className="py-4 px-6 text-left rtl:text-right">
                    {t('shippingZones.table.vendorsCount', { defaultValue: 'Vendors Count' })}
                  </th>
                  <th className="py-4 px-6 text-left rtl:text-right">
                    {t('shippingZones.table.status', { defaultValue: 'Status' })}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {shippingZones.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-gray-400">
                      No shipping zones available.
                    </td>
                  </tr>
                ) : (
                  shippingZones.map((zone) => (
                    <tr key={zone.id} className="hover:bg-gray-50/50 transition-colors">
                      {/* Zone Name */}
                      <td className="py-4 px-6 font-semibold text-gray-900 text-left rtl:text-right">
                        {isArabic ? zone.nameAr || zone.nameEn || zone.name : zone.nameEn || zone.nameAr || zone.name}
                      </td>

                      {/* Vendors Count */}
                      <td className="py-4 px-6 text-gray-500 font-normal text-left rtl:text-right">
                        {t('shippingZones.registeredVendors', {
                          count: zone.vendorsCount,
                          defaultValue: `${zone.vendorsCount} Registered Vendors`,
                        })}
                      </td>

                      {/* Status: Toggle Switch for Super Admin, Pill Badge for Admin */}
                      <td className="py-4 px-6 text-left rtl:text-right">
                        {isSuperAdmin ? (
                          <Toggle
                            checked={zone.isActive}
                            onChange={() => handleToggleClick(zone)}
                          />
                        ) : (
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
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
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmModal.open && confirmModal.zone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl border border-gray-100 relative">
            <div className="flex flex-col items-center">
              {confirmModal.targetStatus ? (
                <div className="size-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 border border-emerald-100">
                  <CheckCircle2 size={26} />
                </div>
              ) : (
                <div className="size-14 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4 border border-red-100">
                  <AlertTriangle size={26} />
                </div>
              )}

              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {confirmModal.targetStatus
                  ? isArabic
                    ? 'تفعيل منطقة الشحن'
                    : 'Enable Shipping Zone'
                  : isArabic
                    ? 'تعطيل منطقة الشحن'
                    : 'Disable Shipping Zone'}
              </h3>

              <p className="text-xs text-gray-500 leading-relaxed mb-6 max-w-xs">
                {confirmModal.targetStatus
                  ? isArabic
                    ? `هل أنت تأكد من تفعيل منطقة الشحن (${confirmModal.zone.nameAr || confirmModal.zone.nameEn || confirmModal.zone.name})؟ ستصبح متاحة للتوصيل فوراً.`
                    : `Are you sure you want to enable the shipping zone (${confirmModal.zone.nameEn || confirmModal.zone.nameAr || confirmModal.zone.name})? It will immediately become active.`
                  : isArabic
                    ? `هل أنت تأكد من تعطيل منطقة الشحن (${confirmModal.zone.nameAr || confirmModal.zone.nameEn || confirmModal.zone.name})؟ سيؤثر هذا التغيير على الطلبات الجديدة فقط.`
                    : `Are you sure you want to disable the shipping zone (${confirmModal.zone.nameEn || confirmModal.zone.nameAr || confirmModal.zone.name})? This will affect new orders placed after this change.`}
              </p>

              <div className="grid grid-cols-2 gap-3 w-full">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 text-xs font-semibold py-2.5 px-4 rounded-xl transition-colors cursor-pointer"
                >
                  {t('common.cancel', { defaultValue: 'Cancel' })}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmStatusChange}
                  disabled={toggleZoneMutation.isPending}
                  className={`w-full text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2 ${
                    confirmModal.targetStatus
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {toggleZoneMutation.isPending && <Loader2 size={14} className="animate-spin" />}
                  {confirmModal.targetStatus
                    ? isArabic
                      ? 'تفعيل المنطقة'
                      : 'Enable Zone'
                    : isArabic
                      ? 'تعطيل المنطقة'
                      : 'Disable Zone'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
