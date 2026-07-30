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
      const data =
        rawData &&
        typeof rawData === 'object' &&
        'success' in rawData &&
        'data' in rawData
          ? (rawData as any).data
          : rawData;

      const bankName = data.bankName || data.bankInfo?.bankName || '';
      const iban = data.ibanMasked || data.bankInfo?.ibanMasked || '';
      const accountHolderName =
        data.accountHolderName || data.bankInfo?.accountHolderName || '';

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
