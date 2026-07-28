import { useQuery } from '@tanstack/react-query';
import { getVendorProfile } from '../../../services/vendorProfile';
import { getVendorOnboardingStatus } from '../../../services/auth';
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
    },
    refetchOnWindowFocus: false,
    retry: 1,
  });
};
