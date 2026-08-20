import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  getAdminTransactions,
  mapBackendTransactionToUI,
  type GetAdminTransactionsParams,
} from '../../../services/transactions';

export function useAdminTransactions(params: GetAdminTransactionsParams) {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  return useQuery({
    queryKey: ['admin-transactions', params, isAr ? 'ar' : 'en'],
    queryFn: () => getAdminTransactions(params),
    select: (res) => ({
      items: res.items.map(mapBackendTransactionToUI),
      pagination: res.pagination,
    }),
    staleTime: 2 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
}
