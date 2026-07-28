import { useQuery } from '@tanstack/react-query';
import { getVendorProfile } from '../../../services/vendorProfile';
import type { StoreProfileData } from '../types';

export const STORE_PROFILE_QUERY_KEY = ['storeProfile'];

const defaultStoreProfile: StoreProfileData = {
  storeName: '',
  storeNameAr: '',
  storeDescription: '',
  publicEmail: '',
  phoneNumber: '',
  storeLogoUrl: null,
  storeLogoFileName: null,
  logoFile: null,
  originalStoreNameAr: '',
};

export const useStoreProfile = () => {
  return useQuery<StoreProfileData>({
    queryKey: STORE_PROFILE_QUERY_KEY,
    queryFn: async () => {
      const rawData = await getVendorProfile();
      const data = (
        rawData &&
        typeof rawData === 'object' &&
        'success' in rawData &&
        'data' in rawData
          ? (rawData as Record<string, unknown>).data
          : rawData
      ) as Record<string, unknown>;

      const logoUrl = typeof data.logoUrl === 'string' ? data.logoUrl : null;
      let logoFileName: string | null = null;
      if (logoUrl) {
        try {
          const urlParts = logoUrl.split('/');
          logoFileName = urlParts[urlParts.length - 1] || 'logo';
        } catch {
          logoFileName = 'logo';
        }
      }

      const storeName = typeof data.storeName === 'string' ? data.storeName : '';
      const storeNameAr = typeof data.storeNameAr === 'string' ? data.storeNameAr : '';

      return {
        ...defaultStoreProfile,
        storeName,
        storeNameAr,
        storeDescription: typeof data.storeDescription === 'string' ? data.storeDescription : '',
        publicEmail: typeof data.publicEmail === 'string' ? data.publicEmail : '',
        phoneNumber: typeof data.publicPhoneNumber === 'string' ? data.publicPhoneNumber : '',
        storeLogoUrl: logoUrl,
        storeLogoFileName: logoFileName,
        originalStoreNameAr: storeNameAr,
      };
    },
    refetchOnWindowFocus: false,
    retry: 1,
  });
};