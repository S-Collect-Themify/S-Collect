import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
<<<<<<< HEAD
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
=======
import { updateVendorBankInfo, type UpdateVendorBankInfoParams } from '../../../services/vendorProfile';
import type { BankAccountFormValues } from '../BankSettings';
import { BANK_INFO_QUERY_KEY } from './useBankInfo';
import { STORE_PROFILE_QUERY_KEY } from './useStoreProfile';
import { getErrorMessage } from '../../../types/api';

export const useUpdateBankInfo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BankAccountFormValues) => {
      const cached = queryClient.getQueryData<BankAccountFormValues>(BANK_INFO_QUERY_KEY);
      const params: UpdateVendorBankInfoParams = {};
      let hasChanges = false;

      if (!cached || data.bankName !== cached.bankName) {
        params.bankName = data.bankName;
        hasChanges = true;
      }

      if (!cached || data.accountHolderName !== cached.accountHolderName) {
        params.accountHolderName = data.accountHolderName;
        hasChanges = true;
      }

      const isIbanModified = cached ? data.iban !== cached.iban : data.iban !== '';
      const isIbanMasked = data.iban.includes('*');

      if (isIbanModified && !isIbanMasked) {
        params.iban = data.iban;
        hasChanges = true;
      }

      if (!hasChanges) {
        return cached || data;
      }

      const rawResponse = await updateVendorBankInfo(params);
      const response = rawResponse && typeof rawResponse === 'object' && 'success' in rawResponse && 'data' in rawResponse
        ? (rawResponse as any).data
        : rawResponse;
      return {
        bankName: response.bankName,
        iban: response.ibanMasked,
        accountHolderName: response.accountHolderName,
      };
    },
    onSuccess: (updatedData) => {
      queryClient.setQueryData(BANK_INFO_QUERY_KEY, updatedData);
      queryClient.invalidateQueries({ queryKey: BANK_INFO_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: STORE_PROFILE_QUERY_KEY });
    },
    onError: (err: unknown) => {
      console.error('Failed to update bank info:', err);
      const msg = getErrorMessage(err, 'Failed to update bank information');
>>>>>>> 4f2a744b5a6cfedce0edc3751dc4020621939ed8
      toast.error(msg);
    },
  });
};
