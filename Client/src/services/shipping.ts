import { api } from './api';

export interface VendorZoneRate {
  zone: string;
  rate: number;
}

export interface VendorShippingSettings {
  flatRate: number | null;
  zoneRates: VendorZoneRate[];
}

export const regionIdToZoneCode = (id: string): string => {
  return id.toUpperCase().replace(/-/g, '_');
};

export const zoneCodeToRegionId = (code: string): string => {
  return code.toLowerCase().replace(/_/g, '-');
};

export const getVendorShippingSettings = async (): Promise<VendorShippingSettings> => {
  const { data } = await api.get('/vendor/shipping');
  const unwrapped = data && typeof data === 'object' && 'data' in data ? data.data : data;
  return unwrapped;
};

export const updateFlatShippingRate = async (rate: number): Promise<void> => {
  await api.put('/vendor/shipping/flat-rate', { rate });
};

export const upsertZoneShippingRate = async (code: string, rate: number): Promise<void> => {
  await api.put(`/vendor/shipping/zones/${code}`, { rate });
};

export interface UpdateShippingPayload {
  flatRate: number;
  regionalRates?: Record<string, number | undefined>;
}

export const updateVendorShippingSettings = async (payload: UpdateShippingPayload): Promise<void> => {
  if (payload.flatRate !== undefined && payload.flatRate !== null) {
    await updateFlatShippingRate(payload.flatRate);
  }

  if (payload.regionalRates) {
    const promises: Promise<void>[] = [];
    for (const [regionId, rate] of Object.entries(payload.regionalRates)) {
      const code = regionIdToZoneCode(regionId);
      if (rate !== undefined && rate !== null && !isNaN(rate) && rate > 0) {
        promises.push(upsertZoneShippingRate(code, rate));
      }
    }
    await Promise.all(promises);
  }
};
