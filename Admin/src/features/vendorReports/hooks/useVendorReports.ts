import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  getVendorSalesReportSummary,
  getVendorSalesReportOrders,
  type BackendSalesReportOrderItem,
  type VendorSalesReportSummary,
} from '../../../services/vendorReports';
import { exportToCSV, exportToPDF, type ExportSummaryStat } from '../../../utils/exportUtils';
import type { DateRangeKey, DetailedOrder, OrderStatus } from '../types';

export function getDateRangeStrings(rangeKey: DateRangeKey): { dateFrom: string; dateTo: string } {
  const now = new Date();
  const dateTo = now.toISOString().split('T')[0];
  let fromDate = new Date();

  switch (rangeKey) {
    case 'last7Days':
      fromDate.setDate(now.getDate() - 7);
      break;
    case 'last30Days':
      fromDate.setDate(now.getDate() - 30);
      break;
    case 'thisMonth':
      fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'thisYear':
      fromDate = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      fromDate.setDate(now.getDate() - 30);
      break;
  }

  const dateFrom = fromDate.toISOString().split('T')[0];
  return { dateFrom, dateTo };
}

function mapBackendOrderItemToDetailedOrder(item: BackendSalesReportOrderItem): DetailedOrder {
  const orderIdStr = item.orderId
    ? String(item.orderId).startsWith('#')
      ? String(item.orderId)
      : `#ORD-${String(item.orderId).slice(-6).toUpperCase()}`
    : item.orderNumber
    ? `#ORD-${String(item.orderNumber)}`
    : '--';

  let dateStr = '--';
  if (item.date) {
    const parsed = new Date(item.date);
    if (!isNaN(parsed.getTime())) {
      const day = String(parsed.getDate()).padStart(2, '0');
      const month = String(parsed.getMonth() + 1).padStart(2, '0');
      const year = parsed.getFullYear();
      dateStr = `${day}/${month}/${year}`;
    }
  }

  const amt = typeof item.amount === 'number' ? item.amount : parseFloat(item.amount) || 0;
  const comm = typeof item.commission === 'number' ? item.commission : parseFloat(item.commission) || 0;
  const net = typeof item.net === 'number' ? item.net : parseFloat(item.net) || 0;

  const rawStatus = (item.overallStatus || 'PENDING').toLowerCase();
  let parsedStatus: OrderStatus;
  if (['delivered', 'completed', 'accepted'].includes(rawStatus)) {
    parsedStatus = 'delivered';
  } else if (['canceled', 'cancelled', 'rejected'].includes(rawStatus)) {
    parsedStatus = 'canceled';
  } else if (['shipped', 'dispatched'].includes(rawStatus)) {
    parsedStatus = 'shipped';
  } else {
    parsedStatus = 'processing';
  }

  return {
    id: orderIdStr,
    date: dateStr,
    amount: Math.round(amt * 100) / 100,
    commission: Math.round(comm * 100) / 100,
    net: Math.round(net * 100) / 100,
    status: parsedStatus,
  };
}

