import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { updateAccountSettings, type AccountSettings } from '../../../services/account';
import { ACCOUNT_SETTINGS_QUERY_KEY } from './useAccountSettings';
import { getErrorMessage } from '../../../types/api';

export const useUpdateAccountSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: Partial<AccountSettings>) => updateAccountSettings(settings),
    onSuccess: (updatedData) => {
      queryClient.setQueryData(ACCOUNT_SETTINGS_QUERY_KEY, (oldData: Partial<AccountSettings> | undefined) => ({
        ...oldData,
        ...updatedData,
      }));
      queryClient.invalidateQueries({ queryKey: ACCOUNT_SETTINGS_QUERY_KEY });
    },
    onError: (err: unknown) => {
      console.error('Failed to update account settings:', err);
      const msg = getErrorMessage(err, 'Failed to update account settings');
      toast.error(msg);
    },
  });
};
