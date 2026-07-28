import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import type { StoreProfileData } from '../types';
import { STORE_PROFILE_QUERY_KEY } from './useStoreProfile';
import { updateVendorProfile } from '../../../services/vendorProfile';
import { getErrorMessage } from '../../../types/api';

export const useUpdateStoreProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: StoreProfileData) => {
      const cached = queryClient.getQueryData<StoreProfileData>(STORE_PROFILE_QUERY_KEY);
      const formData = new FormData();
      let hasChanges = false;

      if (!cached || data.storeName !== cached.storeName) {
        formData.append('storeName', data.storeName || data.storeNameAr);
        hasChanges = true;
      }

      if (!cached || data.storeNameAr !== cached.storeNameAr) {
        formData.append('storeNameAr', data.storeNameAr || data.storeName);
        hasChanges = true;
      }

      if (!cached || data.storeDescription !== cached.storeDescription) {
        formData.append('storeDescription', data.storeDescription);
        hasChanges = true;
      }

      if (!cached || data.publicEmail !== cached.publicEmail) {
        formData.append('publicEmail', data.publicEmail);
        hasChanges = true;
      }

      if (!cached || data.phoneNumber !== cached.phoneNumber) {
        formData.append('publicPhoneNumber', data.phoneNumber);
        hasChanges = true;
      }

      // Do not upload or send the logo field unless the user selects a new image
      if (data.logoFile instanceof File) {
        formData.append('logo', data.logoFile);
        hasChanges = true;
      }

      if (!hasChanges) {
        return cached || data;
      }

      const rawResponse = await updateVendorProfile(formData);
      const response = (
        rawResponse &&
        typeof rawResponse === 'object' &&
        'success' in rawResponse &&
        'data' in rawResponse
          ? (rawResponse as Record<string, unknown>).data
          : rawResponse
      ) as Record<string, unknown>;
      
      const logoUrl = typeof response.logoUrl === 'string' ? response.logoUrl : null;
      let logoFileName: string | null = null;
      if (logoUrl) {
        try {
          const urlParts = logoUrl.split('/');
          logoFileName = urlParts[urlParts.length - 1] || 'logo';
        } catch {
          logoFileName = 'logo';
        }
      }

      const storeName = typeof response.storeName === 'string' ? response.storeName : '';
      const storeNameAr = typeof response.storeNameAr === 'string' ? response.storeNameAr : '';

      return {
        storeName,
        storeNameAr,
        storeDescription: typeof response.storeDescription === 'string' ? response.storeDescription : '',
        publicEmail: typeof response.publicEmail === 'string' ? response.publicEmail : '',
        phoneNumber: typeof response.publicPhoneNumber === 'string' ? response.publicPhoneNumber : '',
        storeLogoUrl: logoUrl,
        storeLogoFileName: logoFileName,
        originalStoreNameAr: storeNameAr,
        logoFile: null,
      } as StoreProfileData;
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
