import { api } from './api';

export interface ApiShippingZone {
  id: string;
  code: string;
  nameEn: string;
  nameAr: string;
  isEnabled: boolean;
  vendorsCount?: number;
}

export const getAdminShippingZones = async (): Promise<ApiShippingZone[]> => {
  const { data } = await api.get('/admin/shipping/zones');
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data as ApiShippingZone[];
  return [];
};

export const updateAdminShippingZoneStatus = async (
  code: string,
  isEnabled: boolean
): Promise<ApiShippingZone> => {
  const { data } = await api.put(`/admin/shipping/zones/${code}`, { isEnabled });
  if (data?.data) return data.data as ApiShippingZone;
  return data as ApiShippingZone;
};
