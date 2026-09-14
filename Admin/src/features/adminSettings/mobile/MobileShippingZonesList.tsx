import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronRight, ChevronLeft, Save, Loader2 } from 'lucide-react';
import { useAdminSettingsStore } from '../store';
import { useShippingZonesData } from '../hooks/useShippingZonesData';
import { useAdminProfile } from '../../../hooks/useAdminProfile';
import { getToken, getDecodedToken } from '../../../services/auth';
import type { ShippingZoneItem } from '../types';
import { ShippingZonesSkeleton } from '../components/skeletons/ShippingZonesSkeleton';
import i18n from '../../../i18n';
import Toggle from '../../../components/ui/Toggle';

/** Local per-row state derived from the price draft the user typed. */
const getDraftState = (
  zone: ShippingZoneItem,
  drafts: Record<string, string>
): { dirty: boolean; invalid: boolean } => {
  const raw = drafts[zone.id];
  if (raw === undefined) return { dirty: false, invalid: false };
  const trimmed = raw.trim();
  if (trimmed === '') return { dirty: false, invalid: true };
  const n = Number(trimmed);
  if (!Number.isFinite(n) || n < 0) return { dirty: false, invalid: true };
  return { dirty: n !== Number(zone.rate ?? 0), invalid: false };
};

export const MobileShippingZonesList: React.FC = () => {
  const { t } = useTranslation();
  const { setViewMode } = useAdminSettingsStore();
  const { shippingZones, isLoading, toggleZoneMutation, saveZoneRatesMutation } = useShippingZonesData();
  const { admin: currentLoggedInAdmin } = useAdminProfile();
  const isArabic = i18n.language === 'ar';
  const ChevronIcon = isArabic ? ChevronLeft : ChevronRight;

  const token = getToken();
  const decoded = useMemo(() => getDecodedToken(token), [token]);
  const roleStr = (currentLoggedInAdmin?.role || decoded?.role || '').toUpperCase();
  const isSuperAdmin = roleStr === 'SUPER_ADMIN' || roleStr === 'SUPERADMIN' || roleStr === 'SUPER ADMIN';

  // Editable "Zone Price" drafts, keyed by zone id. Reset whenever the
  // server list changes (initial load / refetch after a save) using the
  // render-phase "reset state when a prop changes" pattern.
  const [rateDrafts, setRateDrafts] = useState<Record<string, string>>({});
  const [syncedZones, setSyncedZones] = useState(shippingZones);
  if (syncedZones !== shippingZones) {
    setSyncedZones(shippingZones);
    setRateDrafts({});
  }

  const rows = shippingZones.map((zone) => ({
    zone,
    ...getDraftState(zone, rateDrafts),
  }));
  const dirtyRows = rows.filter((r) => r.dirty);
  const hasInvalid = rows.some((r) => r.invalid);
  const canSave =
    isSuperAdmin && dirtyRows.length > 0 && !hasInvalid && !saveZoneRatesMutation.isPending;

  const rateValue = (zone: ShippingZoneItem) =>
    rateDrafts[zone.id] ?? String(zone.rate ?? 0);

  const handleRateChange = (zoneId: string, value: string) => {
    setRateDrafts((prev) => ({ ...prev, [zoneId]: value }));
  };

  const handleSaveRates = async () => {
    if (!canSave) return;
    const payload = dirtyRows.map((r) => ({
      code: r.zone.code || r.zone.id,
      rate: Number(rateDrafts[r.zone.id]),
    }));
    try {
      await saveZoneRatesMutation.mutateAsync(payload);
      setRateDrafts({});
    } catch {
      // Error handled in mutation onError
    }
  };

  const handleToggleZone = (zone: ShippingZoneItem) => {
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
            rows.map(({ zone, invalid }) => (
              <div
                key={zone.id}
                className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs hover:border-gray-200 transition-all"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-gray-900 text-sm">
                      {isArabic ? zone.nameAr || zone.nameEn || zone.name : zone.nameEn || zone.nameAr || zone.name}
                    </h3>
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

                {/* Zone Price */}
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between gap-4">
                  <span className="text-xs font-medium text-gray-500">
                    {t('shippingZones.table.zonePrice', { defaultValue: 'Zone Price (SAR)' })}
                  </span>
                  {isSuperAdmin ? (
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      inputMode="decimal"
                      value={rateValue(zone)}
                      onChange={(e) => handleRateChange(zone.id, e.target.value)}
                      className={`w-28 rounded-lg border px-2.5 py-1.5 text-xs font-medium text-gray-900 transition-colors focus:outline-none focus:ring-2 ${
                        invalid
                          ? 'border-red-300 focus:ring-red-100'
                          : 'border-gray-200 focus:ring-gray-100 focus:border-gray-300'
                      }`}
                    />
                  ) : (
                    <span className="text-xs font-semibold text-gray-900">
                      {Number(zone.rate ?? 0).toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Save bar for Zone Price edits */}
      {isSuperAdmin && !isLoading && (dirtyRows.length > 0 || hasInvalid) && (
        <div className="sticky bottom-4 z-10 flex items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 shadow-sm animate-in fade-in duration-200">
          <span className="text-[11px] font-semibold text-amber-900">
            {hasInvalid
              ? t('shippingZones.invalidPrice', {
                  defaultValue: 'Some prices are invalid. Enter a valid amount (0 or more).',
                })
              : t('shippingZones.unsavedPrices', {
                  count: dirtyRows.length,
                  defaultValue: `${dirtyRows.length} unsaved price change(s)`,
                })}
          </span>
          <button
            type="button"
            onClick={handleSaveRates}
            disabled={!canSave}
            className="shrink-0 flex items-center gap-2 rounded-xl bg-black px-4 py-2 text-[11px] font-semibold text-white shadow-2xs transition-all hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {saveZoneRatesMutation.isPending ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Save size={13} />
            )}
            <span>{t('shippingZones.saveChanges', { defaultValue: 'Save Changes' })}</span>
          </button>
        </div>
      )}
    </div>
  );
};
