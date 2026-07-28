import { useQuery } from '@tanstack/react-query';
import { getVendorProfile } from '../../../services/vendorProfile';
import type { BankAccountFormValues } from '../BankSettings';

export const BANK_INFO_QUERY_KEY = ['bankInfo'];

const defaultBankInfo: BankAccountFormValues = {
  bankName: '',
  iban: '',
  accountHolderName: '',
};

export const useBankInfo = () => {
  return useQuery<BankAccountFormValues>({
    queryKey: BANK_INFO_QUERY_KEY,
    queryFn: async () => {
      const rawData = await getVendorProfile();
      const data = (
        rawData &&
        typeof rawData === 'object' &&
        'success' in rawData &&
        'data' in rawData
          ? (rawData as Record<string, unknown>).data
          : rawData
      ) as Record<string, unknown>;
      
      const bankInfo = (data.bankInfo && typeof data.bankInfo === 'object') ? (data.bankInfo as Record<string, unknown>) : null;
      const bankName = (typeof data.bankName === 'string' ? data.bankName : null) || (typeof bankInfo?.bankName === 'string' ? bankInfo.bankName : '') || '';
      const iban = (typeof data.ibanMasked === 'string' ? data.ibanMasked : null) || (typeof bankInfo?.ibanMasked === 'string' ? bankInfo.ibanMasked : '') || '';
      const accountHolderName = (typeof data.accountHolderName === 'string' ? data.accountHolderName : null) || (typeof bankInfo?.accountHolderName === 'string' ? bankInfo.accountHolderName : '') || '';

      return {
        ...defaultBankInfo,
        bankName,
        iban,
        accountHolderName,
      };
    },
    refetchOnWindowFocus: false,
    retry: 1,
  });
};
