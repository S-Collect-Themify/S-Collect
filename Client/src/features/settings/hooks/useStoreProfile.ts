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
      const data = rawData && typeof rawData === 'object' && 'success' in rawData && 'data' in rawData
        ? (rawData as any).data
        : rawData;
      
      let logoFileName: string | null = null;
      if (data.logoUrl) {
        try {
          const urlParts = data.logoUrl.split('/');
          logoFileName = urlParts[urlParts.length - 1] || 'logo';
        } catch {
          logoFileName = 'logo';
        }
      }

      const isLogoRemoved = typeof window !== 'undefined' && localStorage.getItem('vendor_logo_removed') === 'true';
      const storeLogoUrl = isLogoRemoved ? null : (data.logoUrl || null);
      const storeLogoFileName = isLogoRemoved ? null : logoFileName;

      return {
        ...defaultStoreProfile,
        storeName: data.storeName || '',
        storeNameAr: data.storeNameAr || '',
        storeDescription: typeof data.storeDescription === 'string' ? data.storeDescription : '',
        publicEmail: typeof data.publicEmail === 'string' ? data.publicEmail : '',
        phoneNumber: typeof data.publicPhoneNumber === 'string' ? data.publicPhoneNumber : '',
        storeLogoUrl,
        storeLogoFileName,
        originalStoreNameAr: data.storeNameAr || '',
      };
    },
    refetchOnWindowFocus: false,
    retry: 1,
  });
};
