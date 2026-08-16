import { api } from './api';

export interface RevenueOverviewKpisParams {
  dateFrom: string;
  dateTo: string;
}

export interface RevenueOverviewKpisResponse {
  gmv: number;
  netRevenue: number;
  totalPayouts: number;
  pendingPayouts: number;
}

export interface RevenueOverviewSalesParams {
  dateFrom: string;
  dateTo: string;
  groupBy: 'day' | 'week' | 'month';
}

export interface SalesPoint {
  periodStart: string;
  label: string;
  value: number;
}

export interface RevenueOverviewSalesResponse {
  metric: string;
  groupBy: string;
  total: number;
  points: SalesPoint[];
}

export interface RevenueOverviewOrdersSummaryParams {
  dateFrom: string;
  dateTo: string;
}

export interface RevenueOverviewOrdersSummaryResponse {
  totalOrders: number;
  successCount: number;
  successRatePercent: number | string | Record<string, unknown>;
  byStatus: {
    delivered?: number;
    processing?: number;
    shipped?: number;
    [key: string]: number | undefined;
  };
}

/**
 * Fetch revenue overview KPIs GET /api/v1/admin/revenue-overview/kpis
 */
export async function getRevenueOverviewKpis(
  params: RevenueOverviewKpisParams
): Promise<RevenueOverviewKpisResponse> {
  const response = await api.get('/admin/revenue-overview/kpis', { params });
  const data = response.data;
  return data?.data || data;
}

/**
 * Fetch revenue overview sales GET /api/v1/admin/revenue-overview/sales
 */
export async function getRevenueOverviewSales(
  params: RevenueOverviewSalesParams
): Promise<RevenueOverviewSalesResponse> {
  const response = await api.get('/admin/revenue-overview/sales', { params });
  const data = response.data;
  return data?.data || data;
}

/**
 * Fetch revenue overview orders summary GET /api/v1/admin/revenue-overview/orders-summary
 */
export async function getRevenueOverviewOrdersSummary(
  params: RevenueOverviewOrdersSummaryParams
): Promise<RevenueOverviewOrdersSummaryResponse> {
  const response = await api.get('/admin/revenue-overview/orders-summary', { params });
  const data = response.data;
  return data?.data || data;
}