export function useVendorSalesReportSummary(
  dateFrom: string,
  dateTo: string,
  vendorId?: string
) {
  return useQuery<VendorSalesReportSummary>({
    queryKey: ['vendor-sales-report-summary', dateFrom, dateTo, vendorId],
    queryFn: () => getVendorSalesReportSummary({ dateFrom, dateTo, vendorId }),
    enabled: !!dateFrom && !!dateTo && !!vendorId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useVendorReportOrders(
  dateFrom: string,
  dateTo: string,
  vendorId?: string,
  pageNum: number = 1,
  pageSize: number = 20
) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['vendor-sales-report-orders', dateFrom, dateTo, vendorId, pageNum, pageSize],
    queryFn: async () => {
      if (!dateFrom || !dateTo || !vendorId) {
        return { orders: [], totalOrdersCount: 0, totalPages: 1 };
      }
      const res = await getVendorSalesReportOrders({ dateFrom, dateTo, vendorId, pageNum, pageSize });
      const orders = res.items.map(mapBackendOrderItemToDetailedOrder);
      return {
        orders,
        totalOrdersCount: res.pagination?.totalItems ?? orders.length,
        totalPages: res.pagination?.totalPages ?? 1,
      };
    },
    enabled: !!dateFrom && !!dateTo && !!vendorId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Prefetch next page using React Query
  useEffect(() => {
    if (dateFrom && dateTo && vendorId && query.data && pageNum < query.data.totalPages) {
      queryClient.prefetchQuery({
        queryKey: ['vendor-sales-report-orders', dateFrom, dateTo, vendorId, pageNum + 1, pageSize],
        queryFn: async () => {
          const res = await getVendorSalesReportOrders({
            dateFrom,
            dateTo,
            vendorId,
            pageNum: pageNum + 1,
            pageSize,
          });
          const orders = res.items.map(mapBackendOrderItemToDetailedOrder);
          return {
            orders,
            totalOrdersCount: res.pagination?.totalItems ?? orders.length,
            totalPages: res.pagination?.totalPages ?? 1,
          };
        },
        staleTime: 5 * 60 * 1000,
      });
    }
  }, [dateFrom, dateTo, vendorId, query.data, pageNum, pageSize, queryClient]);

  return {
    orders: query.data?.orders ?? [],
    totalOrdersCount: query.data?.totalOrdersCount ?? 0,
    totalPages: query.data?.totalPages ?? 1,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export async function fetchAllVendorSalesReportOrders(params: {
  dateFrom: string;
  dateTo: string;
  vendorId?: string;
}): Promise<DetailedOrder[]> {
  const firstRes = await getVendorSalesReportOrders({
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
    vendorId: params.vendorId,
    pageNum: 1,
    pageSize: 100,
  });

  let items = [...firstRes.items];
  const totalPages = firstRes.pagination?.totalPages ?? 1;

  if (totalPages > 1) {
    const remainingPromises = [];
    for (let page = 2; page <= totalPages; page++) {
      remainingPromises.push(
        getVendorSalesReportOrders({
          dateFrom: params.dateFrom,
          dateTo: params.dateTo,
          vendorId: params.vendorId,
          pageNum: page,
          pageSize: 100,
        })
      );
    }
    const remainingResults = await Promise.all(remainingPromises);
    for (const res of remainingResults) {
      items = items.concat(res.items);
    }
  }

  return items.map(mapBackendOrderItemToDetailedOrder);
}

export interface ExportReportPayload {
  format: 'excel' | 'pdf';
  fileName: string;
  title: string;
  headers: Array<{ key: keyof DetailedOrder; label: string }>;
  dateFrom?: string;
  dateTo?: string;
  vendorId?: string;
  summaryStats?: ExportSummaryStat[];
  data?: DetailedOrder[];
}

export function useExportVendorReportMutation() {
  return useMutation({
    mutationFn: async (payload: ExportReportPayload) => {
      let exportData: DetailedOrder[] = payload.data ?? [];

      if (payload.dateFrom && payload.dateTo && payload.vendorId) {
        exportData = await fetchAllVendorSalesReportOrders({
          dateFrom: payload.dateFrom,
          dateTo: payload.dateTo,
          vendorId: payload.vendorId,
        });
      }

      if (!exportData.length) {
        throw new Error('No data available to export');
      }

      if (payload.format === 'excel') {
        exportToCSV(payload.fileName, payload.headers, exportData, payload.summaryStats);
      } else {
        exportToPDF(payload.title, payload.headers, exportData, payload.summaryStats);
      }
    },
    onSuccess: (_, variables) => {
      if (variables.format === 'excel') {
        toast.success('Vendor Sales Report exported to Excel successfully!');
      } else {
        toast.success('Vendor Sales Report exported to PDF successfully!');
      }
    },
    onError: (err: Error) => {
      toast.error(err?.message || 'Failed to export report');
    },
  });
}
