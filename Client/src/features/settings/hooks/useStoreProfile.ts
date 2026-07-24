import { useQuery } from '@tanstack/react-query';
import { getVendorOnboardingStatus } from '../../../services/auth';
import type { StoreProfileData } from '../types';

export const STORE_PROFILE_QUERY_KEY = ['storeProfile'];

const defaultStoreProfile: StoreProfileData = {
  storeName: '',
  storeDescription: '',
  publicEmail: '',
  phoneNumber: '',
  storeLogoUrl: null,
  storeLogoFileName: null,
};

export const useStoreProfile = () => {
  return useQuery<StoreProfileData>({
    queryKey: STORE_PROFILE_QUERY_KEY,
    queryFn: async () => {
      const data = await getVendorOnboardingStatus();
      return {
        ...defaultStoreProfile,
        storeName: data.storeName || '',
        storeDescription:
          typeof data.storeDescription === 'string' ? data.storeDescription : '',
        publicEmail: data.email || '',
        phoneNumber: data.phoneNumber || '',
      };
    },
    refetchOnWindowFocus: false,
    retry: 1,
  });
};
