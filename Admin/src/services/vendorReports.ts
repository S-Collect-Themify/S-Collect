import { api } from './api';

export interface VendorSalesReportSummary {
  vendorGmv: number;
  platformCommission: number;
  totalPayouts: number;
  netVendorPayable: number;
  pendingPayout: number;
}

export interface BackendSalesReportOrderItem {
  orderId: string;
  orderNumber: number | string;
  date: string;
  amount: number;
  commission: number;
  net: number;
  overallStatus: string;
}

export interface BackendSalesReportOrdersResponse {
  items: BackendSalesReportOrderItem[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface GetSalesReportParams {
  dateFrom: string;
  dateTo: string;
  pageNum?: number;
  pageSize?: number;
  vendorId?: string;
}

/**
 * Fetch vendor sales report summary GET /api/v1/admin/vendor-sales-report/summary
 */
export async function getVendorSalesReportSummary(
  params: GetSalesReportParams
): Promise<VendorSalesReportSummary> {
  const queryParams: Record<string, any> = {
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
  };
  if (params.vendorId) {
    queryParams.vendorId = params.vendorId;
  }

  const response = await api.get('/admin/vendor-sales-report/summary', {
    params: queryParams,
  });

  const resData = response.data;
  if (resData && typeof resData === 'object' && 'data' in resData && resData.data) {
    return resData.data as VendorSalesReportSummary;
  }
  return resData as VendorSalesReportSummary;
}

/**
 * Fetch vendor sales report orders GET /api/v1/admin/vendor-sales-report/orders
 */
export async function getVendorSalesReportOrders(
  params: GetSalesReportParams
): Promise<BackendSalesReportOrdersResponse> {
  const queryParams: Record<string, any> = {
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
    pageNum: params.pageNum ?? 1,
    pageSize: params.pageSize ?? 25,
  };
  if (params.vendorId) {
    queryParams.vendorId = params.vendorId;
  }

  const response = await api.get('/admin/vendor-sales-report/orders', {
    params: queryParams,
  });

  const resData = response.data;
  const obj = (resData && typeof resData === 'object' && 'data' in resData && resData.data)
    ? resData.data
    : resData;

  const items: BackendSalesReportOrderItem[] = Array.isArray(obj?.items)
    ? obj.items
    : Array.isArray(obj)
    ? obj
    : [];

  const pagination = (obj?.pagination as any) || {
    currentPage: params.pageNum ?? 1,
    pageSize: params.pageSize ?? 25,
    totalItems: items.length,
    totalPages: 1,
  };

  return {
    items,
    pagination: {
      currentPage: Number(pagination.currentPage ?? 1),
      pageSize: Number(pagination.pageSize ?? 25),
      totalItems: Number(pagination.totalItems ?? items.length),
      totalPages: Number(pagination.totalPages ?? 1),
    },
  };
}
