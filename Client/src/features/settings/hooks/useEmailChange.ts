import { useMutation, useQueryClient } from '@tanstack/react-query';
import { changeEmail, confirmChangeEmail } from '../../../services/auth';
import { ACCOUNT_SETTINGS_QUERY_KEY } from './useAccountSettings';

export const useRequestEmailChange = () => {
  return useMutation({
    mutationFn: (newEmail: string) => changeEmail(newEmail),
    onError: (err: unknown) => {
      console.error('Email change request failed:', err);
    },
  });
};

export const useConfirmEmailChange = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      code,
      newEmail,
    }: {
      code: string;
      newEmail: string;
    }) => {
      const refreshToken = localStorage.getItem('refreshToken') || '';
      const response = await confirmChangeEmail(code, refreshToken);
      return { response, newEmail };
    },
    onSuccess: ({ newEmail }) => {
      queryClient.setQueryData(ACCOUNT_SETTINGS_QUERY_KEY, (oldData: any) =>
        oldData ? { ...oldData, email: newEmail } : oldData
      );
      queryClient.invalidateQueries({ queryKey: ACCOUNT_SETTINGS_QUERY_KEY });
    },
    onError: (err: unknown) => {
      console.error('Email change confirmation failed:', err);
    },
  });
};
