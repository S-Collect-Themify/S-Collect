import { useQuery } from '@tanstack/react-query';
import { getVendorProfile } from '../../../services/vendorProfile';
<<<<<<< HEAD
import { getVendorOnboardingStatus } from '../../../services/auth';
=======
>>>>>>> 4f2a744b5a6cfedce0edc3751dc4020621939ed8
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

function parseStringValue(val: unknown): string {
  if (typeof val === 'string') return val;
  if (val && typeof val === 'object') {
    const obj = val as Record<string, any>;
    return obj.en || obj.ar || '';
  }
  return '';
}

export const useStoreProfile = () => {
  return useQuery<StoreProfileData>({
    queryKey: STORE_PROFILE_QUERY_KEY,
    queryFn: async () => {
<<<<<<< HEAD
      try {
        const data = await getVendorProfile();
        const logoUrlStr = parseStringValue(data.logoUrl) || null;
        const logoFileName = logoUrlStr
          ? logoUrlStr.split('/').pop() || null
          : null;

        return {
          ...defaultStoreProfile,
          id: data.id,
          storeName: parseStringValue(data.storeName),
          storeNameAr: parseStringValue(data.storeNameAr),
          storeDescription: parseStringValue(data.storeDescription),
          publicEmail: parseStringValue(data.publicEmail),
          phoneNumber: parseStringValue(data.publicPhoneNumber),
          storeLogoUrl: logoUrlStr,
          storeLogoFileName: logoFileName,
        };
      } catch (err) {
        // Fallback to onboarding status if profile endpoint returns empty or is not initialized
        try {
          const onboarding = await getVendorOnboardingStatus();
          return {
            ...defaultStoreProfile,
            storeName: onboarding.storeName || '',
            storeDescription:
              typeof onboarding.storeDescription === 'string'
                ? onboarding.storeDescription
                : '',
            publicEmail: onboarding.email || '',
            phoneNumber: onboarding.phoneNumber || '',
          };
        } catch {
          return defaultStoreProfile;
        }
      }
=======
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

      return {
        ...defaultStoreProfile,
        storeName: data.storeName || '',
        storeNameAr: data.storeNameAr || '',
        storeDescription: typeof data.storeDescription === 'string' ? data.storeDescription : '',
        publicEmail: typeof data.publicEmail === 'string' ? data.publicEmail : '',
        phoneNumber: typeof data.publicPhoneNumber === 'string' ? data.publicPhoneNumber : '',
        storeLogoUrl: data.logoUrl || null,
        storeLogoFileName: logoFileName,
        originalStoreNameAr: data.storeNameAr || '',
      };
>>>>>>> 4f2a744b5a6cfedce0edc3751dc4020621939ed8
    },
    refetchOnWindowFocus: false,
    retry: 1,
  });
};
