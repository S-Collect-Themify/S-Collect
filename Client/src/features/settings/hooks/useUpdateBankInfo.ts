import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { updateBankInfo, type BankInfoPayload, type BankInfoResponse } from '../../../services/vendorProfile';
import { getErrorMessage } from '../../../types/api';

export const BANK_INFO_QUERY_KEY = ['bankInfo'];

export const useUpdateBankInfo = () => {
  const queryClient = useQueryClient();

  return useMutation<BankInfoResponse, unknown, BankInfoPayload>({
    mutationFn: async (payload: BankInfoPayload) => {
      return await updateBankInfo(payload);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(BANK_INFO_QUERY_KEY, data);
      queryClient.invalidateQueries({ queryKey: BANK_INFO_QUERY_KEY });
    },
    onError: (err: unknown) => {
      console.error('Failed to update bank info:', err);
      const msg = getErrorMessage(err, 'Failed to update bank info');
      toast.error(msg);
    },
  });
};
