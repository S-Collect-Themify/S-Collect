import { api } from './api';
import { getAdminOrders } from './orders';

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
  const queryParams = {
    ...params,
    startDate: params.dateFrom,
    endDate: params.dateTo,
    from: params.dateFrom,
    to: params.dateTo,
  };
  const response = await api.get('/admin/revenue-overview/kpis', { params: queryParams });
  const data = response.data;
  return data?.data || data;
}

/**
 * Fetch revenue overview sales GET /api/v1/admin/revenue-overview/sales
 */
export async function getRevenueOverviewSales(
  params: RevenueOverviewSalesParams
): Promise<RevenueOverviewSalesResponse> {
  const queryParams: Record<string, any> = {
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
    startDate: params.dateFrom,
    endDate: params.dateTo,
    from: params.dateFrom,
    to: params.dateTo,
    groupBy: params.groupBy,
  };

  try {
    const response = await api.get('/admin/revenue-overview/sales', { params: queryParams });
    const resData = response.data;
    const obj: any = resData?.data || resData || {};

    let points: SalesPoint[] = [];
    if (Array.isArray(obj.points)) points = obj.points;
    else if (Array.isArray(obj.data)) points = obj.data;
    else if (Array.isArray(resData)) points = resData;
    else if (Array.isArray(obj.sales)) points = obj.sales;
    else if (Array.isArray(obj.items)) points = obj.items;

    if (points && points.length > 0) {
      const normalizedPoints = points.map((pt: any) => ({
        periodStart: String(pt.periodStart || pt.date || pt.period || pt.label || ''),
        label: String(pt.label || pt.name || pt.periodStart || pt.date || ''),
        value: Number(pt.value ?? pt.sales ?? pt.total ?? pt.amount ?? 0),
      }));

      const totalVal = Number(obj.total ?? normalizedPoints.reduce((acc, p) => acc + p.value, 0));
      return {
        metric: obj.metric || 'sales',
        groupBy: params.groupBy,
        total: totalVal,
        points: normalizedPoints,
      };
    }
  } catch (err) {
    console.warn('GET /admin/revenue-overview/sales failed:', err);
  }

  // Fallback: Compute sales points directly from orders if backend returns empty or fails
  try {
    const ordersRes = await getAdminOrders({
      dateFrom: params.dateFrom,
      dateTo: params.dateTo,
      pageSize: 1000,
    });
    const orders = ordersRes?.items || [];

    const startDate = new Date(params.dateFrom);
    const endDate = new Date(params.dateTo);

    if (params.groupBy === 'month') {
      const monthsMap: Record<string, { label: string; value: number }> = {};
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      const curr = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
      const endMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

      while (curr <= endMonth) {
        const key = `${curr.getFullYear()}-${String(curr.getMonth() + 1).padStart(2, '0')}`;
        const label = `${monthNames[curr.getMonth()]} ${curr.getFullYear()}`;
        monthsMap[key] = { label, value: 0 };
        curr.setMonth(curr.getMonth() + 1);
      }

      for (const ord of orders) {
        if (ord.createdAt) {
          const d = new Date(ord.createdAt);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          if (monthsMap[key]) {
            monthsMap[key].value += Number(ord.grandTotalAmount || ord.subtotalAmount || 0);
          }
        }
      }

      const generatedPoints: SalesPoint[] = Object.entries(monthsMap).map(([key, val]) => ({
        periodStart: key,
        label: val.label,
        value: val.value,
      }));

      const grandTotal = generatedPoints.reduce((acc, p) => acc + p.value, 0);
      return {
        metric: 'sales',
        groupBy: 'month',
        total: grandTotal,
        points: generatedPoints,
      };
    } else {
      const daysMap: Record<string, { label: string; value: number }> = {};
      const curr = new Date(startDate);
      while (curr <= endDate) {
        const key = curr.toISOString().split('T')[0];
        const label = curr.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        daysMap[key] = { label, value: 0 };
        curr.setDate(curr.getDate() + 1);
      }

      for (const ord of orders) {
        if (ord.createdAt) {
          const key = ord.createdAt.split('T')[0];
          if (daysMap[key]) {
            daysMap[key].value += Number(ord.grandTotalAmount || ord.subtotalAmount || 0);
          }
        }
      }

      const generatedPoints: SalesPoint[] = Object.entries(daysMap).map(([key, val]) => ({
        periodStart: key,
        label: val.label,
        value: val.value,
      }));

      const grandTotal = generatedPoints.reduce((acc, p) => acc + p.value, 0);
      return {
        metric: 'sales',
        groupBy: params.groupBy,
        total: grandTotal,
        points: generatedPoints,
      };
    }
  } catch (fallbackErr) {
    console.error('Failed to compute sales overview fallback from orders:', fallbackErr);
  }

  return {
    metric: 'sales',
    groupBy: params.groupBy,
    total: 0,
    points: [],
  };
}

/**
 * Fetch revenue overview orders summary GET /api/v1/admin/revenue-overview/orders-summary
 */
export async function getRevenueOverviewOrdersSummary(
  params: RevenueOverviewOrdersSummaryParams
): Promise<RevenueOverviewOrdersSummaryResponse> {
  const queryParams = {
    ...params,
    startDate: params.dateFrom,
    endDate: params.dateTo,
    from: params.dateFrom,
    to: params.dateTo,
  };
  const response = await api.get('/admin/revenue-overview/orders-summary', { params: queryParams });
  const data = response.data;
  return data?.data || data;
}
