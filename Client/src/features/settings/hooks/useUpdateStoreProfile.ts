import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import type { StoreProfileData } from '../types';
import { STORE_PROFILE_QUERY_KEY } from './useStoreProfile';
import { updateVendorProfile } from '../../../services/vendorProfile';
import { getErrorMessage } from '../../../types/api';

function parseStringValue(val: unknown): string {
  if (typeof val === 'string') return val;
  if (val && typeof val === 'object') {
    const obj = val as Record<string, any>;
    return obj.en || obj.ar || '';
  }
  return '';
}

export const useUpdateStoreProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: StoreProfileData): Promise<StoreProfileData> => {
      const logoFile = data.logoFile instanceof File ? data.logoFile : null;

      const res = await updateVendorProfile({
        storeName: data.storeName,
        storeNameAr: data.storeNameAr,
        storeDescription: data.storeDescription,
        publicEmail: data.publicEmail,
        publicPhoneNumber: data.phoneNumber,
        logo: logoFile,
      });

      const logoUrlStr = parseStringValue(res.logoUrl) || data.storeLogoUrl;
      const logoFileName = logoUrlStr
        ? logoUrlStr.split('/').pop() || data.storeLogoFileName
        : null;

      return {
        ...data,
        id: res.id || data.id,
        storeName: parseStringValue(res.storeName) || data.storeName,
        storeNameAr: parseStringValue(res.storeNameAr) || data.storeNameAr,
        storeDescription: parseStringValue(res.storeDescription) || data.storeDescription,
        publicEmail: parseStringValue(res.publicEmail) || data.publicEmail,
        phoneNumber: parseStringValue(res.publicPhoneNumber) || data.phoneNumber,
        storeLogoUrl: logoUrlStr,
        storeLogoFileName: logoFileName,
      };
    },
    onSuccess: (updatedData) => {
      queryClient.setQueryData(STORE_PROFILE_QUERY_KEY, updatedData);
      queryClient.invalidateQueries({ queryKey: STORE_PROFILE_QUERY_KEY });
    },
    onError: (err: unknown) => {
      console.error('Failed to update store profile:', err);
      const msg = getErrorMessage(err, 'Failed to update store profile');
      toast.error(msg);
    },
  });
};
