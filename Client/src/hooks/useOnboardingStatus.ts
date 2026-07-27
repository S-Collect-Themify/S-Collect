import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
  getVendorOnboardingStatus,
  getToken,
  clearTokens,
  type VendorStatusResponse,
} from '../services/auth';

export const ONBOARDING_STATUS_QUERY_KEY = ['vendorOnboardingStatus'];

export function useOnboardingStatus() {
  const token = getToken();

  const query = useQuery<VendorStatusResponse>({
    queryKey: ONBOARDING_STATUS_QUERY_KEY,
    queryFn: getVendorOnboardingStatus,
    enabled: Boolean(token),
    retry: (failureCount, error: unknown) => {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const isUnauthorized =
    !token ||
    (query.isError &&
      axios.isAxiosError(query.error) &&
      query.error.response?.status === 401);

  if (isUnauthorized && token) {
    clearTokens();
  }

  return {
    ...query,
    token,
    isUnauthorized,
    status: query.data?.status ?? null,
    rejectionReason: query.data?.rejectionReason ?? null,
  };
}
