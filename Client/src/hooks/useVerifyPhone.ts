import { useMutation } from '@tanstack/react-query';
import { verifyPhone } from '../services/auth';
import { getErrorMessage } from '../types/api';

export const useVerifyPhone = () => {
  const verifyMutation = useMutation({
    mutationFn: async ({ email, code }: { email: string; code: string }) => {
      try {
        const response = await verifyPhone(email, code);
        if (response && response.success === false) {
          throw new Error(response.message || 'Verification failed');
        }
        return response;
      } catch (error: unknown) {
        throw new Error(getErrorMessage(error, 'Verification failed'));
      }
    },
  });

  return {
    verify: verifyMutation.mutateAsync,
    isPending: verifyMutation.isPending,
    error: verifyMutation.error,
    reset: verifyMutation.reset,
  };
};
