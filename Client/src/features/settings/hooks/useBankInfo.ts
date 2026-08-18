import { useQuery } from '@tanstack/react-query';
import {
  getVendorBankInfo,
  getVendorProfile,
} from '../../../services/vendorProfile';
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
      try {
        const rawData = await getVendorBankInfo();
        const data =
          rawData &&
          typeof rawData === 'object' &&
          'success' in rawData &&
          'data' in rawData
            ? (rawData as any).data
            : rawData;

        return {
          ...defaultBankInfo,
          bankName: data.bankName || '',
          iban: data.iban || data.ibanMasked || '',
          accountHolderName: data.accountHolderName || '',
        };
      } catch {
        // Fallback to getVendorProfile if dedicated bank-info endpoint fails
        const rawData = await getVendorProfile();
        const data =
          rawData &&
          typeof rawData === 'object' &&
          'success' in rawData &&
          'data' in rawData
            ? (rawData as any).data
            : rawData;

        const bankName = data.bankName || data.bankInfo?.bankName || '';
        const iban =
          data.iban || data.ibanMasked || data.bankInfo?.ibanMasked || '';
        const accountHolderName =
          data.accountHolderName || data.bankInfo?.accountHolderName || '';

        return {
          ...defaultBankInfo,
          bankName,
          iban,
          accountHolderName,
        };
      }
    },
    refetchOnWindowFocus: false,
    retry: 1,
  });
};
