import { useQuery, keepPreviousData } from '@tanstack/react-query';
import {
  getRevenueOverviewKpis,
  getRevenueOverviewSales,
  getRevenueOverviewOrdersSummary,
  type RevenueOverviewKpisParams,
  type RevenueOverviewSalesParams,
  type RevenueOverviewOrdersSummaryParams,
} from '../../../services/revenueOverview';

export function useRevenueOverviewKpis(params: RevenueOverviewKpisParams) {
  return useQuery({
    queryKey: ['revenue-overview-kpis', params],
    queryFn: () => getRevenueOverviewKpis(params),
    enabled: Boolean(params.dateFrom && params.dateTo),
    staleTime: 2 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
}

export function useRevenueOverviewSales(params: RevenueOverviewSalesParams) {
  return useQuery({
    queryKey: ['revenue-overview-sales', params],
    queryFn: () => getRevenueOverviewSales(params),
    enabled: Boolean(params.dateFrom && params.dateTo && params.groupBy),
    staleTime: 2 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
}

export function useRevenueOverviewOrdersSummary(params: RevenueOverviewOrdersSummaryParams) {
  return useQuery({
    queryKey: ['revenue-overview-orders-summary', params],
    queryFn: () => getRevenueOverviewOrdersSummary(params),
    enabled: Boolean(params.dateFrom && params.dateTo),
    staleTime: 2 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
}

export function getDateFromToParams(dateRangeKey: string): { dateFrom: string; dateTo: string } {
  const now = new Date();
  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  const dateTo = formatDate(now);
  let dateFrom = dateTo;

  if (dateRangeKey === 'last7Days') {
    const from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    dateFrom = formatDate(from);
  } else if (dateRangeKey === 'last30Days') {
    const from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    dateFrom = formatDate(from);
  } else if (dateRangeKey === 'thisMonth') {
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    dateFrom = formatDate(from);
  } else if (dateRangeKey === 'thisYear') {
    const from = new Date(now.getFullYear(), 0, 1);
    dateFrom = formatDate(from);
  } else {
    const from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    dateFrom = formatDate(from);
  }

  return { dateFrom, dateTo };
}
