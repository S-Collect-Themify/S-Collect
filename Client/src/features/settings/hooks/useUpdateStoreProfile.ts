import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import type { StoreProfileData } from '../types';
import { STORE_PROFILE_QUERY_KEY } from './useStoreProfile';
import { getErrorMessage } from '../../../types/api';
import { updateVendorProfile } from '../../../services/vendorProfile';

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

      const isLogoRemoved = !data.storeLogoUrl && !!cached?.storeLogoUrl;

      // Do not upload or send the logo field unless the user selects a new image or removes it
      if (data.logoFile instanceof File) {
        formData.append('logo', data.logoFile);
        hasChanges = true;
      } else if (isLogoRemoved) {
        formData.append('logo', '');
        hasChanges = true;
      }

      if (!hasChanges) {
        return cached || data;
      }

      const rawResponse = await updateVendorProfile(formData);
      const response = rawResponse && typeof rawResponse === 'object' && 'success' in rawResponse && 'data' in rawResponse
        ? (rawResponse as any).data
        : rawResponse;
      
      const finalLogoUrl = isLogoRemoved ? null : (response?.logoUrl || null);

      let logoFileName: string | null = null;
      if (finalLogoUrl) {
        try {
          const urlParts = finalLogoUrl.split('/');
          logoFileName = urlParts[urlParts.length - 1] || 'logo';
        } catch {
          logoFileName = 'logo';
        }
      }

      const updatedProfile: StoreProfileData = {
        storeName: response?.storeName || data.storeName || '',
        storeNameAr: response?.storeNameAr || data.storeNameAr || '',
        storeDescription: typeof response?.storeDescription === 'string' ? response.storeDescription : (data.storeDescription || ''),
        publicEmail: typeof response?.publicEmail === 'string' ? response.publicEmail : (data.publicEmail || ''),
        phoneNumber: typeof response?.publicPhoneNumber === 'string' ? response.publicPhoneNumber : (data.phoneNumber || ''),
        storeLogoUrl: finalLogoUrl,
        storeLogoFileName: logoFileName,
        originalStoreNameAr: response?.storeNameAr || data.storeNameAr || '',
        logoFile: null,
      };

      return updatedProfile;
    },
    onSuccess: (updatedData) => {
      queryClient.setQueryData(STORE_PROFILE_QUERY_KEY, updatedData);
      queryClient.invalidateQueries({ queryKey: STORE_PROFILE_QUERY_KEY });
      toast.success('Store profile updated successfully!');
    },
    onError: (err: unknown) => {
      console.error('Failed to update store profile:', err);
      const msg = getErrorMessage(err, 'Failed to update store profile');
      toast.error(msg);
    },
  });
};
