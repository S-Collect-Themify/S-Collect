import { useQuery } from '@tanstack/react-query';
import { getAccountSettings, type AccountSettings } from '../../../services/account';

export const ACCOUNT_SETTINGS_QUERY_KEY = ['accountSettings'];

export const useAccountSettings = () => {
  return useQuery<AccountSettings>({
    queryKey: ACCOUNT_SETTINGS_QUERY_KEY,
    queryFn: getAccountSettings,
    refetchOnWindowFocus: false,
    retry: 1,
  });
};
