import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
  getVendorShippingSettings,
  updateVendorShippingSettings,
  updateFlatShippingRate,
  upsertZoneShippingRate,
  zoneCodeToRegionId,
  type VendorShippingSettings,
  type UpdateShippingPayload,
} from '../../../services/shipping';
import type { ShippingSettingsValues, Region } from '../Shippingsettingsform';
import { getErrorMessage } from '../../../types/api';

export const VENDOR_SHIPPING_QUERY_KEY = ['vendorShippingSettings'];

export const useVendorShipping = () => {
  const query = useQuery<VendorShippingSettings>({
    queryKey: VENDOR_SHIPPING_QUERY_KEY,
    queryFn: getVendorShippingSettings,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const rawData = query.data;

  const regionalRates: Record<string, number | undefined> = {};
  const regions: Region[] = [];

  if (rawData?.zoneRates && Array.isArray(rawData.zoneRates)) {
    rawData.zoneRates.forEach((zr) => {
      const regId = zoneCodeToRegionId(zr.zone);
      regionalRates[regId] = zr.rate;
      const formattedLabel = zr.zone
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase());
      regions.push({
        id: regId,
        label: formattedLabel,
      });
    });
  }

  const shippingValues: ShippingSettingsValues = {
    flatRate: rawData?.flatRate ?? 0,
    regionalRates,
  };

  const isConfigured = Boolean(
    rawData &&
      (rawData.flatRate !== null || (rawData.zoneRates && rawData.zoneRates.length > 0))
  );

  return {
    ...query,
    rawData,
    regions,
    shippingValues,
    isConfigured,
  };
};

export const useUpdateVendorShipping = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (payload: UpdateShippingPayload) => updateVendorShippingSettings(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VENDOR_SHIPPING_QUERY_KEY });
      toast.success(
        t('settings.toast.shippingSaved', { defaultValue: 'Shipping settings saved successfully' })
      );
    },
    onError: (err: unknown) => {
      console.error('Failed to save shipping settings:', err);
      const msg = getErrorMessage(err, 'Failed to save shipping settings');
      toast.error(msg);
    },
  });
};

export const useUpdateFlatShippingRate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (rate: number) => updateFlatShippingRate(rate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VENDOR_SHIPPING_QUERY_KEY });
    },
    onError: (err: unknown) => {
      console.error('Failed to update flat shipping rate:', err);
      const msg = getErrorMessage(err, 'Failed to update flat shipping rate');
      toast.error(msg);
    },
  });
};

export const useUpsertZoneShippingRate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ code, rate }: { code: string; rate: number }) =>
      upsertZoneShippingRate(code, rate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VENDOR_SHIPPING_QUERY_KEY });
    },
    onError: (err: unknown) => {
      console.error('Failed to upsert zone shipping rate:', err);
      const msg = getErrorMessage(err, 'Failed to update zone shipping rate');
      toast.error(msg);
    },
  });
};
