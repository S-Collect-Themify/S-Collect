import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import type { StoreProfileData } from '../types';
import { STORE_PROFILE_QUERY_KEY } from './useStoreProfile';
import { getErrorMessage } from '../../../types/api';

export const useUpdateStoreProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: StoreProfileData) => {
      // Return updated store profile data
      return data;
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
