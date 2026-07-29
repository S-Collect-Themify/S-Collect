import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { updateVendorBankInfo, type UpdateVendorBankInfoParams } from '../../../services/vendorProfile';
import type { BankAccountFormValues } from '../BankSettings';
import { BANK_INFO_QUERY_KEY } from './useBankInfo';
import { STORE_PROFILE_QUERY_KEY } from './useStoreProfile';
import { getErrorMessage } from '../../../types/api';
import { ServiceError } from '../../../services/api';

export const useUpdateBankInfo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BankAccountFormValues) => {
      const payload: UpdateVendorBankInfoParams = {
        bankName: data.bankName,
        iban: data.iban,
        accountHolderName: data.accountHolderName,
      };

      const rawResponse = await updateVendorBankInfo(payload);
      const response =
        rawResponse &&
        typeof rawResponse === 'object' &&
        'success' in rawResponse &&
        'data' in rawResponse
          ? (rawResponse as any).data
          : rawResponse;

      return {
        bankName: response.bankName,
        iban: response.ibanMasked || response.iban,
        accountHolderName: response.accountHolderName,
      };
    },
    onSuccess: (updatedData) => {
      queryClient.setQueryData(BANK_INFO_QUERY_KEY, updatedData);
      queryClient.invalidateQueries({ queryKey: BANK_INFO_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: STORE_PROFILE_QUERY_KEY });
      toast.success('Bank info updated successfully!');
    },
    onError: (err: unknown) => {
      console.error('Failed to update bank info:', err);
      let msg = getErrorMessage(err, 'Failed to update bank information');
      if (
        (err instanceof ServiceError && err.statusCode === 500) ||
        msg === 'An unexpected error occurred.'
      ) {
        msg = 'تعذر الحفظ (خطأ 500 من السيرفر): السيرفر واجه مشكلة داخلية أثناء تحديث الحساب البنكي.';
      }
      toast.error(msg);
    },
  });
};

