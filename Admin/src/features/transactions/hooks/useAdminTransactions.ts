import { useQuery, keepPreviousData } from '@tanstack/react-query';
import {
  getAdminTransactions,
  mapBackendTransactionToUI,
  type GetAdminTransactionsParams,
} from '../../../services/transactions';

export function useAdminTransactions(params: GetAdminTransactionsParams) {
  return useQuery({
    queryKey: ['admin-transactions', params],
    queryFn: () => getAdminTransactions(params),
    select: (res) => ({
      items: res.items.map(mapBackendTransactionToUI),
      pagination: res.pagination,
    }),
    staleTime: 2 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
}
