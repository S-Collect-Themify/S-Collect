import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import {
  getPayoutBalance,
  getPayouts,
  exportPayouts,
  type PayoutListParams,
} from '../../services/payouts';
import { getErrorMessage } from '../../types/api';

/**
 * Hook to fetch vendor payout balance (eligible earnings, total paid out, pending balance)
 */
export const usePayoutBalance = () => {
  return useQuery({
    queryKey: ['payout-balance'],
    queryFn: getPayoutBalance,
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });
};

/**
 * Hook to fetch paginated payout history with automatic next-page prefetching
 */
export const usePayouts = (params?: PayoutListParams) => {
  const queryClient = useQueryClient();

  const pageNum = params?.pageNum ?? 1;
  const pageSize = params?.pageSize ?? 25;
  const dateFrom = params?.dateFrom ?? '';
  const dateTo = params?.dateTo ?? '';

  const query = useQuery({
    queryKey: ['payouts', pageNum, pageSize, dateFrom, dateTo],
    queryFn: () => getPayouts(params),
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });

  const currentPage = pageNum;
  const totalPages = query.data?.pagination?.totalPages ?? 0;

  useEffect(() => {
    if (currentPage < totalPages) {
      const nextParams: PayoutListParams = {
        ...params,
        pageNum: currentPage + 1,
      };
      queryClient.prefetchQuery({
        queryKey: [
          'payouts',
          currentPage + 1,
          pageSize,
          dateFrom,
          dateTo,
        ],
        queryFn: () => getPayouts(nextParams),
        staleTime: 2 * 60 * 1000,
      });
    }
  }, [currentPage, totalPages, pageSize, dateFrom, dateTo, queryClient]);

  return query;
};

/**
 * Hook to trigger Excel export download
 */
export const useExportPayouts = () => {
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (params?: PayoutListParams) => exportPayouts(params),
    onSuccess: () => {
      toast.success(
        t('receivables.exportSuccess', {
          defaultValue: 'Excel file exported successfully!',
        })
      );
    },
    onError: (err: unknown) => {
      const msg = getErrorMessage(
        err,
        t('receivables.exportError', {
          defaultValue: 'Failed to export Excel file.',
        })
      );
      toast.error(msg);
    },
  });
};
